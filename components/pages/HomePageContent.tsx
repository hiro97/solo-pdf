"use client"

import { PDFViewportHero } from "@/components/landing/PDFViewportHero"
import { USPTicker } from "@/components/landing/USPTicker"
import { DenseToolGrid } from "@/components/landing/DenseToolGrid"
import { StatsBar } from "@/components/landing/StatsBar"
import { TerminalDemo } from "@/components/landing/TerminalDemo"
import { DiffComparison } from "@/components/landing/DiffComparison"
import { FullBleedCTA } from "@/components/landing/FullBleedCTA"
import {
  SoftwareApplicationJsonLd,
  OrganizationJsonLd,
} from "@/components/seo/JsonLd"
import { BannerAdSlot } from "@/components/ads/AdSlot"

export function HomePageContent() {
  return (
    <>
      {/* SEO structured data */}
      <SoftwareApplicationJsonLd />
      <OrganizationJsonLd />

      {/* Top Banner Ad */}
      <div className="w-full flex justify-center">
        <BannerAdSlot slot="9628765271" />
      </div>

      {/* Section 1: PDF Viewport Hero */}
      <PDFViewportHero />

      {/* Section 2: USP Ticker */}
      <USPTicker />

      {/* Section 3: Dense Tool Grid */}
      <DenseToolGrid />

      {/* Section 4: Stats Bar */}
      <StatsBar />

      {/* Section 5: Terminal Demo */}
      <TerminalDemo />

      {/* Section 6: Diff Comparison */}
      <DiffComparison />

      {/* Section 7: Full Bleed CTA */}
      <FullBleedCTA />
    </>
  )
}
