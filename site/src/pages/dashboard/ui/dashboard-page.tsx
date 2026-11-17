import { useMemo, useRef } from "react";
import { Link } from "react-router";

import { AgentRuns } from "@/widgets/agent-runs";
import { EventLog } from "@/widgets/event-log";
import { ModelUsage } from "@/widgets/model-usage";
import { PlanMap } from "@/widgets/plan-map";
import { ReviewFindings } from "@/widgets/review-findings";
import { TaskOverview } from "@/widgets/task-overview";
import { TestSummary } from "@/widgets/test-summary";

import { buildSnapshot, useEventStream } from "@/entities/agent-event";

import { ROUTES } from "@/shared/config";
import { gsap, MOTION_OK, useGSAP } from "@/shared/lib";
import { Logo } from "@/shared/ui";

import styles from "./dashboard-page.module.css";

export function DashboardPage() {
  const root = useRef<HTMLDivElement>(null);
  const { events, isLive, isReplaying, error, replay } = useEventStream();
  const snapshot = useMemo(() => buildSnapshot(events), [events]);
  // Running work is timed to now in live mode (the 2s poll re-renders), to the last event in a replay.
  const lastEventAt = isLive ? new Date().toISOString() : events.at(-1)?.ts;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(".js-panel", { y: 32, autoAlpha: 0, duration: 0.9, stagger: 0.06, ease: "expo.out" });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className={styles.page}>
      <header className={styles.topbar}>
        <Link to={ROUTES.HOME} aria-label="Bosh sahifa">
          <Logo size={24} />
        </Link>
        <span className={styles.sep}>/</span>
        <span className={styles.crumb}>dashboard</span>
        <div className={styles.right}>
          <span className={styles.mode} data-live={isLive}>
            <span className={styles.modeDot} aria-hidden="true" />
            {isLive ? "Jonli" : "Demo"}
          </span>
          {!isLive && (
            <button type="button" className={styles.button} onClick={replay} disabled={isReplaying}>
              {isReplaying ? "Ijro etilmoqda…" : "Qayta ijro"}
            </button>
          )}
        </div>
      </header>

      {error && (
        <p className={styles.error} role="alert">
          Hodisalar faylini o'qib bo'lmadi: {error}
        </p>
      )}

      <main className={styles.grid}>
        <div className={styles.full}>
          <TaskOverview snapshot={snapshot} lastEventAt={lastEventAt} />
        </div>
        <div className={styles.main}>
          <AgentRuns agents={snapshot.agents} lastEventAt={lastEventAt} />
          <ReviewFindings findings={snapshot.findings} />
        </div>
        <div className={styles.side}>
          <PlanMap parts={snapshot.parts} />
          <div className={styles.pair}>
            <TestSummary tests={snapshot.tests} />
            <ModelUsage agents={snapshot.agents} />
          </div>
          <EventLog events={events} />
        </div>
      </main>
    </div>
  );
}
