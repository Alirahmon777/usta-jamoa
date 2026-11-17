import type { PointerEvent, ReactNode } from "react";

import styles from "./feature-bento.module.css";

interface BentoCardProps {
  area: string;
  title: ReactNode;
  text: string;
  children: ReactNode;
  featured?: boolean;
}

/** Card shell with a soft spotlight that follows the pointer. */
export function BentoCard({ area, title, text, children, featured = false }: BentoCardProps) {
  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <article
      className={`${styles.card} ${featured ? styles.featured : ""} js-card`}
      style={{ gridArea: area }}
      onPointerMove={handlePointerMove}
    >
      <div className={styles.visual}>{children}</div>
      <div className={styles.copy}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardText}>{text}</p>
      </div>
    </article>
  );
}
