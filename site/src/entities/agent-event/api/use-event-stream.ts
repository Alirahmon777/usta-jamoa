import { useCallback, useEffect, useState } from "react";

import { parseJsonl } from "../lib/parse-jsonl";
import type { AgentEvent } from "../model/types";

const POLL_MS = 2000;
const LIVE_URL = import.meta.env.VITE_EVENTS_URL as string | undefined;
const DEMO_URL = "/mock/events.jsonl";

/** Demo replay keeps the rhythm of the real log, compressed: 1s of work ≈ 12ms, clamped. */
const replayDelay = (prev: AgentEvent | undefined, next: AgentEvent | undefined) => {
  if (!prev || !next) return 300;
  const gapMs = new Date(next.ts).getTime() - new Date(prev.ts).getTime();
  return Math.min(1600, Math.max(220, gapMs / 80));
};

async function fetchEvents(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseJsonl(await response.text());
}

/**
 * Live mode (VITE_EVENTS_URL set): polls the JSONL file the hooks append to.
 * Demo mode: loads the bundled sample and replays it event by event.
 */
export function useEventStream() {
  const isLive = Boolean(LIVE_URL);
  const [all, setAll] = useState<AgentEvent[]>([]);
  const [visible, setVisible] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = () =>
      fetchEvents(LIVE_URL ?? DEMO_URL, controller.signal)
        .then((events) => {
          setAll(events);
          if (isLive) setVisible(events.length);
          setError(null);
        })
        .catch((cause: Error) => {
          if (!controller.signal.aborted) setError(cause.message);
        });

    load();
    const timer = isLive ? setInterval(load, POLL_MS) : undefined;
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [isLive]);

  useEffect(() => {
    if (isLive || visible >= all.length) return;
    const timer = setTimeout(() => setVisible((count) => count + 1), replayDelay(all[visible - 1], all[visible]));
    return () => clearTimeout(timer);
  }, [isLive, visible, all]);

  const replay = useCallback(() => setVisible(0), []);

  return { events: all.slice(0, visible), isLive, isReplaying: !isLive && visible < all.length, error, replay };
}
