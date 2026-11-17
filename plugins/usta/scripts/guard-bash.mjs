#!/usr/bin/env node
// PreToolUse hook: deny destructive or irreversible shell commands from agents.
// ALWAYS applies in every session; DURING_TASK applies only while a /task is active,
// because outside the workflow pushing and publishing are the user's own call.
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { readTask } from "./task-state.mjs";

const ALWAYS = [
  [/\brm\s+-[a-z]*r[a-z]*f?\s+(\/|~|\*|\.\s*$)/i, "recursive delete of a root, home or wildcard path"],
  [/\bgit\s+reset\s+--hard\b/i, "hard reset discards work"],
  [/\bgit\s+clean\s+-[a-z]*f/i, "git clean deletes untracked files"],
  [/\b(drop|truncate)\s+(table|database|schema)\b/i, "destructive SQL"],
  [/\b(vercel|netlify)\b.*\b(deploy|--prod)\b|\bkubectl\s+(delete|apply)\b|\bterraform\s+(apply|destroy)\b/i,
    "deployments and infrastructure changes need a human"],
  [/(cat|less|head|tail|more)\s+[^|;]*\.env\b/i, "reading secret files"],
  [/\bcurl\b[^|]*\|\s*(ba|z)?sh\b/i, "piping remote scripts into a shell"],
  [/task-state\.mjs\s+approve|approve-hook\.mjs/i, "only a human can approve a plan (/usta:approve)"],
  [/\.claude[\\/](state|settings|routing\.json|usta\.json|plugins[\\/])/i,
    "workflow files are not editable by agents"],
];
const DURING_TASK = [
  [/\bgit\s+push\b/i, "pushing is done by a human after review"],
  [/\b(npm|pnpm|yarn)\s+publish\b/i, "publishing packages needs a human"],
];
// Running the state script is allowed, but only as a single plain command.
const ALLOWED = /^\s*node\s+"?[^"\s]*task-state\.mjs"?\s+(start|show|clear|event)\b/;

function taskActive(projectDir) {
  try {
    return readTask(projectDir) !== null;
  } catch {
    return true;
  }
}

/** Returns a denial reason, or null to allow. */
export function decide(payload, projectDir) {
  const command = payload.tool_input?.command ?? "";
  if (ALLOWED.test(command) && !/[;&|`$<>]/.test(command)) return null;
  const rules = taskActive(projectDir) ? [...ALWAYS, ...DURING_TASK] : ALWAYS;
  const hit = rules.find(([pattern]) => pattern.test(command));
  return hit ? `Blocked: ${hit[1]}. Ask the human to run it if it is really needed.` : null;
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
