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

export function HomePageContent() {
  return (
    <>
      {/* SEO structured data */}
      <SoftwareApplicationJsonLd />
      <OrganizationJsonLd />

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
