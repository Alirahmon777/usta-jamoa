import { gsap } from "@/shared/lib";

import { WALK_SPEED } from "../model/constants";
import type { Spot } from "../model/types";

const readPercent = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const syncDepth = (element: HTMLElement) => {
  element.style.zIndex = String(Math.round(readPercent(element.style.top, 0)));
};

export function walkTo(element: HTMLElement, spot: Spot, onArrive: () => void) {
  const fromX = readPercent(element.style.left, spot.x);
  const fromY = readPercent(element.style.top, spot.y);
  const distance = Math.hypot(spot.x - fromX, (spot.y - fromY) * 0.6);

  if (distance < 0.5) {
    onArrive();
    return;
  }

  element.dataset.facing = spot.x < fromX ? "left" : "right";
  element.dataset.walking = "true";
  gsap.to(element, {
    left: `${spot.x}%`,
    top: `${spot.y}%`,
    duration: distance / WALK_SPEED,
    ease: "none",
    onUpdate: () => syncDepth(element),
    onComplete: () => {
      element.dataset.walking = "false";
      onArrive();
    }
  });
}

export function placeAt(element: HTMLElement, spot: Spot) {
  gsap.set(element, { left: `${spot.x}%`, top: `${spot.y}%` });
  syncDepth(element);
}
