#!/usr/bin/env node
// UserPromptExpansion hook for /usta:approve. It fires only when a human types the command
// (Claude cannot invoke the skill: it sets disable-model-invocation), so this is the human gate.
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { approve, projectDir } from "./task-state.mjs";

/** Returns the hook output object. */
export function decide(payload, project) {
  if (!/(^|:)approve$/.test(payload.command_name ?? "")) return {};
  try {
    const state = approve(project);
    return {
      hookSpecificOutput: {
        hookEventName: "UserPromptExpansion",
        additionalContext: `Task '${state.task_id}' (${state.level}) approved by the human. Plan: ${state.plan_path ?? "none"}.`,
      },
    };
  } catch (error) {
    return { decision: "block", reason: error.message };
  }
}

// realpath: the plugin may be reached through a symlink, while import.meta.url is always resolved.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = JSON.parse(readFileSync(0, "utf8"));
  process.stdout.write(JSON.stringify(decide(payload, process.env.CLAUDE_PROJECT_DIR || payload.cwd || projectDir())));
}
