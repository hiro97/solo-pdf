import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Compress PDF - Reduce PDF File Size",
  description:
    "Reduce PDF file size while maintaining quality. Perfect for email attachments. Free, private, and works entirely in your browser.",
  keywords: ["compress PDF", "reduce PDF size", "PDF compressor", "shrink PDF", "optimize PDF"],
  openGraph: {
    title: "Compress PDF - SOLO PDF",
    description: "Reduce PDF file size. No upload required.",
    url: `${siteConfig.url}/compress-pdf`,
    type: "website",
  },
  alternates: {
    canonical: `${siteConfig.url}/compress-pdf`,
  },
}

export default function CompressPdfLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
