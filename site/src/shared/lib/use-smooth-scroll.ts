import { useEffect } from "react";
import Lenis from "lenis";

import { gsap, MOTION_OK, ScrollTrigger } from "./gsap";

/** Lenis smooth scrolling driven by GSAP's ticker, so ScrollTrigger and Lenis share one frame loop. */
export function useSmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia(MOTION_OK).matches) return;

    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    const tick = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
}
