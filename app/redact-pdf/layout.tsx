import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Redact PDF - Hide Sensitive Information",
  description:
    "Permanently redact sensitive information from PDFs. Cover text, images, or entire sections. Free, private, and works entirely in your browser.",
  keywords: ["redact PDF", "hide text PDF", "censor PDF", "remove sensitive info", "PDF blackout"],
  openGraph: {
    title: "Redact PDF - SOLO PDF",
    description: "Hide sensitive information in your PDF. No upload required.",
    url: `${siteConfig.url}/redact-pdf`,
    type: "website",
  },
  alternates: {
    canonical: `${siteConfig.url}/redact-pdf`,
  },
}

export default function RedactPdfLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
