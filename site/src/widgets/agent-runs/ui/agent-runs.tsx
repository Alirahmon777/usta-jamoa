import { type AgentRun, ModelChip, PHASE_LABEL } from "@/entities/agent-event";

import { elapsedMs, formatDuration, formatTokens } from "@/shared/lib";
import { Panel, StatusPill } from "@/shared/ui";

import styles from "./agent-runs.module.css";

interface AgentRunsProps {
  agents: AgentRun[];
  lastEventAt?: string;
  className?: string;
}

export function AgentRuns({ agents, lastEventAt, className }: AgentRunsProps) {
  const running = agents.filter((agent) => agent.status === "running").length;

  return (
    <Panel title="Agentlar" aside={`${running} ishlamoqda · ${agents.length} jami`} className={className}>
      {agents.length === 0 ? (
        <p className={styles.empty}>Hali agent ishga tushmadi.</p>
      ) : (
        <ul className={styles.list}>
          <li className={styles.orchestrator}>
            <span className={styles.node} aria-hidden="true" />
            <strong>orchestrator</strong>
            <ModelChip model="opus" />
          </li>
          {agents.map((agent) => (
            <li key={agent.id} className={styles.row} data-status={agent.status}>
              <span className={styles.branch} aria-hidden="true" />
              <div className={styles.who}>
                <p className={styles.name}>
                  {agent.agent}
                  {agent.part && <span className={styles.part}>qism {agent.part}</span>}
                </p>
                <p className={styles.summary}>
                  {agent.worktree && <code>{agent.worktree}</code>}
                  {agent.summary ?? PHASE_LABEL[agent.phase]}
                </p>
              </div>
              <ModelChip model={agent.model} effort={agent.effort} />
              <span className={styles.metric}>
                {formatDuration(elapsedMs(agent.startedAt, agent.finishedAt ?? lastEventAt))}
              </span>
              <span className={styles.metric}>{agent.tokens ? formatTokens(agent.tokens) : "–"}</span>
              <StatusPill status={agent.status} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
