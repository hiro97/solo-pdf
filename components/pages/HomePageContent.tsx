"use client"

import { HeroSplit } from "@/components/landing/HeroSplit"
import { BentoGrid } from "@/components/landing/BentoGrid"
import { InteractiveDemo } from "@/components/landing/InteractiveDemo"
import { ContrastSection } from "@/components/landing/ContrastSection"
import { FloatingFAQ } from "@/components/landing/FloatingFAQ"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { BannerAdSlot } from "@/components/ads/AdSlot"
import {
  SoftwareApplicationJsonLd,
  OrganizationJsonLd,
} from "@/components/seo/JsonLd"

export function HomePageContent() {
  return (
    <>
      {/* SEO structured data */}
      <SoftwareApplicationJsonLd />
      <OrganizationJsonLd />

      {/* Top Banner Ad */}
      <BannerAdSlot className="my-0 py-2 bg-muted/20" />

      {/* Main layout with right sidebar */}
      <div className="flex">
        {/* Main content - leaves space for sidebar */}
        <div className="flex-1 min-w-0 mr-[180px] sm:mr-[180px]">
          {/* Section 1: Kinetic Hero with File Select */}
          <HeroSplit />

          {/* Section 2: Bento Grid Features */}
          <BentoGrid />

          {/* Section 3: Interactive Demo with Network Monitor */}
          <InteractiveDemo />

          {/* Section 4: Cloud vs Local Contrast */}
          <ContrastSection />

          {/* Section 5: Floating FAQ */}
          <FloatingFAQ />

          {/* Section 6: Bold Final CTA */}
          <FinalCTA />
        </div>

        {/* Right Sidebar Ad - Always visible, fixed position */}
        <aside className="fixed right-2 top-24 w-[160px] z-40">
          <div className="w-[160px] h-[600px] bg-muted/30 border border-border/50 rounded-lg flex items-center justify-center text-muted-foreground text-xs">
            <span className="opacity-50 [writing-mode:vertical-rl] rotate-180">Ad Space</span>
          </div>
        </aside>
      </div>
    </>
  )
}
