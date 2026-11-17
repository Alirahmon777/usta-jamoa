import type { ReactNode } from "react";

import styles from "./panel.module.css";

interface PanelProps {
  title: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Panel({ title, aside, className = "", children }: PanelProps) {
  return (
    <section className={`${styles.panel} ${className} js-panel`}>
      <header className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {aside && <div className={styles.aside}>{aside}</div>}
      </header>
      {children}
    </section>
  );
}
