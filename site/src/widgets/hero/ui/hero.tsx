import { useRef } from "react";

import { INSTALL_COMMAND, SECTIONS } from "@/shared/config";
import { gsap, MOTION_OK, SplitText, useGSAP } from "@/shared/lib";
import { CopyCommand } from "@/shared/ui";

import styles from "./hero.module.css";
import { HeroTerminal } from "./hero-terminal";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create(title.current, { type: "lines,chars", mask: "lines" });

        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from(split.chars, { yPercent: 115, duration: 1.3, stagger: 0.022 })
          .from(".js-fade", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08 }, "-=1")
          .from(".js-terminal", { y: 120, autoAlpha: 0, scale: 0.94, duration: 1.4 }, "-=0.9")
          .from(".js-line", { x: -12, autoAlpha: 0, duration: 0.5, stagger: 0.16, ease: "power2.out" }, "-=0.6");

        gsap.to(title.current, {
          yPercent: -30,
          scale: 0.9,
          autoAlpha: 0.15,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "60% top", scrub: true }
        });

        gsap.to(".js-glow", {
          yPercent: 40,
          scale: 1.3,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true }
        });

        return () => split.revert();
      });
    },
    { scope: root }
  );

  return (
    <section id={SECTIONS.TOP} ref={root} className={styles.hero}>
      <div className={`${styles.glow} js-glow`} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <p className={`${styles.badge} js-fade`}>
          <span className={styles.badgeDot} /> Claude Code plugin · 8 agent · 1 buyruq
        </p>
        <h1 ref={title} className={`display ${styles.title}`}>
          Bitta buyruq.
          <br />
          <span className={styles.titleMuted}>Butun jamoa.</span>
        </h1>
        <p className={`${styles.lead} js-fade`}>
          usta so'rovingizni tahlil qiladi, reja tuzadi, tasdig'ingizni kutadi, keyin kod yozadi, testlaydi va review
          qiladi. Har qadam <code>docs/</code> ga yoziladi.
        </p>
        <div className={`${styles.actions} js-fade`}>
          <CopyCommand command={INSTALL_COMMAND} />
        </div>
        <HeroTerminal />
      </div>
    </section>
  );
}
