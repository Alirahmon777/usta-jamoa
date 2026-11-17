import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Every scroll/intro animation is registered under this query, so reduced-motion users get the static page. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { useGSAP } from "@gsap/react";
export { gsap } from "gsap";
export { ScrollTrigger } from "gsap/ScrollTrigger";
export { SplitText } from "gsap/SplitText";
