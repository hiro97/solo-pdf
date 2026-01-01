import type { Metadata } from "next"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Sign PDF - Add Your Signature",
  description:
    "Sign PDF documents with your handwritten signature. Draw with mouse or touch. Free, private, and works entirely in your browser.",
  keywords: ["sign PDF", "PDF signature", "electronic signature", "e-sign PDF", "add signature PDF"],
  openGraph: {
    title: "Sign PDF - SOLO PDF",
    description: "Add your signature to any PDF. No upload required.",
    url: `${siteConfig.url}/sign-pdf`,
    type: "website",
  },
  alternates: {
    canonical: `${siteConfig.url}/sign-pdf`,
  },
}

export default function SignPdfLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
