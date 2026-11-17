import type { AgentEvent } from "@/entities/agent-event";

import { formatClock } from "@/shared/lib";
import { Panel } from "@/shared/ui";

import { describeEvent } from "../lib/describe-event";
import styles from "./event-log.module.css";

interface EventLogProps {
  events: AgentEvent[];
  className?: string;
}

const MAX_ROWS = 40;

export function EventLog({ events, className }: EventLogProps) {
  // The log is append-only, so an event's position is a stable identity.
  const rows = events
    .map((event, seq) => ({ event, seq }))
    .slice(-MAX_ROWS)
    .reverse();

  return (
    <Panel title="Hodisalar jurnali" aside={`${events.length} hodisa`} className={className}>
      <ol className={styles.list}>
        {rows.map(({ event, seq }) => (
          <li key={seq} className={styles.row}>
            <time className={styles.time} dateTime={event.ts}>
              {formatClock(event.ts)}
            </time>
            <span className={styles.type}>{event.type}</span>
            <span className={styles.text}>{describeEvent(event)}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
