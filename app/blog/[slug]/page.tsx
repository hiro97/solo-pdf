import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { BlogPostingJsonLd } from "@/components/seo/JsonLd"
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer"
import { AdSlot } from "@/components/ads/AdSlot"
import { getPostBySlug, getAllPosts, getPostsByTag, type BlogPost } from "@/lib/blog"
import { siteConfig } from "@/lib/site"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: `${post.title} | SOLO PDF Blog`,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteConfig.url}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `${siteConfig.url}/blog/${post.slug}`,
    },
  }
}

function RelatedPosts({ currentPost }: { currentPost: BlogPost }) {
  const relatedPosts = currentPost.tags
    .flatMap((tag) => getPostsByTag(tag))
    .filter((post) => post.slug !== currentPost.slug)
    .filter((post, index, self) => self.findIndex((p) => p.slug === post.slug) === index)
    .slice(0, 3)

  if (relatedPosts.length === 0) return null

  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="text-lg font-medium mb-6">Related Articles</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {relatedPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <Card className="h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <>
      <BlogPostingJsonLd
        title={post.title}
        description={post.description}
        datePublished={post.date}
        url={`${siteConfig.url}/blog/${post.slug}`}
      />

      {/* Fixed Right Sidebar Ad */}
      <aside className="fixed right-0 top-16 bottom-0 w-[160px] hidden lg:flex flex-col items-center py-4 z-40">
        <div className="sticky top-20">
          <AdSlot slot="sidebar-vertical" format="vertical" />
        </div>
      </aside>

      <div className="lg:mr-[180px]">
        {/* Top Banner Ad */}
        <div className="w-full flex justify-center py-4 border-b bg-muted/20">
          <AdSlot slot="top-banner" format="horizontal" className="max-w-[728px]" />
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Blog", href: "/blog" },
              { label: post.title, href: `/blog/${post.slug}` },
            ]}
            className="mb-8"
          />

          <article>
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readingTime}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight mb-4">
                {post.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6">
                {post.description}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/blog?tag=${tag}`}>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </header>

            {/* Content */}
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <MarkdownRenderer content={post.content} />
            </div>

            {/* Related Posts */}
            <RelatedPosts currentPost={post} />

            {/* CTA */}
            <section className="mt-12 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 text-center">
              <h2 className="text-xl font-serif font-medium mb-2">
                Try it yourself
              </h2>
              <p className="text-muted-foreground mb-6">
                Edit PDFs directly in your browser—no upload required.
              </p>
              <Link
                href="/editor"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Open PDF Editor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          </article>
        </div>
      </div>
    </>
  )
}
