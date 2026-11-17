import { type AgentEvent, PHASE_LABEL as phaseLabel } from "@/entities/agent-event";

const PART_STATUS = { pending: "navbatda", in_progress: "ishlanmoqda", done: "tayyor" } as const;

/** One human-readable line per event for the log. */
export function describeEvent(event: AgentEvent): string {
  switch (event.type) {
    case "task.started":
      return `${event.title} · ${event.level}`;
    case "phase.started":
      return `${phaseLabel[event.phase]} boshlandi`;
    case "phase.finished":
      return `${phaseLabel[event.phase]} ${event.status === "ok" ? "tugadi" : "xato bilan tugadi"}`;
    case "agent.started":
      return `${event.agent} (${event.model}, ${event.effort})${event.worktree ? ` · ${event.worktree}` : ""}`;
    case "agent.finished":
      return `${event.id}: ${event.summary ?? event.status}`;
    case "plan.part":
      return `Qism ${event.part}: ${PART_STATUS[event.status]}`;
    case "approval.waiting":
      return "Reja tasdiqni kutmoqda";
    case "approval.granted":
      return event.by === "human" ? "Reja siz tomondan tasdiqlandi" : "Avtomatik tasdiqlandi";
    case "tests":
      return `${event.passed} o'tdi, ${event.failed} yiqildi, ${event.skipped} o'tkazildi`;
    case "finding":
      return `${event.severity}: ${event.message}`;
    case "task.finished":
      return event.status === "ok" ? "Task yakunlandi" : "Task xato bilan to'xtadi";
    default:
      return "";
  }
}
