import { gsap } from "@/shared/lib";

import { LOUNGE_Y, LOUNGE_ZONES, MEETING_SPOT, OFFICE_AGENTS } from "../model/constants";
import type { Activity, AgentRole, Spot } from "../model/types";

export function getTargetSpot(role: AgentRole, activity: Activity): Spot | undefined {
  const agent = OFFICE_AGENTS[role];
  if (activity === "talking" && role !== "orchestrator") return MEETING_SPOT;
  if (activity === "idle" && agent.roams) return undefined;
  return agent.desk;
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
  if (activity === "coding" || activity === "planning") return "right";
  return undefined;
}
