export const ACTIVITY = {
  idle: "Dam olmoqda",
  coding: "Kod yozmoqda",
  planning: "Reja yozmoqda",
  thinking: "O'ylamoqda",
  talking: "Gaplashmoqda"
} as const;

export const OFFICE_AGENTS = {
  orchestrator: { color: "#f5c451", desk: { x: 44, y: 88 }, work: "thinking", roams: false },
  triage: { color: "#ff6a2b", desk: { x: 16, y: 46 }, work: "thinking", roams: true },
  analyzer: { color: "#60a5fa", desk: { x: 38, y: 46 }, work: "thinking", roams: true },
  planner: { color: "#a78bfa", desk: { x: 60, y: 46 }, work: "planning", roams: true },
  coder: { color: "#2dd4bf", desk: { x: 82, y: 46 }, work: "coding", roams: true },
  simplifier: { color: "#4ade80", desk: { x: 16, y: 70 }, work: "coding", roams: true },
  tester: { color: "#f472b6", desk: { x: 38, y: 70 }, work: "coding", roams: true },
  reviewer: { color: "#fbbf24", desk: { x: 60, y: 70 }, work: "thinking", roams: true },
  "security-reviewer": { color: "#f87171", desk: { x: 82, y: 70 }, work: "thinking", roams: true }
} as const satisfies Record<
  string,
  { color: string; desk: { x: number; y: number }; work: keyof typeof ACTIVITY; roams: boolean }
>;

export const MEETING_SPOT = { x: 57, y: 88 } as const;

export const TABLE_SPOT = { x: 50, y: 83 } as const;

export const LOUNGE_ZONES = [
  { minX: 5, maxX: 36 },
  { minX: 64, maxX: 95 }
] as const;

export const LOUNGE_Y = { min: 84, max: 90 } as const;

export const WALK_SPEED = 30;
