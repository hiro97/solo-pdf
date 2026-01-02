import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "PDF Viewer - View PDF Files Online Free | SOLO PDF",
  description:
    "Fast, lightweight PDF viewer in your browser. No download needed. View, search, and navigate PDFs privately. Works offline, completely free.",
  keywords: [
    "pdf viewer",
    "view pdf online",
    "pdf reader",
    "open pdf",
    "pdf viewer online",
    "free pdf viewer",
    "browser pdf viewer",
    "pdf reader online",
    "view pdf free",
  ],
  openGraph: {
    title: "PDF Viewer - View PDF Files Online Free | SOLO PDF",
    description:
      "Fast PDF viewer in your browser. No download needed. View and navigate PDFs with complete privacy.",
    url: `${siteConfig.url}/pdf-viewer`,
    type: "website",
    images: [
      {
        url: `${siteConfig.url}/og/pdf-viewer.png`,
        width: 1200,
        height: 630,
        alt: "PDF Viewer Online - SOLO PDF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Viewer - View PDF Files Online Free | SOLO PDF",
    description: "View PDFs in your browser. No download, complete privacy.",
    images: [`${siteConfig.url}/og/pdf-viewer.png`],
  },
  alternates: {
    canonical: `${siteConfig.url}/pdf-viewer`,
  },
}

export default function PdfViewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
