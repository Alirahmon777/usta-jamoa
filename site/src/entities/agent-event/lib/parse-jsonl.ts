import type { AgentEvent } from "../model/types";

/** Parses a JSONL log. A half-written last line (the hook may still be appending) is skipped. */
export function parseJsonl(text: string): AgentEvent[] {
  const events: AgentEvent[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line) as AgentEvent);
    } catch {
      // incomplete line, it will be complete on the next poll
    }
  }
  return events;
}
