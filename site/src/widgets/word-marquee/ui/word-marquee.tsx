import { useRef } from "react";

import { gsap, MOTION_OK, useGSAP } from "@/shared/lib";

import styles from "./word-marquee.module.css";

const ROWS = [
  ["triage", "analyze", "brainstorm", "plan", "approve"],
  ["code", "simplify", "test", "review", "ship"]
];

/** Two rows of oversized words that slide in opposite directions as the page scrolls. */
export function WordMarquee() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const trigger = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 };
        gsap.fromTo(".js-row-0", { xPercent: 0 }, { xPercent: -35, ease: "none", scrollTrigger: trigger });
        gsap.fromTo(".js-row-1", { xPercent: -35 }, { xPercent: 0, ease: "none", scrollTrigger: trigger });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.root} aria-label="Jarayon bosqichlari">
      {ROWS.map((words, index) => (
        <div key={words[0]} className={`${styles.row} js-row-${index}`} aria-hidden="true">
          {[...words, ...words].map((word, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: the list is duplicated for the loop, so words repeat
            <span key={i} className={i % 2 === index ? styles.solid : styles.outline}>
              {word}
              <i className={styles.dot} />
            </span>
          ))}
        </div>
      ))}
    </section>
  );
}
