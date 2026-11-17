export const ACTIVITY = {
  idle: "Dam olmoqda",
  coding: "Kod yozmoqda",
  planning: "Reja yozmoqda",
  thinking: "O'ylamoqda",
  talking: "Gaplashmoqda",
  asking: "Tasdiq kutmoqda"
} as const;

export const OFFICE_AGENTS = {
  orchestrator: { color: "#f5c451", desk: { x: 44, y: 91 }, work: "thinking", roams: false },
  triage: { color: "#ff6a2b", desk: { x: 14, y: 54 }, work: "thinking", roams: true },
  analyzer: { color: "#60a5fa", desk: { x: 36, y: 54 }, work: "thinking", roams: true },
  planner: { color: "#a78bfa", desk: { x: 58, y: 54 }, work: "planning", roams: true },
  coder: { color: "#2dd4bf", desk: { x: 80, y: 54 }, work: "coding", roams: true },
  simplifier: { color: "#4ade80", desk: { x: 14, y: 76 }, work: "coding", roams: true },
  tester: { color: "#f472b6", desk: { x: 36, y: 76 }, work: "coding", roams: true },
  reviewer: { color: "#fbbf24", desk: { x: 58, y: 76 }, work: "thinking", roams: true },
  "security-reviewer": { color: "#f87171", desk: { x: 80, y: 76 }, work: "thinking", roams: true }
} as const satisfies Record<
  string,
  { color: string; desk: { x: number; y: number }; work: keyof typeof ACTIVITY; roams: boolean }
>;

export const OFFICE_PROPS = [
  { name: "wall-clock", x: 50, y: 15, height: 4, flat: true },
  { name: "wall-shelf", x: 84, y: 21, height: 7, flat: true },
  { name: "bookshelf", x: 5, y: 32, height: 12, flat: false },
  { name: "coffee-station", x: 16, y: 31, height: 8, flat: false },
  { name: "tv", x: 31, y: 30, height: 7.5, flat: false },
  { name: "succulent", x: 40, y: 30, height: 3.5, flat: false },
  { name: "whiteboard", x: 68, y: 31, height: 9.5, flat: false },
  { name: "water-cooler", x: 93, y: 31, height: 7.5, flat: false },
  { name: "fig-plant", x: 97, y: 66, height: 10, flat: false },
  { name: "rug", x: 50, y: 99, height: 8, flat: true },
  { name: "coffee-table", x: 50, y: 91, height: 3.4, flat: false },
  { name: "sofa", x: 27, y: 99, height: 6.5, flat: false },
  { name: "bean-bag", x: 73, y: 97, height: 5, flat: false },
  { name: "floor-lamp", x: 92, y: 96, height: 10.5, flat: false },
  { name: "monstera", x: 3, y: 100, height: 10, flat: false }
] as const;

export const DESK_HEIGHT = 9.1;

export const WORK_SPOT_OFFSET = { x: 6.5, y: 1 } as const;

export const MEETING_SPOT = { x: 57, y: 91 } as const;

export const ASK_SPOT = { x: 50, y: 93 } as const;

export const LOUNGE_ZONES = [
  { minX: 6, maxX: 22 },
  { minX: 62, maxX: 88 }
] as const;

export const LOUNGE_Y = { min: 84, max: 93 } as const;

export const WALK_SPEED = 30;
