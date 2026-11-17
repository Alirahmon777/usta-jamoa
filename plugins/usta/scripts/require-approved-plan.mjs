#!/usr/bin/env node
// PreToolUse hook: while a /task is active, block source edits until its plan is approved.
// Without an active task the plugin stays out of the way, unless the project opted in with
// {"requireTask": true} in .claude/usta.json: then every source edit needs /task first.
// The docs/ memory folders are always writable; the gate's own files never are.
import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { projectConfig, readTask } from "./task-state.mjs";

const ALWAYS_ALLOWED = [
  "docs/plans/", "docs/memory/", "docs/adr/", "docs/simplification/", "docs/known-issues/",
  "docs/difference/", "docs/migration-reports/",
];
const NEVER_ALLOWED = [
  ".claude/state/", ".claude/settings.json", ".claude/settings.local.json",
  ".claude/usta.json", ".claude/routing.json",
];
// /usta:init may create the project config; changing it later is the human's job.
const CREATE_ONLY = ".claude/usta.json";

function toPosix(p) {
  return p.split(path.sep).join("/");
}

/** Returns a denial reason, or null to allow. */
export function decide(payload, projectDir) {
  const input = payload.tool_input ?? {};
  const filePath = input.file_path ?? input.notebook_path;
  if (!filePath) return null;
  const absolute = path.resolve(projectDir, filePath);
  const rel = toPosix(path.relative(path.resolve(projectDir), absolute));

  const creatingConfig = rel === CREATE_ONLY && !existsSync(absolute);
  if (toPosix(absolute).includes("/.claude/plugins/") || (!creatingConfig && NEVER_ALLOWED.some((p) => rel.startsWith(p)))) {
    return `${rel} controls the usta workflow and cannot be edited by agents. Ask the human to change it.`;
  }
  if (creatingConfig || ALWAYS_ALLOWED.some((p) => rel.startsWith(p))) return null;

  let task;
  try {
    task = readTask(projectDir);
  } catch {
    return ".claude/state/task.json is not valid JSON. Re-run /usta:task.";
  }
  if (!task) {
    return projectConfig(projectDir).requireTask
      ? "This project requires /usta:task <request> so the work is triaged and planned before code changes."
      : null;
  }
  if (!task.approved) {
    return `Plan for task '${task.task_id ?? "?"}' is not approved yet (plan: ${task.plan_path ?? "missing"}). Wait for the human to run /usta:approve.`;
  }
  return null;
}

// realpath: the plugin may be reached through a symlink, while import.meta.url is always resolved.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = JSON.parse(readFileSync(0, "utf8"));
  const reason = decide(payload, process.env.CLAUDE_PROJECT_DIR || payload.cwd || ".");
  if (reason) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason },
    }));
  }
}
