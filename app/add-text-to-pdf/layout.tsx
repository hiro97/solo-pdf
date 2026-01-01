import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Add Text to PDF - Insert Text Anywhere",
  description:
    "Add text to any PDF document. Customize fonts, colors, and positioning. Free, private, and works entirely in your browser.",
  keywords: ["add text to PDF", "edit PDF text", "insert text PDF", "PDF text editor", "annotate PDF"],
  openGraph: {
    title: "Add Text to PDF - SOLO PDF",
    description: "Insert text anywhere in your PDF. No upload required.",
    url: `${siteConfig.url}/add-text-to-pdf`,
    type: "website",
  },
  alternates: {
    canonical: `${siteConfig.url}/add-text-to-pdf`,
  },
}

export default function AddTextToPdfLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
