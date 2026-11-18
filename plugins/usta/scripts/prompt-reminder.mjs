#!/usr/bin/env node
// UserPromptSubmit hook: in a project with {"requireTask": true} in .claude/usta.json, a plain prompt
// (no slash command, no active task in this session) gets a one-paragraph reminder of the usta modes,
// so Claude picks one itself instead of being stopped later by the edit gate.
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { findTaskProject, projectConfig } from "./task-state.mjs";

export const REMINDER = [
  "usta: this project changes code only through a usta mode. A question needs none: just answer it.",
  "For a code change, invoke the matching skill with the Skill tool before editing:",
  "usta:tez - small and low-risk (a few files, no auth, payments, security, migration or schema work);",
  "usta:oyla - the human asks to think, plan or review risks first (writes docs/plans only, no code);",
  "usta:task - everything else. If unsure between tez and task, pick task.",
].join(" ");

/** Returns the hook output object; empty when no reminder is needed. */
export function decide(payload, project) {
  if (String(payload.prompt ?? "").trimStart().startsWith("/")) return {};
  try {
    if (!projectConfig(project).requireTask) return {};
    if (findTaskProject([project, payload.cwd], payload.session_id)) return {};
  } catch {
    return {};
  }
  return { hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: REMINDER } };
}

// realpath: the plugin may be reached through a symlink, while import.meta.url is always resolved.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = JSON.parse(readFileSync(0, "utf8"));
  process.stdout.write(JSON.stringify(decide(payload, process.env.CLAUDE_PROJECT_DIR || payload.cwd || ".")));
}
