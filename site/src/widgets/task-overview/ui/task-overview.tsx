import { PHASE_LABEL, type PhaseStatus, type TaskSnapshot } from "@/entities/agent-event";

import { elapsedMs, formatDuration, formatTokens, formatUsd } from "@/shared/lib";
import { type Status, StatusPill } from "@/shared/ui";

import styles from "./task-overview.module.css";

interface TaskOverviewProps {
  snapshot: TaskSnapshot;
  lastEventAt?: string;
}

const PHASE_TO_STATUS: Record<PhaseStatus, Status> = {
  pending: "pending",
  active: "running",
  done: "ok",
  failed: "failed",
  skipped: "skipped"
};

export function TaskOverview({ snapshot, lastEventAt }: TaskOverviewProps) {
  const { task, phases, agents, approval } = snapshot;
  const tokens = agents.reduce((sum, agent) => sum + agent.tokens, 0);
  const cost = agents.reduce((sum, agent) => sum + agent.costUsd, 0);
  const elapsed = task ? elapsedMs(task.startedAt, task.finishedAt ?? lastEventAt) : 0;

  return (
    <section className={`${styles.root} js-panel`}>
      <div className={styles.head}>
        <div>
          <p className={styles.path}>docs/plans/{task?.id ?? "…"}</p>
          <h1 className={styles.title}>{task?.title ?? "Task kutilmoqda"}</h1>
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>Daraja</dt>
            <dd>{task?.level ?? "–"}</dd>
          </div>
          <div>
            <dt>Vaqt</dt>
            <dd>{formatDuration(elapsed)}</dd>
          </div>
          <div>
            <dt>Token</dt>
            <dd>{formatTokens(tokens)}</dd>
          </div>
          <div>
            <dt>Narx</dt>
            <dd>{formatUsd(cost)}</dd>
          </div>
        </dl>
      </div>

      {approval === "waiting" && (
        <p className={styles.approval}>
          <span className={styles.pulse} aria-hidden="true" />
          Reja tasdig'ingizni kutmoqda. Terminalda <kbd>/usta:approve</kbd> yozing.
        </p>
      )}

      <ol className={styles.phases}>
        {phases.map(({ phase, status }, index) => {
          const shown = phase === "approve" && approval === "waiting" ? "waiting" : PHASE_TO_STATUS[status];
          return (
            <li key={phase} className={styles.phase} data-status={shown}>
              <span className={styles.bar} />
              <span className={styles.phaseName}>
                <span className={styles.phaseIndex}>{String(index + 1).padStart(2, "0")}</span>
                {PHASE_LABEL[phase]}
              </span>
              <StatusPill status={shown} />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
