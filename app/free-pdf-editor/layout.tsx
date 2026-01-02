import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Free PDF Editor Online - Edit PDFs Free in Browser | SOLO PDF",
  description:
    "Edit PDF files for free directly in your browser. No upload, no signup required. Merge, split, compress, sign, and annotate PDFs with complete privacy. 100% free, works offline.",
  keywords: [
    "free pdf editor",
    "free pdf editor online",
    "edit pdf free",
    "online pdf editor free",
    "pdf editor no signup",
    "pdf editor no upload",
    "free pdf editing",
    "edit pdf online free",
    "browser pdf editor free",
  ],
  openGraph: {
    title: "Free PDF Editor - No Upload Required | SOLO PDF",
    description:
      "The completely free PDF editor that works in your browser. No file uploads, no account needed. Edit, merge, split, compress PDFs privately.",
    url: `${siteConfig.url}/free-pdf-editor`,
    type: "website",
    images: [
      {
        url: `${siteConfig.url}/og/free-pdf-editor.png`,
        width: 1200,
        height: 630,
        alt: "Free PDF Editor Online - SOLO PDF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free PDF Editor - No Upload Required | SOLO PDF",
    description: "Edit PDFs free in your browser. No upload, complete privacy.",
    images: [`${siteConfig.url}/og/free-pdf-editor.png`],
  },
  alternates: {
    canonical: `${siteConfig.url}/free-pdf-editor`,
  },
}

export default function FreePdfEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
