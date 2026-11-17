import { type CSSProperties, useMemo } from "react";

import type { AgentEvent, AgentRun } from "@/entities/agent-event";

import { Panel } from "@/shared/ui";

import { getOfficeState } from "../lib/get-office-state";
import { OFFICE_AGENTS, TABLE_SPOT } from "../model/constants";
import styles from "./agent-office.module.css";
import { OfficeAgent } from "./office-agent";

interface AgentOfficeProps {
  events: AgentEvent[];
  agents: AgentRun[];
}

const DESKS = Object.entries(OFFICE_AGENTS).filter(([, agent]) => agent.roams);

export function AgentOffice({ events, agents }: AgentOfficeProps) {
  const office = useMemo(() => getOfficeState(events, agents), [events, agents]);
  const busy = office.filter((agent) => agent.activity !== "idle").length;

  return (
    <Panel title="Ofis" aside={`${busy} band · ${office.length} agent`}>
      <div className={styles.scroller}>
        <div className={styles.room}>
          <div className={styles.wall} aria-hidden="true" />
          {DESKS.map(([role, agent]) => (
            <span
              key={role}
              className={styles.spot}
              style={
                { left: `${agent.desk.x}%`, top: `${agent.desk.y}%`, "--agent-color": agent.color } as CSSProperties
              }
              aria-hidden="true"
            />
          ))}
          <span
            className={styles.table}
            style={{ left: `${TABLE_SPOT.x}%`, top: `${TABLE_SPOT.y}%` }}
            aria-hidden="true"
          />
          {office.map((agent) => (
            <OfficeAgent key={agent.role} agent={agent} />
          ))}
        </div>
      </div>
    </Panel>
  );
}
