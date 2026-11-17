import type { Finding, Severity } from "@/entities/agent-event";

import { Panel } from "@/shared/ui";

import styles from "./review-findings.module.css";

interface ReviewFindingsProps {
  findings: Finding[];
  className?: string;
}

const SEVERITY_ICON: Record<Severity, string> = {
  critical: "▲",
  major: "◆",
  minor: "●",
  nit: "○"
};

export function ReviewFindings({ findings, className }: ReviewFindingsProps) {
  return (
    <Panel title="Review topilmalari" aside={`${findings.length} ta`} className={className}>
      {findings.length === 0 ? (
        <p className={styles.empty}>Topilma yo'q.</p>
      ) : (
        <ul className={styles.list}>
          {findings.map((finding) => (
            <li key={`${finding.file}:${finding.message}`} className={styles.item}>
              <span className={styles.severity} data-severity={finding.severity}>
                <span aria-hidden="true">{SEVERITY_ICON[finding.severity]}</span>
                {finding.severity}
              </span>
              <div className={styles.body}>
                <p className={styles.message}>{finding.message}</p>
                <p className={styles.meta}>
                  {finding.principle && <span className={styles.principle}>{finding.principle}</span>}
                  <code>{finding.file}</code>
                  <span>{finding.source}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
