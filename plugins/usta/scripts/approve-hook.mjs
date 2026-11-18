#!/usr/bin/env node
// UserPromptExpansion hook for /usta:approve and /usta:budget. It fires only when a human types the command
// (Claude cannot invoke these skills: they set disable-model-invocation), so this is the human gate.
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { approve, extendBudget, findTaskProject, projectDir } from "./task-state.mjs";

/** Returns the hook output object. */
export function decide(payload, project) {
  const command = (payload.command_name ?? "").match(/(?:^|:)(approve|budget)$/)?.[1];
  if (!command) return {};
  try {
    const home = findTaskProject([project, payload.cwd], payload.session_id) ?? project;
    const state = command === "approve" ? approve(home, payload.session_id) : extendBudget(home, payload.session_id);
    const context = command === "approve"
      ? `Task '${state.task_id}' (${state.level}) approved by the human. Plan: ${state.plan_path ?? "none"}.`
      : `The human raised the budget of task '${state.task_id}' to $${state.budget_usd}.`;
    return { hookSpecificOutput: { hookEventName: "UserPromptExpansion", additionalContext: context } };
  } catch (error) {
    return { decision: "block", reason: error.message };
  }
}

// realpath: the plugin may be reached through a symlink, while import.meta.url is always resolved.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = JSON.parse(readFileSync(0, "utf8"));
  process.stdout.write(JSON.stringify(decide(payload, process.env.CLAUDE_PROJECT_DIR || payload.cwd || projectDir())));
}
