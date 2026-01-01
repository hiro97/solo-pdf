import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Split PDF - Extract Pages from PDF",
  description:
    "Split PDF files into multiple documents or extract specific pages. Free, private, and works entirely in your browser.",
  keywords: ["split PDF", "extract PDF pages", "PDF splitter", "separate PDF", "free PDF split"],
  openGraph: {
    title: "Split PDF - SOLO PDF",
    description: "Split PDFs into multiple files. No upload required.",
    url: `${siteConfig.url}/split-pdf`,
    type: "website",
  },
  alternates: {
    canonical: `${siteConfig.url}/split-pdf`,
  },
}

export default function SplitPdfLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
