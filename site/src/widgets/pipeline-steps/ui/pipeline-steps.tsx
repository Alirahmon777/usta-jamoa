import { useRef } from "react";

import { SECTIONS } from "@/shared/config";
import { gsap, MOTION_OK, useGSAP } from "@/shared/lib";

import { STEPS } from "../model/constants";
import styles from "./pipeline-steps.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** Pinned on wide screens: scrolling walks the highlight through the nine steps. */
export function PipelineSteps() {
  const root = useRef<HTMLElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(`${MOTION_OK} and (min-width: 960px) and (min-height: 640px)`, () => {
        const steps = gsap.utils.toArray<HTMLElement>(".js-step");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${steps.length * 55}%`,
            pin: true,
            scrub: 0.5,
            onUpdate: ({ progress }) => {
              const index = Math.max(1, Math.ceil(progress * steps.length));
              if (counter.current) counter.current.textContent = pad(index);
            }
          }
        });

        tl.fromTo(".js-rail", { scaleY: 0 }, { scaleY: 1, ease: "none", duration: steps.length }, 0);
        for (const [i, step] of steps.entries()) {
          tl.to(step, { opacity: 1, x: 12, duration: 0.4 }, i).to(step, { x: 0, duration: 0.6 }, i + 0.4);
          tl.to(step.querySelector(".js-bullet"), { backgroundColor: "#ff6a2b", scale: 1.4, duration: 0.3 }, i);
        }
      });

      mm.add(`${MOTION_OK} and (max-width: 959px), ${MOTION_OK} and (max-height: 639px)`, () => {
        for (const step of gsap.utils.toArray<HTMLElement>(".js-step")) {
          gsap.from(step, { y: 30, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: step, start: "top 90%" } });
        }
      });
    },
    { scope: root }
  );

  return (
    <section id={SECTIONS.PROCESS} ref={root} className={styles.root}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <p className="eyebrow">Jarayon</p>
          <h2 className={`display ${styles.title}`}>
            To'qqiz qadam.
            <br />
            <span className={styles.dim}>Sakrash yo'q.</span>
          </h2>
          <p className={styles.lead}>
            Har bosqich o'z agentiga va murakkablikka mos modelga ega. Sessiya uzilsa, <code>HANDOFF.md</code> dan davom
            etadi.
          </p>
          <p className={styles.counter} aria-hidden="true">
            <span ref={counter}>01</span>
            <span className={styles.total}>/{pad(STEPS.length)}</span>
          </p>
        </div>

        <div className={styles.track}>
          <span className={`${styles.rail} js-rail`} aria-hidden="true" />
          <ol className={styles.list}>
            {STEPS.map((step, i) => (
              <li key={step.name} className={`${styles.step} js-step`}>
                <span className={`${styles.bullet} js-bullet`} aria-hidden="true" />
                <span className={styles.index}>{pad(i + 1)}</span>
                <div>
                  <h3 className={styles.name}>{step.name}</h3>
                  <p className={styles.text}>{step.text}</p>
                </div>
                <span className={styles.chip} data-model={step.model}>
                  {step.agent} · {step.model}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
