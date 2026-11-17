import type { PlanPart } from "@/entities/agent-event";

import { Panel, type Status, StatusPill } from "@/shared/ui";

import styles from "./plan-map.module.css";

interface PlanMapProps {
  parts: PlanPart[];
  className?: string;
}

const PART_STATUS: Record<PlanPart["status"], Status> = {
  pending: "pending",
  in_progress: "running",
  done: "ok"
};

export function PlanMap({ parts, className }: PlanMapProps) {
  const done = parts.filter((part) => part.status === "done").length;

  return (
    <Panel title="Parallel xarita" aside={`${done}/${parts.length} qism`} className={className}>
      {parts.length === 0 ? (
        <p className={styles.empty}>Reja hali tuzilmadi.</p>
      ) : (
        <ul className={styles.list}>
          {parts.map((part) => (
            <li key={part.part} className={styles.part} data-status={part.status}>
              <span className={styles.letter}>{part.part}</span>
              <div className={styles.body}>
                <p className={styles.title}>{part.title}</p>
                <p className={styles.meta}>
                  <span className={styles.tag} data-worktree={part.worktree}>
                    {part.worktree ? "worktree" : "asosiy daraxt"}
                  </span>
                  {part.dependsOn.length > 0 && <span>{part.dependsOn.join(", ")} dan keyin</span>}
                  <span>{part.files.length} fayl</span>
                </p>
                <ul className={styles.files}>
                  {part.files.map((file) => (
                    <li key={file}>{file}</li>
                  ))}
                </ul>
              </div>
              <StatusPill status={PART_STATUS[part.status]} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
