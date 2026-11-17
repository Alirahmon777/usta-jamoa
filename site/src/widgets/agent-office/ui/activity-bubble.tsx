import type { Activity } from "../model/types";
import styles from "./activity-bubble.module.css";

interface ActivityBubbleProps {
  activity: Activity;
}

export function ActivityBubble({ activity }: ActivityBubbleProps) {
  if (activity === "idle") return null;

  if (activity === "asking") {
    return (
      <span className={styles.alert} aria-hidden="true">
        !
      </span>
    );
  }

  if (activity === "coding") {
    return (
      <span className={styles.code} aria-hidden="true">
        <span>{"</>"}</span>
        <span>{"{ }"}</span>
        <span>;</span>
      </span>
    );
  }

  if (activity === "planning") {
    return (
      <span className={styles.notebook} aria-hidden="true">
        <span className={styles.line} />
        <span className={styles.line} />
        <span className={styles.line} />
        <span className={styles.pencil} />
      </span>
    );
  }

  return (
    <span className={styles.bubble} data-kind={activity} aria-hidden="true">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </span>
  );
}
