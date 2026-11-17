import type { Phase } from "./types";

export const ALL_PHASES: Phase[] = [
  "triage",
  "analyze",
  "brainstorm",
  "plan",
  "approve",
  "implement",
  "simplify",
  "test",
  "review"
];

export const PHASE_LABEL: Record<Phase, string> = {
  triage: "Triage",
  analyze: "Tahlil",
  brainstorm: "Brainstorm",
  plan: "Reja",
  approve: "Tasdiq",
  implement: "Kod",
  simplify: "Soddalashtirish",
  test: "Test",
  review: "Review"
};

/** Fixed categorical order (validated for colour-vision deficiency): sonnet, opus, haiku. */
export const MODELS = ["sonnet", "opus", "haiku"] as const;
