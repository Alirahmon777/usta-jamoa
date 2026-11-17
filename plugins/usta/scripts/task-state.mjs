#!/usr/bin/env node
// Manage <project>/.claude/state/task.json, the gate that unlocks source edits during /task.
//
//   start --task-id ID --level LEVEL [--title TEXT] [--plan PATH] [--auto-approve]   (agents may run this)
//   show | clear
//   event '<json>'   records a plan.part, tests or finding event for the dashboard
//
// Approval is not a CLI command: the human types /usta:approve, and approve-hook.mjs calls
// approve(). --auto-approve is honoured only for levels whose routing has "require_approval": false,
// so an agent cannot skip the human gate for moderate/complex/critical work.
//
// The project is the current directory (Claude runs this from the project root) unless
// CLAUDE_PROJECT_DIR is set, as it is for hooks.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { emit, enterBrainstormIfNext, enterPhase, finishTask, taskPhases } from "./events.mjs";

const PLUGIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE_FILE = ".claude/state/task.json";

export function projectDir() {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

/** The task gate lives in the main checkout; a git worktree (parallel subtask) shares it. */
export function statePath(project) {
  const local = path.join(project, STATE_FILE);
  if (existsSync(local)) return local;
  try {
    const gitDir = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
      cwd: project, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return path.join(path.dirname(gitDir), STATE_FILE);
  } catch {
    return local;
  }
}

/** The project's own .claude/routing.json wins over the plugin default. */
export function routingPath(project) {
  const own = path.join(project, ".claude/routing.json");
  return existsSync(own) ? own : path.join(PLUGIN_ROOT, "routing.json");
}

/** Optional per-project settings in .claude/usta.json. */
export function projectConfig(project) {
  const file = path.join(project, ".claude/usta.json");
  if (!existsSync(file)) return {};
  return JSON.parse(readFileSync(file, "utf8"));
}

/** The active task, null when there is none. Throws when the state file is corrupt. */
export function readTask(project) {
  const file = statePath(project);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}

function save(project, state) {
  const file = path.join(project, STATE_FILE);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(state, null, 2));
  return state;
}

/** Dashboard events for a start call: the task itself the first time, the approval gate once a plan exists. */
function recordStart(project, previous, state, levelConfig, title) {
  if (previous?.task_id !== state.task_id || previous?.level !== state.level) {
    emit(project, { type: "task.started", task: state.task_id, title: title ?? state.task_id, level: state.level,
      phases: taskPhases(levelConfig) });
    enterBrainstormIfNext(project);
  }
  if (!state.plan_path || previous?.plan_path === state.plan_path) return;
  if (state.approved) emit(project, { type: "approval.granted", by: "auto" });
  else if (levelConfig.require_approval) {
    enterPhase(project, "approve");
    emit(project, { type: "approval.waiting" });
  }
}

export function start({ taskId, level, title, plan = null, autoApprove = false }, project = projectDir()) {
  const levels = JSON.parse(readFileSync(routingPath(project), "utf8")).levels;
  if (!levels[level]) throw new Error(`Unknown level '${level}'. Expected one of: ${Object.keys(levels).join(", ")}`);
  const approved = autoApprove && !levels[level].require_approval;
  const previous = readTask(project);
  const state = save(project, {
    task_id: taskId,
    level,
    plan_path: plan,
    approved,
    approved_by: approved ? "auto" : null,
    created_at: new Date().toISOString(),
  });
  try {
    recordStart(project, previous, state, levels[level], title);
  } catch (error) {
    console.error(`usta dashboard event skipped: ${error.message}`);
  }
  return state;
}

export function approve(project = projectDir()) {
  const current = readTask(project);
  if (!current) throw new Error("No active task to approve. Start one with /usta:task.");
  const state = save(project, { ...current, approved: true, approved_by: "human", approved_at: new Date().toISOString() });
  emit(project, { type: "approval.granted", by: "human" });
  return state;
}

export function clear(project = projectDir()) {
  if (existsSync(path.join(project, STATE_FILE))) finishTask(project);
  rmSync(path.join(project, STATE_FILE), { force: true });
}

const REPORTED_EVENTS = new Set(["plan.part", "tests", "finding"]);

/** Results only the orchestrator knows (plan parts, test counts, review findings), for the dashboard. */
export function report(json, project = projectDir()) {
  const event = JSON.parse(json);
  if (!REPORTED_EVENTS.has(event.type)) {
    throw new Error(`Event type must be one of: ${[...REPORTED_EVENTS].join(", ")}`);
  }
  emit(project, event);
  return event;
}

// realpath: the plugin may be reached through a symlink, while import.meta.url is always resolved.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      "task-id": { type: "string" },
      title: { type: "string" },
      level: { type: "string" },
      plan: { type: "string" },
      "auto-approve": { type: "boolean", default: false },
    },
  });
  try {
    switch (positionals[0]) {
      case "start": {
        const state = start({ taskId: values["task-id"], level: values.level, title: values.title, plan: values.plan ?? null,
          autoApprove: values["auto-approve"] });
        if (values["auto-approve"] && !state.approved) {
          console.log(`Level '${values.level}' requires human approval; --auto-approve ignored.`);
        }
        console.log(JSON.stringify(state, null, 2));
        break;
      }
      case "show": {
        const task = readTask(projectDir());
        console.log(task ? JSON.stringify(task, null, 2) : "No active task.");
        console.log(`Routing: ${routingPath(projectDir())}`);
        break;
      }
      case "event":
        report(positionals[1]);
        console.log("Recorded.");
        break;
      case "clear":
        clear();
        console.log("Cleared.");
        break;
      default:
        console.error("Usage: task-state.mjs start|show|clear|event");
        process.exit(1);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
