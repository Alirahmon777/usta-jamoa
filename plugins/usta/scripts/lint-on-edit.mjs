#!/usr/bin/env node
// PostToolUse hook: lint every JS/TS file right after an agent edits it and hand the problems back,
// so complexity, `any`, nested ternaries, layer violations and effect misuse get fixed immediately.
// Uses Biome when the project has it, otherwise ESLint. Output is one short line per problem.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const payload = JSON.parse(readFileSync(0, "utf8"));
const filePath = payload.tool_input?.file_path ?? "";
const projectDir = process.env.CLAUDE_PROJECT_DIR || payload.cwd || ".";
const bin = (name) => path.join(projectDir, "node_modules/.bin", name);

function run(command, args) {
  return spawnSync(command, args, { cwd: projectDir, encoding: "utf8" }).stdout || "";
}

function biomeProblems() {
  const report = JSON.parse(run(bin("biome"), ["lint", "--reporter=json", filePath]) || "{}");
  return (report.diagnostics ?? []).map((d) => {
    const at = d.location?.start?.line ? `${d.location.start.line}:${d.location.start.column} ` : "";
    return `${at}${d.category} - ${d.message}`;
  });
}

function eslintProblems() {
  return JSON.parse(run(bin("eslint"), ["--no-warn-ignored", "--format", "json", filePath]) || "[]").flatMap((file) =>
    file.messages.map((m) => `${m.line}:${m.column} ${m.ruleId ?? "parse"} - ${m.message.split("\n")[0]}`),
  );
}

if (/\.(m?[jt]sx?)$/.test(filePath)) {
  let problems = [];
  if (existsSync(bin("biome"))) problems = biomeProblems();
  else if (existsSync(bin("eslint"))) problems = eslintProblems();
  if (problems.length > 0) {
    process.stderr.write(`Lint: fix these in ${filePath} before continuing:\n${problems.join("\n")}\n`);
    process.exit(2);
  }
}
