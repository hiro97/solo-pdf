import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"
import { SupportPageContent } from "@/components/pages/SupportPageContent"

export const metadata: Metadata = {
  title: "Support | SOLO PDF",
  description:
    "Need help with SOLO PDF? Find answers to common questions and troubleshooting guides.",
  keywords: ["support", "help", "FAQ", "troubleshooting", "contact"],
  openGraph: {
    title: "Support - SOLO PDF",
    description: "Get help with SOLO PDF",
    url: `${siteConfig.url}/support`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Support",
    description: "SOLO PDF Help & Support",
  },
  alternates: {
    canonical: `${siteConfig.url}/support`,
  },
}

export default function SupportPage() {
  return <SupportPageContent />
}
