#!/usr/bin/env node
// PreToolUse hook: deny destructive or irreversible shell commands from agents.
// ALWAYS applies in every session; DURING_TASK applies only while a /task is active,
// because outside the workflow pushing and publishing are the user's own call.
// A /usta:oyla task (mode "plan") allows only read-only commands: it plans and never builds.
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { findTaskProject, readTask } from "./task-state.mjs";

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
];
// Workflow files: reading them (ls, cat, grep...) and running the dashboard is fine, changing them is not.
const WORKFLOW_FILES = /\.claude[\\/](state|settings|routing\.json|usta\.json|plugins[\\/])/i;
const READ_ONLY = /^\s*(cd|ls|cat|head|tail|less|grep|rg|find|stat|wc|jq|tree|file|echo|pwd|git\s+(status|diff|log|show|blame|ls-files|grep|rev-parse))\b(?!.*\s-(delete|exec|execdir|ok|fprint|-output)\b)/;
const DASHBOARD = /^\s*node\s+("[^"]*dashboard\.mjs"|[^"\s]*dashboard\.mjs)(\s+--[\w-]+(\s+\d+)?)*\s*$/;
const DURING_TASK = [
  [/\bgit\s+push\b/i, "pushing is done by a human after review"],
  [/\b(npm|pnpm|yarn)\s+publish\b/i, "publishing packages needs a human"],
];
// Running the state script is allowed, but only as a single plain command.
const ALLOWED = /^\s*node\s+"?[^"\s]*task-state\.mjs"?\s+(start|show|clear|event)\b/;

/** This session's task, null when there is none; a corrupt state file counts as an active task. */
function activeTask(projectDir, payload) {
  try {
    const home = findTaskProject([projectDir, payload.cwd], payload.session_id);
    return home && readTask(home, payload.session_id);
  } catch {
    return {};
  }
}

/** True when every part of the command only reads or is the dashboard server; redirects and substitutions never are. */
function readsOnly(command) {
  const withoutNullRedirects = command.replace(/\d?>\s*\/dev\/null/g, "");
  if (/[>`]|\$\(/.test(withoutNullRedirects)) return false;
  return withoutNullRedirects.split(/&&|\|\||[;|&\n]/).every((part) => READ_ONLY.test(part) || DASHBOARD.test(part));
}

/** Returns a denial reason, or null to allow. */
export function decide(payload, projectDir) {
  const command = payload.tool_input?.command ?? "";
  if (ALLOWED.test(command) && !/[;&|`$<>]/.test(command)) return null;
  const task = activeTask(projectDir, payload);
  const rules = task ? [...ALWAYS, ...DURING_TASK] : ALWAYS;
  const hit = rules.find(([pattern]) => pattern.test(command));
  if (hit) return `Blocked: ${hit[1]}. Ask the human to run it if it is really needed.`;
  if (task?.mode === "plan" && !readsOnly(command)) {
    return "Blocked: /usta:oyla only plans, so the shell is read-only (ls, cat, grep, find, git diff/log...). To build the plan, the human runs /usta:resume <task folder>.";
  }
  if (WORKFLOW_FILES.test(command) && !readsOnly(command)) {
    return "Blocked: workflow files are not editable by agents. Ask the human to run it if it is really needed.";
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
