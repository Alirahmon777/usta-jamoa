#!/usr/bin/env node
// Manage <project>/.claude/state/task.json, the gate that unlocks source edits during /task.
//
//   start --session ID --task-id ID --level LEVEL [--title TEXT] [--task-type TYPE] [--risks a,b] [--plan PATH] [--auto-approve]
//         (agents may run this; the routing floors can only raise LEVEL, and the stored level never drops)
//   show --session ID | clear --session ID
//   event '<json>'   records a plan.part, tests or finding event for the dashboard
//
// Approval is not a CLI command: the human types /usta:approve, and approve-hook.mjs calls
// approve(). --auto-approve is honoured only for levels whose routing has "require_approval": false,
// so an agent cannot skip the human gate for moderate/complex/critical work.
//
// The project is the current directory (Claude runs this from the project root) unless
// CLAUDE_PROJECT_DIR is set, as it is for hooks.
//
// Each Claude session has its own gate file (.claude/state/tasks/<session>.json), so a task waiting for
// approval in one session does not block edits in another session opened in the same folder.
// Without a session the shared .claude/state/task.json of older versions is used.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { emit, enterBrainstormIfNext, enterPhase, finishTask, readEvents, taskPhases } from "./events.mjs";

const PLUGIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEGACY_STATE_FILE = ".claude/state/task.json";
const PROJECT_MARKERS = [".claude/usta.json", ".git"];

function stateFile(session) {
  if (!session) return LEGACY_STATE_FILE;
  if (!/^[\w-]+$/.test(session)) throw new Error(`Invalid session id '${session}'.`);
  return `.claude/state/tasks/${session}.json`;
}

export function projectDir() {
  return process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

/**
 * The project a file belongs to: the nearest folder above it with .claude/usta.json or .git,
 * so nested repos inside the session folder get their own docs/ and config. Falls back to `fallback`.
 */
export function projectRootOf(filePath, fallback) {
  let dir = path.dirname(path.resolve(fallback, filePath));
  while (true) {
    if (PROJECT_MARKERS.some((marker) => existsSync(path.join(dir, marker)))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(fallback);
    dir = parent;
  }
}

/** The task gate lives in the main checkout; a git worktree (parallel subtask) shares it. */
export function statePath(project, session) {
  const file = stateFile(session);
  const local = path.join(project, file);
  if (existsSync(local)) return local;
  try {
    const gitDir = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
      cwd: project, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return path.join(path.dirname(gitDir), file);
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
export function readTask(project, session) {
  const file = statePath(project, session);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}

/**
 * The first of `projects` that holds this session's task, or null. Hooks run from the session folder,
 * while the state script runs wherever Claude's shell is, so they look in every place it could be.
 * Throws when a state file is corrupt.
 */
export function findTaskProject(projects, session) {
  const unique = new Set(projects.filter(Boolean).map((project) => path.resolve(project)));
  return [...unique].find((project) => readTask(project, session)) ?? null;
}

function save(project, session, state) {
  const file = path.join(project, stateFile(session));
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

/** The task's parallel map (plan.md, "## 4. Parallel xarita"): how many parts, file entries and worktree parts. */
export function planSize(text) {
  const lines = text.split("\n");
  const heading = lines.findIndex((line) => /^#+.*parallel/i.test(line));
  if (heading < 0) return { parts: 0, files: 0, worktrees: 0 };
  const rows = [];
  for (const line of lines.slice(heading + 1)) {
    if (/^#+\s/.test(line)) break;
    if (line.trim().startsWith("|")) rows.push(line.split("|").slice(1, -1).map((cell) => cell.trim()));
  }
  const [header = [], , ...parts] = rows;
  const column = (pattern) => header.findIndex((cell) => pattern.test(cell));
  const files = column(/fayl|file/i);
  const worktree = column(/worktree/i);
  return {
    parts: parts.length,
    files: parts.reduce((sum, row) => sum + (row[files]?.match(/`[^`]+`/g)?.length ?? 0), 0),
    worktrees: parts.filter((row) => /^(ha|yes)\b/i.test(row[worktree] ?? "")).length,
  };
}

/**
 * The lowest level the task may run at: triage's level, raised by the risk, task type and plan floors in
 * routing. Returns the level and why it was raised. A level is never lowered.
 */
export function floorLevel(routing, { level, taskType, risks = [], plan }) {
  const order = Object.keys(routing.levels);
  let result = { level, reasons: [] };
  const raise = (to, reason) => {
    if (order.includes(to) && order.indexOf(to) > order.indexOf(result.level)) result = { level: to, reasons: [...result.reasons, reason] };
  };
  const risky = risks.filter((area) => routing.risk_floor?.areas?.includes(area));
  if (risky.length) raise(routing.risk_floor.min_level, `risk: ${risky.join(", ")}`);
  if (taskType && routing.task_type_floor?.[taskType]) raise(routing.task_type_floor[taskType], `task type: ${taskType}`);
  if (plan) {
    const size = planSize(plan);
    for (const rule of routing.plan_floor?.rules ?? []) {
      if (size.parts >= rule.parts || size.files >= rule.files) {
        raise(rule.level, `plan: ${size.parts} parts, ${size.files} file entries`);
      }
    }
    const parallelFrom = order.find((name) => routing.parallel?.levels?.includes(name));
    if (size.worktrees && parallelFrom) raise(parallelFrom, `plan: ${size.worktrees} worktree parts`);
  }
  return result;
}

export function start({ taskId, level, title, plan = null, autoApprove = false, session, taskType, risks }, project = projectDir()) {
  const routing = JSON.parse(readFileSync(routingPath(project), "utf8"));
  const { levels } = routing;
  if (!levels[level]) throw new Error(`Unknown level '${level}'. Expected one of: ${Object.keys(levels).join(", ")}`);
  const previous = readTask(project, session);
  // A second start for the same task (with the plan) keeps what the first one learned.
  const same = previous?.task_id === taskId ? previous : null;
  const order = Object.keys(levels);
  const planFile = plan && path.resolve(project, plan);
  const floor = floorLevel(routing, {
    level: same && order.indexOf(same.level) > order.indexOf(level) ? same.level : level,
    taskType: taskType ?? same?.task_type,
    risks: risks ?? same?.risks,
    plan: planFile && existsSync(planFile) ? readFileSync(planFile, "utf8") : null,
  });
  const approved = autoApprove && !levels[floor.level].require_approval;
  const state = save(project, session, {
    task_id: taskId,
    level: floor.level,
    triage_level: same?.triage_level ?? level,
    raised_because: [...(same?.raised_because ?? []), ...floor.reasons],
    task_type: taskType ?? same?.task_type ?? null,
    risks: risks ?? same?.risks ?? [],
    plan_path: plan,
    approved,
    approved_by: approved ? "auto" : null,
    budget_usd: Math.max(same?.budget_usd ?? 0, levels[floor.level].max_budget_usd ?? 0) || null,
    created_at: same?.created_at ?? new Date().toISOString(),
  });
  try {
    recordStart(project, previous, state, levels[state.level], title);
  } catch (error) {
    console.error(`usta dashboard event skipped: ${error.message}`);
  }
  return state;
}

export function approve(project = projectDir(), session = undefined) {
  const current = readTask(project, session);
  if (!current) throw new Error("No active task to approve. Start one with /usta:task.");
  const state = save(project, session, { ...current, approved: true, approved_by: "human", approved_at: new Date().toISOString() });
  emit(project, { type: "approval.granted", by: "human" });
  return state;
}

/** Estimated USD the task's agents spent so far (the event log holds one task). */
export function spentUsd(project) {
  return readEvents(project)
    .filter((event) => event.type === "agent.finished")
    .reduce((sum, event) => sum + (event.costUsd ?? 0), 0);
}

/** /usta:budget: the human allows one more level budget on top of what is already spent. */
export function extendBudget(project = projectDir(), session = undefined) {
  const current = readTask(project, session);
  if (!current) throw new Error("No active task. Start one with /usta:task.");
  const levels = JSON.parse(readFileSync(routingPath(project), "utf8")).levels;
  const step = levels[current.level]?.max_budget_usd ?? 0;
  const budget = Math.round((Math.max(current.budget_usd ?? 0, spentUsd(project)) + step) * 100) / 100;
  return save(project, session, { ...current, budget_usd: budget });
}

export function clear(project = projectDir(), session = undefined) {
  const file = path.join(project, stateFile(session));
  if (existsSync(file)) finishTask(project);
  rmSync(file, { force: true });
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
      session: { type: "string" },
      "task-id": { type: "string" },
      title: { type: "string" },
      level: { type: "string" },
      plan: { type: "string" },
      "task-type": { type: "string" },
      risks: { type: "string" },
      "auto-approve": { type: "boolean", default: false },
    },
  });
  try {
    switch (positionals[0]) {
      case "start": {
        // Hooks look up the task by the session id they receive; a task without one would gate nothing.
        if (!values.session) throw new Error("Pass --session ${CLAUDE_SESSION_ID} (the usta skills fill it in).");
        const state = start({ taskId: values["task-id"], level: values.level, title: values.title, plan: values.plan ?? null,
          autoApprove: values["auto-approve"], session: values.session, taskType: values["task-type"],
          risks: values.risks?.split(",").map((risk) => risk.trim()).filter(Boolean) });
        if (state.level !== values.level) {
          console.log(`Level raised from '${values.level}' to '${state.level}' (${state.raised_because.join("; ")}). Use the routing of '${state.level}' from now on.`);
        }
        if (values["auto-approve"] && !state.approved) {
          console.log(`Level '${state.level}' requires human approval; --auto-approve ignored.`);
        }
        console.log(JSON.stringify(state, null, 2));
        break;
      }
      case "show": {
        const task = readTask(projectDir(), values.session);
        console.log(task ? JSON.stringify(task, null, 2) : "No active task.");
        console.log(`Routing: ${routingPath(projectDir())}`);
        break;
      }
      case "event":
        report(positionals[1]);
        console.log("Recorded.");
        break;
      case "clear":
        clear(projectDir(), values.session);
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
