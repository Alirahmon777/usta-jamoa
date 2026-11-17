import { type CSSProperties, useRef } from "react";

import { gsap, MOTION_OK, useGSAP } from "@/shared/lib";

import { getArrivalFacing, getHomeSpot, getRandomLoungeSpot, getTargetSpot } from "../lib/office-spots";
import { placeAt, walkTo } from "../lib/walk-to";
import { ACTIVITY, OFFICE_AGENTS } from "../model/constants";
import type { OfficeAgentState } from "../model/types";
import { ActivityBubble } from "./activity-bubble";
import styles from "./office-agent.module.css";

interface OfficeAgentProps {
  agent: OfficeAgentState;
}

export function OfficeAgent({ agent }: OfficeAgentProps) {
  const { role, activity, runs } = agent;
  const root = useRef<HTMLDivElement>(null);
  const look = OFFICE_AGENTS[role];
  const home = useRef(getHomeSpot(role)).current;

  useGSAP(
    (_context, contextSafe) => {
      const element = root.current;
      if (!element || !contextSafe) return;

      const desk = element.parentElement?.querySelector<HTMLElement>(`[data-desk="${role}"]`);
      const sit = (isSeated: boolean) => {
        element.dataset.pose = isSeated ? "desk" : "stand";
        if (desk) desk.dataset.occupied = String(isSeated);
      };

      gsap.killTweensOf(element);
      sit(false);
      const target = getTargetSpot(role, activity);
      const facing = getArrivalFacing(role, activity);
      const arrive = () => {
        if (facing) element.dataset.facing = facing;
        if (activity === "coding") sit(true);
      };

      const roam = contextSafe(() => {
        walkTo(element, getRandomLoungeSpot(), () => {
          gsap.to(element, { duration: gsap.utils.random(1.5, 5), onComplete: roam });
        });
      });

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        if (target) walkTo(element, target, arrive);
        else gsap.to(element, { duration: gsap.utils.random(0.2, 2), onComplete: roam });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        placeAt(element, target ?? home);
        arrive();
      });
    },
    { dependencies: [role, activity], scope: root }
  );

  return (
    <div
      ref={root}
      className={styles.agent}
      data-activity={activity}
      data-pose="stand"
      data-facing="right"
      data-walking="false"
      style={{ left: `${home.x}%`, top: `${home.y}%`, "--agent-color": look.color } as CSSProperties}
      title={`${role}: ${ACTIVITY[activity]}`}
    >
      <div className={styles.body}>
        <img className={styles.stand} src={`/office/${role}-idle.webp`} alt="" draggable={false} />
        {look.work === "coding" && (
          <img className={styles.desk} src={`/office/${role}-desk.webp`} alt="" draggable={false} />
        )}
      </div>
      <ActivityBubble activity={activity} />
      <p className={styles.tag}>
        <span className={styles.swatch} aria-hidden="true" />
        {role}
        {runs > 1 && <span className={styles.count}>×{runs}</span>}
        <span className={styles.status}>{ACTIVITY[activity]}</span>
      </p>
    </div>
  );
}
