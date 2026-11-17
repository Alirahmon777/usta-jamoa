import { gsap } from "@/shared/lib";

import { ASK_SPOT, LOUNGE_Y, LOUNGE_ZONES, MEETING_SPOT, OFFICE_AGENTS, WORK_SPOT_OFFSET } from "../model/constants";
import type { Activity, AgentRole, Spot } from "../model/types";

export function getTargetSpot(role: AgentRole, activity: Activity): Spot | undefined {
  const agent = OFFICE_AGENTS[role];
  if (activity === "asking") return ASK_SPOT;
  if (!agent.roams || activity === "coding") return agent.desk;
  if (activity === "talking") return MEETING_SPOT;
  if (activity === "idle") return undefined;
  return { x: agent.desk.x + WORK_SPOT_OFFSET.x, y: agent.desk.y + WORK_SPOT_OFFSET.y };
}

export function getRandomLoungeSpot(): Spot {
  const zone = LOUNGE_ZONES[gsap.utils.random(0, LOUNGE_ZONES.length - 1, 1)];
  return {
    x: gsap.utils.random(zone.minX, zone.maxX),
    y: gsap.utils.random(LOUNGE_Y.min, LOUNGE_Y.max)
  };
}

export function getHomeSpot(role: AgentRole): Spot {
  const agent = OFFICE_AGENTS[role];
  if (!agent.roams) return agent.desk;
  const index = Object.keys(OFFICE_AGENTS).indexOf(role);
  const zone = LOUNGE_ZONES[index % LOUNGE_ZONES.length];
  return { x: zone.minX + ((zone.maxX - zone.minX) / 4) * Math.floor(index / 2), y: LOUNGE_Y.min + (index % 3) * 3 };
}

export function getArrivalFacing(role: AgentRole, activity: Activity) {
  if (activity === "talking") return role === "orchestrator" ? "right" : "left";
  if (activity === "idle") return undefined;
  return activity === "planning" || activity === "thinking" ? "left" : "right";
}
