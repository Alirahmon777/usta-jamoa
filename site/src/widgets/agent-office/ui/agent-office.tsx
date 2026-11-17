import { type CSSProperties, useMemo } from "react";

import type { AgentEvent, TaskSnapshot } from "@/entities/agent-event";

import { Panel } from "@/shared/ui";

import { getOfficeState } from "../lib/get-office-state";
import { ASK_SPOT } from "../model/constants";
import styles from "./agent-office.module.css";
import { OfficeAgent } from "./office-agent";
import { OfficeProps } from "./office-props";

interface AgentOfficeProps {
  events: AgentEvent[];
  snapshot: TaskSnapshot;
}

export function AgentOffice({ events, snapshot }: AgentOfficeProps) {
  const office = useMemo(() => getOfficeState(events, snapshot), [events, snapshot]);
  const busy = office.filter((agent) => agent.activity !== "idle").length;
  const isAsking = snapshot.approval === "waiting";

  return (
    <Panel title="Ofis" aside={`${busy} band · ${office.length} agent`}>
      <div className={styles.scroller}>
        <div
          className={styles.room}
          data-asking={isAsking}
          style={{ "--ask-x": `${ASK_SPOT.x}%`, "--ask-y": `${ASK_SPOT.y - 14}%` } as CSSProperties}
        >
          <div className={styles.wall} aria-hidden="true" />
          <OfficeProps />
          {office.map((agent) => (
            <OfficeAgent key={agent.role} agent={agent} />
          ))}
          <div className={styles.dim} aria-hidden="true" />
          {isAsking && (
            <div className={styles.banner} role="status">
              <span className={styles.pulse} aria-hidden="true" />
              <div>
                <p className={styles.bannerTitle}>Tasdiqingiz kerak</p>
                <p className={styles.bannerText}>
                  Reja tayyor. Ko'rib chiqing va <code>/usta:approve</code> bilan tasdiqlang.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
