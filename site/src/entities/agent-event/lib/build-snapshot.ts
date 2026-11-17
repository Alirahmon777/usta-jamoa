import { ALL_PHASES } from "../model/constants";
import type { AgentEvent, AgentRun, Phase, PhaseStatus, PlanPart, TaskSnapshot } from "../model/types";

const emptySnapshot = (): TaskSnapshot => ({
  phases: ALL_PHASES.map((phase) => ({ phase, status: "pending" })),
  approval: "none",
  agents: [],
  parts: [],
  findings: []
});

const setPhase = (snapshot: TaskSnapshot, phase: Phase, status: PhaseStatus) => {
  snapshot.phases = snapshot.phases.map((item) => (item.phase === phase ? { ...item, status } : item));
};

/** Phases outside the task's level are skipped. Triage runs before the task is registered, so moved phases stay. */
const planPhases = (current: TaskSnapshot["phases"], planned: Phase[]) =>
  current.map(({ phase, status }) => {
    if (status !== "pending") return { phase, status };
    return { phase, status: planned.includes(phase) ? status : ("skipped" as const) };
  });

const upsertPart = (parts: PlanPart[], next: PlanPart) => {
  const others = parts.filter((part) => part.part !== next.part);
  return [...others, next].sort((a, b) => a.part.localeCompare(b.part));
};

const updateAgent = (agents: AgentRun[], id: string, patch: Partial<AgentRun>) =>
  agents.map((agent) => (agent.id === id ? { ...agent, ...patch } : agent));

/** Folds the event log, in order, into the current state of one task. */
export function buildSnapshot(events: AgentEvent[]): TaskSnapshot {
  const snapshot = emptySnapshot();

  for (const event of events) {
    switch (event.type) {
      case "task.started":
        snapshot.task = {
          id: event.task,
          title: event.title,
          level: event.level,
          startedAt: event.ts,
          status: "running"
        };
        snapshot.phases = planPhases(snapshot.phases, event.phases);
        break;
      case "phase.started":
        setPhase(snapshot, event.phase, "active");
        break;
      case "phase.finished":
        setPhase(snapshot, event.phase, event.status === "ok" ? "done" : "failed");
        break;
      case "agent.started":
        snapshot.agents = [
          ...snapshot.agents,
          { ...event, status: "running", startedAt: event.ts, tokens: 0, costUsd: 0 }
        ];
        break;
      case "agent.finished":
        snapshot.agents = updateAgent(snapshot.agents, event.id, {
          status: event.status,
          finishedAt: event.ts,
          tokens: event.tokens,
          costUsd: event.costUsd,
          summary: event.summary,
          ...(event.model && { model: event.model }),
          ...(event.effort && { effort: event.effort })
        });
        break;
      case "plan.part":
        snapshot.parts = upsertPart(snapshot.parts, event);
        break;
      case "approval.waiting":
        snapshot.approval = "waiting";
        break;
      case "approval.granted":
        snapshot.approval = "granted";
        break;
      case "tests":
        snapshot.tests = event;
        break;
      case "finding":
        snapshot.findings = [...snapshot.findings, event];
        break;
      case "task.finished":
        if (snapshot.task) snapshot.task = { ...snapshot.task, finishedAt: event.ts, status: event.status };
        break;
      default:
        break;
    }
  }

  return snapshot;
}
