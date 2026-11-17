import styles from "./hero.module.css";

const LINES = [
  { agent: "triage", text: "complex · xavf: payments", model: "sonnet" },
  { agent: "analyzer", text: "12 fayl, 3 modul, 2 mavjud pattern", model: "haiku" },
  { agent: "brainstorm", text: "2 yondashuv · 3 savol · tavsiya: B", model: "opus" },
  { agent: "planner", text: "plan.md · 3 qism, 2 tasi parallel", model: "opus" }
] as const;

export function HeroTerminal() {
  return (
    <div className={`${styles.terminal} js-terminal`}>
      <div className={styles.terminalBar}>
        <span />
        <span />
        <span />
        <p>claude · ~/shop</p>
      </div>
      <div className={styles.terminalBody}>
        <p className={`${styles.cmd} js-line`}>
          <span className={styles.accent}>›</span> /usta:task Savatga promo-kod chegirmasini qo'sh
        </p>
        {LINES.map((line) => (
          <p key={line.agent} className={`${styles.row} js-line`}>
            <span className={styles.ok}>✓</span>
            <span className={styles.agent}>{line.agent}</span>
            <span className={styles.text}>{line.text}</span>
            <span className={styles.model} data-model={line.model}>
              {line.model}
            </span>
          </p>
        ))}
        <p className={`${styles.wait} js-line`}>
          <span className={styles.pulse} /> Reja tasdig'ingizni kutmoqda · <kbd>/usta:approve</kbd>
        </p>
      </div>
    </div>
  );
}
