import { MetadataRoute } from "next"
import { siteConfig } from "@/lib/site"
import { getAllPosts } from "@/lib/blog"

// Required for static export
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url

  // Static routes - prioritized for SEO
  const staticRoutes = [
    "",                    // Homepage - priority 1.0
    "/editor",             // Main editor - priority 0.9
    "/free-pdf-editor",    // Primary keyword landing page
    "/pdf-editor",         // Secondary keyword landing page
    "/pdf-viewer",         // Tertiary keyword landing page
    "/merge-pdf",
    "/split-pdf",
    "/compress-pdf",
    "/add-text-to-pdf",
    "/redact-pdf",
    "/sign-pdf",
    "/blog",
    "/privacy",
    "/terms",
    "/support",
  ]

  // Priority mapping for SEO - keyword landing pages get high priority
  const getPriority = (route: string): number => {
    if (route === "") return 1.0
    if (route === "/free-pdf-editor") return 0.95  // Primary keyword
    if (route === "/editor" || route === "/pdf-editor") return 0.9
    if (route === "/pdf-viewer") return 0.85
    if (route.includes("-pdf")) return 0.8  // Tool pages
    return 0.6  // Other pages
  }

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: route === "" ? `${baseUrl}/` : `${baseUrl}${route}/`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: getPriority(route),
  }))

  // Blog posts
  const posts = getAllPosts()
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}/`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [...staticPages, ...blogPages]
}
