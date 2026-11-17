import { AUDIT, GUARDS, LANES, LEVELS } from "../model/constants";
import styles from "./feature-visuals.module.css";

export function ApprovalVisual() {
  return (
    <div className={styles.approval}>
      <div className={styles.planCard}>
        <p className={styles.file}>docs/plans/2026-11-17-promo-kod/plan.md</p>
        <ul className={styles.planList}>
          <li>
            <b>A</b> API: promo-kod tekshiruvi <span>worktree</span>
          </li>
          <li>
            <b>B</b> Savat UI: chegirma qatori <span>worktree</span>
          </li>
          <li>
            <b>C</b> Integratsiya va testlar <span>A, B dan keyin</span>
          </li>
        </ul>
      </div>
      <div className={styles.blocked}>
        <span className={styles.lock} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <rect x="5" y="11" width="14" height="10" rx="3" fill="currentColor" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
        <code>Edit src/cart/promo.ts</code>
        <span className={styles.blockedTag}>bloklandi</span>
      </div>
      <p className={styles.approveCmd}>
        <span>›</span> /usta:approve
      </p>
    </div>
  );
}

export function RoutingVisual() {
  return (
    <ul className={styles.levels}>
      {LEVELS.map((level) => (
        <li key={level.name}>
          <span className={styles.levelName}>{level.name}</span>
          <span className={styles.levelTrack}>
            <span className={styles.levelBar} style={{ width: `${level.width}%` }} data-model={level.model} />
          </span>
          <span className={styles.levelModel}>{level.model}</span>
        </li>
      ))}
    </ul>
  );
}

export function WorktreesVisual() {
  return (
    <ul className={styles.lanes}>
      {LANES.map((lane) => (
        <li key={lane.name}>
          <span className={styles.branch}>{lane.name}</span>
          <span className={styles.laneTrack}>
            <span className={`${styles.laneBar} js-lane`} style={{ width: `${lane.progress}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function DocsVisual() {
  return (
    <pre className={styles.tree}>
      {`docs/
├─ plans/2026-11-17-promo-kod/
│  ├─ brainstorm.md
│  ├─ plan.md
│  ├─ progress.md
│  └─ `}
      <b>HANDOFF.md</b>
      {`
├─ memory/MEMORY.md
├─ adr/0001-narx-hisoblash.md
└─ known-issues/shop-bugs.md`}
    </pre>
  );
}

export function GuardsVisual() {
  return (
    <ul className={styles.guards}>
      {GUARDS.map((cmd) => (
        <li key={cmd}>
          <code>{cmd}</code>
          <span>✕ bloklandi</span>
        </li>
      ))}
    </ul>
  );
}

export function PrinciplesVisual() {
  return (
    <p className={styles.principles} aria-hidden="true">
      <span>KISS</span>
      <span>YAGNI</span>
      <span className={styles.faint}>DRY</span>
      <span className={styles.faint}>SOLID</span>
    </p>
  );
}

export function BrainstormVisual() {
  return (
    <div className={styles.chat}>
      <p className={styles.bubble}>Chegirma serverda hisoblansinmi yoki klientda?</p>
      <p className={`${styles.bubble} ${styles.bubbleHint}`}>Tavsiya: serverda. Narxni klient o'zgartira olmaydi.</p>
      <p className={`${styles.bubble} ${styles.bubbleMe}`}>Tavsiyalar ma'qul</p>
    </div>
  );
}

export function AuditVisual() {
  return (
    <ul className={styles.audit}>
      {AUDIT.map((item) => (
        <li key={item.label}>
          <b>{item.value}</b>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
