import { useRef } from "react";

import { INSTALL_COMMAND, MARKETPLACE_COMMAND, SECTIONS } from "@/shared/config";
import { gsap, MOTION_OK, SplitText, useGSAP } from "@/shared/lib";
import { CopyCommand } from "@/shared/ui";

import styles from "./final-cta.module.css";

export function FinalCta() {
  const root = useRef<HTMLElement>(null);
  const word = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create(word.current, { type: "lines,chars", mask: "lines" });
        gsap.from(split.chars, {
          yPercent: 100,
          stagger: 0.06,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom bottom", scrub: 0.8 }
        });
        return () => split.revert();
      });
    },
    { scope: root }
  );

  return (
    <section id={SECTIONS.INSTALL} ref={root} className={styles.root}>
      <div className={`container ${styles.inner}`}>
        <p className="eyebrow">O'rnatish</p>
        <h2 className={styles.title}>Ikki qator. Keyin jamoa sizniki.</h2>
        <div className={styles.commands}>
          <CopyCommand command={MARKETPLACE_COMMAND} />
          <CopyCommand command={INSTALL_COMMAND} />
        </div>
      </div>
      <p ref={word} className={styles.word} aria-hidden="true">
        usta
      </p>
      <footer className={`container ${styles.footer}`}>
        <span>usta-jamoa</span>
        <span>Claude Code uchun qurilgan</span>
      </footer>
    </section>
  );
}
