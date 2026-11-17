import type { AgentEvent, AgentRun } from "@/entities/agent-event";

import { OFFICE_AGENTS } from "../model/constants";
import type { Activity, AgentRole, OfficeAgentState } from "../model/types";

const ROLES = Object.keys(OFFICE_AGENTS) as AgentRole[];

const findReporter = (events: AgentEvent[], agents: AgentRun[]) => {
  const last = events.findLast((event) => event.type.startsWith("agent.") || event.type === "task.finished");
  if (last?.type !== "agent.finished") return undefined;
  return agents.find((agent) => agent.id === last.id)?.agent;
};

const pickActivity = (role: AgentRole, isRunning: boolean, reporter: string | undefined): Activity => {
  if (isRunning) return OFFICE_AGENTS[role].work;
  if (role === reporter || (role === "orchestrator" && reporter)) return "talking";
  return "idle";
};

export function getOfficeState(events: AgentEvent[], agents: AgentRun[]): OfficeAgentState[] {
  const running = agents.filter((agent) => agent.status === "running");
  const reporter = findReporter(events, agents);
  const isReporterBusy = running.some((agent) => agent.agent === reporter);
  const talker = isReporterBusy ? undefined : reporter;

  return ROLES.map((role) => {
    const runs = running.filter((agent) => agent.agent === role).length;
    return { role, activity: pickActivity(role, runs > 0, talker), runs };
  });
}
