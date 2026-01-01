import { Metadata } from "next"
import { siteConfig } from "./site"

interface PageSEOProps {
  title: string
  description: string
  path?: string
  noIndex?: boolean
}

export function generatePageMetadata({
  title,
  description,
  path = "",
  noIndex = false,
}: PageSEOProps): Metadata {
  const url = `${siteConfig.url}${path}`

  return {
    title: `${title} | ${siteConfig.name}`,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: url,
    },
  }
}

export function generateToolMetadata(
  toolName: string,
  description: string,
  path: string
): Metadata {
  return generatePageMetadata({
    title: toolName,
    description,
    path,
  })
}
