import { useRef } from "react";

import { gsap, MOTION_OK, SplitText, useGSAP } from "@/shared/lib";

import styles from "./statement.module.css";

/** Oversized sentence whose words light up one by one as it scrolls through the viewport. */
export function Statement() {
  const root = useRef<HTMLElement>(null);
  const text = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create(text.current, { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.12 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: text.current, start: "top 80%", end: "bottom 45%", scrub: true }
          }
        );
        return () => split.revert();
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className={styles.root}>
      <div className="container">
        <p ref={text} className={`display ${styles.text}`}>
          Kod yozishdan oldin o'ylaydi. Yozgandan keyin <em>tekshiradi.</em> Siz esa faqat muhim qarorni qabul qilasiz.
        </p>
      </div>
    </section>
  );
}
