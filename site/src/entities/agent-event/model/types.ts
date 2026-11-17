/**
 * One line of the task event log (JSONL). Hooks append these while /usta:task runs;
 * the dashboard folds them into a TaskSnapshot.
 */
interface EventBase {
  ts: string;
}

export type Phase =
  | "triage"
  | "analyze"
  | "brainstorm"
  | "plan"
  | "approve"
  | "implement"
  | "simplify"
  | "test"
  | "review";

export type ModelAlias = "opus" | "sonnet" | "haiku";
export type Level = "trivial" | "simple" | "moderate" | "complex" | "critical";
export type Severity = "critical" | "major" | "minor" | "nit";
export type RunStatus = "running" | "ok" | "failed";
export type PhaseStatus = "pending" | "active" | "done" | "failed" | "skipped";
export type PartStatus = "pending" | "in_progress" | "done";

export type AgentEvent = EventBase &
  (
    | { type: "task.started"; task: string; title: string; level: Level; phases: Phase[] }
    | { type: "phase.started"; phase: Phase }
    | { type: "phase.finished"; phase: Phase; status: "ok" | "failed" }
    | {
        type: "agent.started";
        id: string;
        agent: string;
        model: ModelAlias;
        effort: string;
        phase: Phase;
        part?: string;
        worktree?: string;
      }
    | {
        type: "agent.finished";
        id: string;
        status: "ok" | "failed";
        tokens: number;
        costUsd: number;
        summary?: string;
        /** The model and effort the agent really ran with, when they differ from what routing planned. */
        model?: ModelAlias;
        effort?: string;
      }
    | {
        type: "plan.part";
        part: string;
        title: string;
        files: string[];
        dependsOn: string[];
        worktree: boolean;
        status: PartStatus;
      }
    | { type: "approval.waiting" }
    | { type: "approval.granted"; by: "human" | "auto" }
    | { type: "tests"; passed: number; failed: number; skipped: number; durationMs: number }
    | {
        type: "finding";
        source: "reviewer" | "security-reviewer";
        severity: Severity;
        principle?: string;
        file: string;
        message: string;
      }
    | { type: "task.finished"; status: "ok" | "failed" }
  );

export interface AgentRun {
  id: string;
  agent: string;
  model: ModelAlias;
  effort: string;
  phase: Phase;
  part?: string;
  worktree?: string;
  status: RunStatus;
  startedAt: string;
  finishedAt?: string;
  tokens: number;
  costUsd: number;
  summary?: string;
}

export interface PlanPart {
  part: string;
  title: string;
  files: string[];
  dependsOn: string[];
  worktree: boolean;
  status: PartStatus;
}

export interface Finding {
  source: "reviewer" | "security-reviewer";
  severity: Severity;
  principle?: string;
  file: string;
  message: string;
}

export interface TestRun {
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
}

export interface TaskSnapshot {
  task?: { id: string; title: string; level: Level; startedAt: string; finishedAt?: string; status: RunStatus };
  phases: { phase: Phase; status: PhaseStatus }[];
  approval: "none" | "waiting" | "granted";
  agents: AgentRun[];
  parts: PlanPart[];
  tests?: TestRun;
  findings: Finding[];
}
