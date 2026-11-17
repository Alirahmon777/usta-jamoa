import { CommandList } from "@/widgets/command-list";
import { FeatureBento } from "@/widgets/feature-bento";
import { FinalCta } from "@/widgets/final-cta";
import { Hero } from "@/widgets/hero";
import { PipelineSteps } from "@/widgets/pipeline-steps";
import { SiteHeader } from "@/widgets/site-header";
import { Statement } from "@/widgets/statement";
import { WordMarquee } from "@/widgets/word-marquee";

import { useSmoothScroll } from "@/shared/lib";

export function LandingPage() {
  useSmoothScroll();

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <WordMarquee />
        <PipelineSteps />
        <FeatureBento />
        <Statement />
        <CommandList />
        <FinalCta />
      </main>
    </>
  );
}
