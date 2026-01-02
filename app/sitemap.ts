import { MetadataRoute } from "next"
import { siteConfig } from "@/lib/site"
import { getAllPosts } from "@/lib/blog"

// Required for static export
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url

  // Static routes
  const staticRoutes = [
    "",
    "/editor",
    "/features",
    "/pdf-editor",
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

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/editor" ? 0.9 : 0.8,
  }))

  // Blog posts
  const posts = getAllPosts()
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [...staticPages, ...blogPages]
}
