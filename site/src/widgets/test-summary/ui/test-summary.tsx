import type { TestRun } from "@/entities/agent-event";

import { formatDuration } from "@/shared/lib";
import { Panel } from "@/shared/ui";

import styles from "./test-summary.module.css";

interface TestSummaryProps {
  tests?: TestRun;
  className?: string;
}

export function TestSummary({ tests, className }: TestSummaryProps) {
  if (!tests) {
    return (
      <Panel title="Testlar" className={className}>
        <p className={styles.empty}>Tester hali ishga tushmadi.</p>
      </Panel>
    );
  }

  const total = tests.passed + tests.failed + tests.skipped;
  const segments = [
    { key: "passed", label: "o'tdi", icon: "✓", value: tests.passed },
    { key: "failed", label: "yiqildi", icon: "✕", value: tests.failed },
    { key: "skipped", label: "o'tkazildi", icon: "–", value: tests.skipped }
  ];

  return (
    <Panel title="Testlar" aside={formatDuration(tests.durationMs)} className={className}>
      <p className={styles.hero}>
        {tests.passed}
        <span>/{total}</span>
      </p>
      <div className={styles.bar} aria-hidden="true">
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <span key={segment.key} data-kind={segment.key} style={{ flexGrow: segment.value }} />
          ))}
      </div>
      <ul className={styles.legend}>
        {segments.map((segment) => (
          <li key={segment.key} data-kind={segment.key}>
            <span className={styles.icon}>{segment.icon}</span>
            {segment.value} {segment.label}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
