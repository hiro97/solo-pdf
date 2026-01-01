import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Merge PDF - Combine Multiple PDFs into One",
  description:
    "Merge multiple PDF files into a single document. Drag and drop to reorder. Free, private, and works entirely in your browser.",
  keywords: ["merge PDF", "combine PDF", "join PDF", "PDF merger", "free PDF merge"],
  openGraph: {
    title: "Merge PDF - SOLO PDF",
    description: "Combine multiple PDFs into one. No upload required.",
    url: `${siteConfig.url}/merge-pdf`,
    type: "website",
  },
  alternates: {
    canonical: `${siteConfig.url}/merge-pdf`,
  },
}

export default function MergePdfLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
