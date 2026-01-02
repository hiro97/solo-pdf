import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "PDF Editor - Edit PDF Files Online | SOLO PDF",
  description:
    "Professional PDF editor in your browser. Add text, images, signatures. Merge, split, compress PDFs. Works offline, 100% private. No upload required.",
  keywords: [
    "pdf editor",
    "pdf editor online",
    "edit pdf",
    "pdf editing",
    "online pdf editor",
    "pdf editor software",
    "edit pdf files",
    "pdf document editor",
    "browser pdf editor",
  ],
  openGraph: {
    title: "PDF Editor - Edit PDF Files Online | SOLO PDF",
    description:
      "Professional PDF editor that runs entirely in your browser. Add text, images, signatures. Merge, split, compress PDFs privately.",
    url: `${siteConfig.url}/pdf-editor`,
    type: "website",
    images: [
      {
        url: `${siteConfig.url}/og/pdf-editor.png`,
        width: 1200,
        height: 630,
        alt: "PDF Editor Online - SOLO PDF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Editor - Edit PDF Files Online | SOLO PDF",
    description: "Edit PDFs in your browser. No upload, complete privacy.",
    images: [`${siteConfig.url}/og/pdf-editor.png`],
  },
  alternates: {
    canonical: `${siteConfig.url}/pdf-editor`,
  },
}

export default function PdfEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
