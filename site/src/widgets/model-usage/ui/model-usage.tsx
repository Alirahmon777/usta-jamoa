import { type AgentRun, MODELS } from "@/entities/agent-event";

import { formatTokens, formatUsd } from "@/shared/lib";
import { Panel } from "@/shared/ui";

import styles from "./model-usage.module.css";

interface ModelUsageProps {
  agents: AgentRun[];
  className?: string;
}

export function ModelUsage({ agents, className }: ModelUsageProps) {
  const rows = MODELS.map((model) => {
    const runs = agents.filter((agent) => agent.model === model);
    return {
      model,
      runs: runs.length,
      tokens: runs.reduce((sum, run) => sum + run.tokens, 0),
      cost: runs.reduce((sum, run) => sum + run.costUsd, 0)
    };
  });
  const total = rows.reduce((sum, row) => sum + row.tokens, 0);

  return (
    <Panel title="Modellar bo'yicha token" aside={formatTokens(total)} className={className}>
      <div className={styles.bar} role="img" aria-label="Tokenlarning modellar bo'yicha ulushi">
        {rows
          .filter((row) => row.tokens > 0)
          .map((row) => (
            <span
              key={row.model}
              className={styles.segment}
              data-model={row.model}
              style={{ flexGrow: row.tokens }}
              title={`${row.model}: ${formatTokens(row.tokens)} token`}
            />
          ))}
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Model</th>
            <th>Agent</th>
            <th>Token</th>
            <th>Narx</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.model}>
              <td>
                <span className={styles.swatch} data-model={row.model} aria-hidden="true" />
                {row.model}
              </td>
              <td>{row.runs}</td>
              <td>{formatTokens(row.tokens)}</td>
              <td>{formatUsd(row.cost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
