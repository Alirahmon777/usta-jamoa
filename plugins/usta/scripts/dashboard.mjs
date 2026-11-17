#!/usr/bin/env node
// Serves the live dashboard on localhost: the prebuilt app from <plugin>/dashboard and the project's
// event log at /events.jsonl. No dependencies, no build step on the user's machine.
//
//   node dashboard.mjs [--port 4517] [--open]
//
// Running it again for the same project only prints the URL of the server that is already up.
import { spawn } from "node:child_process";
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { eventsPath } from "./events.mjs";
import { projectDir } from "./task-state.mjs";

const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dashboard");
const HOST = "127.0.0.1";
const PORT_ATTEMPTS = 10;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
  ".jsonl": "application/x-ndjson; charset=utf-8",
};

function send(response, status, type, body) {
  response.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  response.end(body);
}

/** A file inside APP_DIR, or null; anything else (../ tricks included) falls back to the SPA. */
function appFile(urlPath) {
  let file;
  try {
    file = path.join(APP_DIR, decodeURIComponent(urlPath));
  } catch {
    return null;
  }
  return file.startsWith(APP_DIR + path.sep) && existsSync(file) && statSync(file).isFile() ? file : null;
}

export function handler(project) {
  return (request, response) => {
    const { pathname } = new URL(request.url, "http://localhost");
    if (pathname === "/") {
      response.writeHead(302, { location: "/dashboard" });
      return response.end();
    }
    if (pathname === "/__usta") return send(response, 200, "application/json", JSON.stringify({ project }));
    if (pathname === "/events.jsonl") {
      const file = eventsPath(project);
      return send(response, 200, TYPES[".jsonl"], existsSync(file) ? readFileSync(file) : "");
    }
    const file = appFile(pathname) ?? path.join(APP_DIR, "index.html");
    send(response, 200, TYPES[path.extname(file)] ?? "application/octet-stream", readFileSync(file));
  };
}

/** The project a usta dashboard on this port serves, or null when the port holds something else. */
async function servedProject(port) {
  try {
    const response = await fetch(`http://${HOST}:${port}/__usta`, { signal: AbortSignal.timeout(1000) });
    return (await response.json()).project;
  } catch {
    return null;
  }
}

function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, HOST, () => resolve(port));
  });
}

function openBrowser(url) {
  const [command, ...args] =
    process.platform === "darwin" ? ["open"] : process.platform === "win32" ? ["cmd", "/c", "start", ""] : ["xdg-open"];
  spawn(command, [...args, url], { stdio: "ignore", detached: true }).on("error", () => {}).unref();
}

async function main() {
  const { values } = parseArgs({
    options: { port: { type: "string", default: process.env.USTA_DASHBOARD_PORT ?? "4517" }, open: { type: "boolean" } },
  });
  if (!existsSync(path.join(APP_DIR, "index.html"))) throw new Error(`Dashboard bundle not found in ${APP_DIR}`);
  const project = projectDir();
  const server = createServer(handler(project));

  for (let port = Number(values.port); port < Number(values.port) + PORT_ATTEMPTS; port++) {
    const url = `http://localhost:${port}/dashboard`;
    if ((await servedProject(port)) === project) {
      console.log(`usta dashboard is already running: ${url}`);
      return;
    }
    try {
      await listen(server, port);
      console.log(`usta dashboard: ${url}\nProject: ${project}\nStop it with Ctrl+C.`);
      if (values.open) openBrowser(url);
      return;
    } catch (error) {
      if (error.code !== "EADDRINUSE") throw error;
    }
  }
  throw new Error(`No free port in ${values.port}-${Number(values.port) + PORT_ATTEMPTS - 1}. Use --port.`);
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
