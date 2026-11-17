import styles from "./status-pill.module.css";

const LABEL: Record<Status, string> = {
  ok: "tayyor",
  running: "ishlamoqda",
  failed: "xato",
  pending: "navbatda",
  waiting: "kutmoqda",
  skipped: "o'tkazildi"
};

const ICON: Record<Status, string> = {
  ok: "✓",
  running: "●",
  failed: "✕",
  pending: "○",
  waiting: "❚❚",
  skipped: "–"
};

interface StatusPillProps {
  status: Status;
  label?: string;
}

export type Status = "ok" | "running" | "failed" | "pending" | "waiting" | "skipped";

/** Status is never colour-only: every pill carries an icon and a word. */
export function StatusPill({ status, label = LABEL[status] }: StatusPillProps) {
  return (
    <span className={styles.pill} data-status={status}>
      <span className={styles.icon} aria-hidden="true">
        {ICON[status]}
      </span>
      {label}
    </span>
  );
}
