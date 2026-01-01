import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"
import { HomePageContent } from "@/components/pages/HomePageContent"

export const metadata: Metadata = {
  title: "SOLO PDF - Privacy-First Local PDF Editor",
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  openGraph: {
    title: "SOLO PDF - Zero Upload PDF Editor",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOLO PDF - Zero Upload PDF Editor",
    description: siteConfig.description,
  },
  alternates: {
    canonical: siteConfig.url,
  },
}

export default function HomePage() {
  return <HomePageContent />
}
