import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"
import { HomePageContent } from "@/components/pages/HomePageContent"

export const metadata: Metadata = {
  title: "Free PDF Editor Online - No Upload Required | SOLO PDF",
  description:
    "Edit PDF files free in your browser. Merge, split, compress, sign, and annotate PDFs with complete privacy. No upload, works offline.",
  keywords: [
    "free pdf editor",
    "pdf editor",
    "pdf viewer",
    "online pdf editor",
    "edit pdf free",
    "merge pdf",
    "split pdf",
    "compress pdf",
    "sign pdf",
    "browser pdf editor",
    "no upload pdf editor",
  ],
  openGraph: {
    title: "Free PDF Editor Online - No Upload Required | SOLO PDF",
    description:
      "Edit PDF files free in your browser. Merge, split, compress, sign PDFs with complete privacy. No upload required.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: `${siteConfig.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SOLO PDF - Free PDF Editor Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free PDF Editor Online - No Upload | SOLO PDF",
    description:
      "Edit PDFs free in your browser. Complete privacy, works offline.",
    images: [`${siteConfig.url}/og-image.png`],
  },
  alternates: {
    canonical: siteConfig.url,
  },
}

export default function HomePage() {
  return <HomePageContent />
}
