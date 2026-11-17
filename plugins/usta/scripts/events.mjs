// The task event log the dashboard reads: <project>/.claude/state/usta-events.jsonl, one JSON event per line.
// Format: site/src/entities/agent-event/model/types.ts. Only task-state.mjs and record-event.mjs write it.
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export const EVENTS_FILE = ".claude/state/usta-events.jsonl";

/** Agent role -> the phase it works in. Brainstorm and approve have no agent. */
export const ROLE_PHASE = {
  triage: "triage",
  analyzer: "analyze",
  planner: "plan",
  coder: "implement",
  simplifier: "simplify",
  tester: "test",
  reviewer: "review",
  "security-reviewer": "review",
};

export const eventsPath = (project) => path.join(project, EVENTS_FILE);

export function readEvents(project) {
  const file = eventsPath(project);
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim())
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });
}

/** Appends one event. The first event after a finished task starts a fresh log: the dashboard shows one task. */
export function emit(project, event) {
  const file = eventsPath(project);
  const line = `${JSON.stringify({ ts: new Date().toISOString(), ...event })}\n`;
  mkdirSync(path.dirname(file), { recursive: true });
  if (readEvents(project).at(-1)?.type === "task.finished") writeFileSync(file, line);
  else appendFileSync(file, line);
}

/** The phases of the current task (from task.started), where each one stands and which still has agents running. */
function phaseState(events) {
  const started = events.findLast((event) => event.type === "task.started");
  const status = new Map();
  const running = new Map();
  for (const event of events) {
    if (event.type === "phase.started") status.set(event.phase, "active");
    if (event.type === "phase.finished") status.set(event.phase, "done");
    if (event.type === "agent.started") running.set(event.id, event.phase);
    if (event.type === "agent.finished") running.delete(event.id);
  }
  return { phases: started?.phases ?? [], status, busy: new Set(running.values()) };
}

/**
 * Moves the task into `phase`: the active phase finishes, and phases skipped on the way forward
 * (a planned phase that never ran) are closed too. Re-entering an earlier phase (a fix round) is allowed.
 */
export function enterPhase(project, phase) {
  const { phases, status, busy } = phaseState(readEvents(project));
  if (status.get(phase) === "active") return;
  const target = phases.indexOf(phase);
  // A phase whose agents still run (tester next to the reviewers) stays open until they stop.
  for (const [name, state] of status) {
    if (state === "active" && !busy.has(name)) emit(project, { type: "phase.finished", phase: name, status: "ok" });
  }
  phases.slice(0, Math.max(target, 0)).forEach((name) => {
    if (!status.has(name)) emit(project, { type: "phase.finished", phase: name, status: "ok" });
  });
  emit(project, { type: "phase.started", phase });
}

/** Called when an agent stops: its phase closes if the task already moved on and nothing else runs there. */
export function settlePhase(project, phase) {
  const { status, busy } = phaseState(readEvents(project));
  const movedOn = [...status].some(([name, state]) => name !== phase && state === "active");
  if (status.get(phase) === "active" && movedOn && !busy.has(phase)) {
    emit(project, { type: "phase.finished", phase, status: "ok" });
  }
}

/** Brainstorm is the orchestrator's own work: call this when the phase before it is over. */
export function enterBrainstormIfNext(project) {
  const { phases, status } = phaseState(readEvents(project));
  const last = phases.findLastIndex((name) => status.has(name));
  if (phases[last + 1] === "brainstorm") enterPhase(project, "brainstorm");
}

/** Closes the active phase and the task. */
export function finishTask(project, status = "ok") {
  const { status: phases } = phaseState(readEvents(project));
  for (const [name, state] of phases) {
    if (state === "active") emit(project, { type: "phase.finished", phase: name, status });
  }
  emit(project, { type: "task.finished", status });
}

/** Phases the dashboard shows for a level: triage, the routed phases, and the approval gate after the plan. */
export function taskPhases(levelConfig) {
  // Security review runs alongside review, so the dashboard shows them as one phase.
  const phases = ["triage", ...(levelConfig.phases ?? []).filter((phase) => phase !== "security")];
  if (levelConfig.require_approval) {
    const at = phases.includes("plan") ? phases.indexOf("plan") + 1 : phases.indexOf("implement");
    phases.splice(at < 0 ? phases.length : at, 0, "approve");
  }
  return phases;
}
