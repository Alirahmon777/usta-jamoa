#!/usr/bin/env node
// PreToolUse hook on Agent calls during /usta:task. Two limits from routing that a prompt alone did not hold:
// - parallel coders (isolation "worktree") only on levels listed in parallel.levels;
// - no new usta agent once the task's estimated cost reached its budget, until the human types /usta:budget;
// - /usta:oyla (mode "plan") runs only the agents that read and plan; /usta:tez (mode "fast") runs none.
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { findTaskProject, readTask, routingPath, spentUsd } from "./task-state.mjs";

const PLANNING_AGENTS = ["usta:triage", "usta:analyzer", "usta:planner", "usta:reviewer", "usta:security-reviewer"];

/** Returns a denial reason, or null to allow. */
export function decide(payload, projectDir) {
  const input = payload.tool_input ?? {};
  if (!String(input.subagent_type ?? "").startsWith("usta:")) return null;
  const home = findTaskProject([projectDir, payload.cwd], payload.session_id);
  const task = home && readTask(home, payload.session_id);
  if (!task) return null;
  if (task.mode === "plan" && !PLANNING_AGENTS.includes(input.subagent_type)) {
    return `/usta:oyla only plans, so ${input.subagent_type} cannot run. Allowed: ${PLANNING_AGENTS.join(", ")}. To build the plan, the human runs /usta:resume <task folder>.`;
  }
  if (task.mode === "fast") {
    return "/usta:tez works alone, without usta agents. If the request needs a team, stop and suggest /usta:task.";
  }

  const { parallel = {} } = JSON.parse(readFileSync(routingPath(home), "utf8"));
  if (input.isolation === "worktree" && !(parallel.levels ?? []).includes(task.level)) {
    return `Level '${task.level}' does not allow parallel worktree agents (routing parallel.levels: ${(parallel.levels ?? []).join(", ")}). Run the parts one after another in the main tree.`;
  }
  const spent = spentUsd(home);
  if (task.budget_usd && spent >= task.budget_usd) {
    return `Task '${task.task_id}' reached its budget: about $${spent.toFixed(2)} spent of $${task.budget_usd}. Stop, tell the human what is done and what is left, and ask them to type /usta:budget to allow more, or to stop here.`;
  }
  return null;
}

// realpath: the plugin may be reached through a symlink, while import.meta.url is always resolved.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = JSON.parse(readFileSync(0, "utf8"));
  let reason = null;
  try {
    reason = decide(payload, process.env.CLAUDE_PROJECT_DIR || payload.cwd || ".");
  } catch (error) {
    process.stderr.write(`usta agent gate skipped: ${error.message}\n`);
  }
  if (reason) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: reason },
    }));
  }
}
