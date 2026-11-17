import { useRef } from "react";
import { Link } from "react-router";

import { ROUTES, SECTIONS } from "@/shared/config";
import { gsap, MOTION_OK, useGSAP } from "@/shared/lib";

import { COMMANDS } from "../model/constants";
import styles from "./command-list.module.css";

/** Decorative mini-stepper: five phases done, the sixth running. */
const previewState = (index: number) => {
  if (index < 5) return "done";
  return index === 5 ? "active" : "todo";
};

export function CommandList() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(".js-cmd", {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "expo.out",
          scrollTrigger: { trigger: ".js-cmds", start: "top 80%" }
        });
        gsap.from(".js-preview", {
          y: 100,
          rotateX: 18,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: ".js-preview", start: "top bottom", end: "top 55%", scrub: true }
        });
      });
    },
    { scope: root }
  );

  return (
    <section id={SECTIONS.COMMANDS} ref={root} className={styles.root}>
      <div className={`container ${styles.grid}`}>
        <div>
          <p className="eyebrow">Buyruqlar</p>
          <h2 className={`display ${styles.title}`}>
            Beshta buyruq. <span className={styles.dim}>Hammasi shu.</span>
          </h2>
          <ul className={`${styles.list} js-cmds`}>
            {COMMANDS.map((cmd) => (
              <li key={cmd.name} className={`${styles.item} js-cmd`}>
                <code className={styles.name}>
                  {cmd.name} <span>{cmd.arg}</span>
                </code>
                <p>{cmd.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <Link to={ROUTES.DASHBOARD} className={`${styles.preview} js-preview`}>
          <div className={styles.previewHead}>
            <span className={styles.live} /> Jonli dashboard
            <span className={styles.arrow} aria-hidden="true">
              ↗
            </span>
          </div>
          <p className={styles.previewTitle}>Agentlar nima qilayotganini real vaqtda ko'ring.</p>
          <div className={styles.mini} aria-hidden="true">
            <div className={styles.miniSteps}>
              {Array.from({ length: 9 }, (_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static decorative bars
                <span key={i} data-state={previewState(i)} />
              ))}
            </div>
            <div className={styles.miniRows}>
              <span style={{ width: "92%" }} />
              <span style={{ width: "64%" }} />
              <span style={{ width: "78%" }} />
              <span style={{ width: "40%" }} />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
