import { useRef } from "react";

import { SECTIONS } from "@/shared/config";
import { gsap, MOTION_OK, SplitText, useGSAP } from "@/shared/lib";

import { BentoCard } from "./bento-card";
import styles from "./feature-bento.module.css";
import {
  ApprovalVisual,
  AuditVisual,
  BrainstormVisual,
  DocsVisual,
  GuardsVisual,
  PrinciplesVisual,
  RoutingVisual,
  WorktreesVisual
} from "./feature-visuals";

export function FeatureBento() {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create(title.current, { type: "words,lines", mask: "lines" });
        gsap.from(split.words, {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.05,
          ease: "expo.out",
          scrollTrigger: { trigger: title.current, start: "top 85%" }
        });

        for (const [i, card] of gsap.utils.toArray<HTMLElement>(".js-card").entries()) {
          gsap.from(card, {
            y: 80,
            scale: 0.96,
            autoAlpha: 0,
            duration: 1.1,
            delay: (i % 3) * 0.08,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 92%" }
          });
        }

        gsap.from(".js-lane", {
          width: 0,
          duration: 1.4,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ".js-lane", start: "top 90%" }
        });

        return () => split.revert();
      });
    },
    { scope: root }
  );

  return (
    <section id={SECTIONS.FEATURES} ref={root} className={styles.root}>
      <div className="container">
        <div className={styles.head}>
          <p className="eyebrow">Imkoniyatlar</p>
          <h2 ref={title} className={`display ${styles.title}`}>
            Jamoa. Lekin intizom bilan.
          </h2>
        </div>

        <div className={styles.grid}>
          <BentoCard
            area="approval"
            featured
            title="Tasdiqsiz kod yo'q"
            text="Reja tasdiqlanmaguncha Edit va Write bloklanadi. Buni prompt emas, hook majburlaydi, va /usta:approve ni faqat siz yoza olasiz."
          >
            <ApprovalVisual />
          </BentoCard>
          <BentoCard
            area="routing"
            title="Murakkablikka mos model"
            text="Triage darajani aniqlaydi, routing.json esa har agentga model va effort beradi."
          >
            <RoutingVisual />
          </BentoCard>
          <BentoCard
            area="worktrees"
            title="Parallel worktree'lar"
            text="Fayllari kesishmaydigan qismlar bir vaqtda, alohida branch'larda yoziladi."
          >
            <WorktreesVisual />
          </BentoCard>
          <BentoCard
            area="docs"
            title="Sessiya uzilsa ham"
            text="Brainstorm, reja, progress va HANDOFF har qadamdan keyin yangilanadi. /usta:resume shu joydan davom etadi."
          >
            <DocsVisual />
          </BentoCard>
          <BentoCard
            area="guards"
            title="Xavfli buyruqlar to'xtatiladi"
            text="guard-bash hooki halokatli buyruqlarni agent ishga tushirishidan oldin ushlaydi."
          >
            <GuardsVisual />
          </BentoCard>
          <BentoCard
            area="principles"
            title="KISS va YAGNI ustun"
            text="Bitta implementatsiyali interfeys xato hisoblanadi."
          >
            <PrinciplesVisual />
          </BentoCard>
          <BentoCard
            area="brainstorm"
            title="Savol, tavsiyasi bilan"
            text="Faqat rejani o'zgartiradigan savollar, bitta xabarda."
          >
            <BrainstormVisual />
          </BentoCard>
          <BentoCard
            area="audit"
            title="/usta:audit"
            text="Tayyor loyihani tekshiradi va known-issues ga yozadi. Kodni o'zgartirmaydi."
          >
            <AuditVisual />
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
