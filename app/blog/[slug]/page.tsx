import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
    <section className="mt-12 pt-8 border-t border-border/50">
      {/* Section header */}
      <div className="section-indicator mb-6">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Related Articles
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {relatedPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <article
              className="h-full p-4 rounded-xl border bg-card/50 backdrop-blur-sm
                         transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
                         hover:border-[hsl(var(--free)/0.3)]"
            >
              <h3 className="text-sm font-medium line-clamp-2 mb-2
                             group-hover:text-[hsl(var(--free))] transition-colors">
                {post.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {post.description}
              </p>
            </article>
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

        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
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
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider
                         text-muted-foreground hover:text-[hsl(var(--free))] transition-colors mb-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Blog
            </Link>

            {/* Header */}
            <header className="mb-8">
              {/* Meta info */}
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </span>
                <span className="w-1 h-1 rounded-full bg-[hsl(var(--free))]" />
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readingTime}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight mb-4">
                {post.title}
              </h1>

              {/* Description */}
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {post.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-[hsl(var(--free))]" />
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/blog?tag=${tag}`}>
                    <Badge
                      className="cursor-pointer font-mono text-[10px] uppercase tracking-wider
                                 bg-[hsl(var(--free)/0.1)] text-[hsl(var(--free))] border-[hsl(var(--free)/0.2)]
                                 hover:bg-[hsl(var(--free)/0.2)] transition-colors"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </header>

            {/* Content */}
            <div className="prose prose-neutral dark:prose-invert max-w-none
                            prose-headings:font-serif prose-headings:tracking-tight
                            prose-a:text-[hsl(var(--free))] prose-a:no-underline hover:prose-a:underline
                            prose-strong:font-medium
                            prose-code:font-mono prose-code:text-sm
                            prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg">
              <MarkdownRenderer content={post.content} />
            </div>

            {/* Related Posts */}
            <RelatedPosts currentPost={post} />

            {/* CTA */}
            <section className="mt-12 rounded-2xl p-8 text-center
                                border border-[hsl(var(--free)/0.3)]
                                bg-gradient-to-br from-[hsl(var(--free)/0.05)] via-[hsl(var(--free)/0.08)] to-[hsl(var(--free)/0.02)]">
              {/* Section indicator */}
              <div className="section-indicator justify-center mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Get Started
                </span>
              </div>

              <h2 className="text-xl font-serif font-medium mb-2">
                Try it yourself
              </h2>
              <p className="text-muted-foreground mb-6">
                Edit PDFs directly in your browser—no upload required.
              </p>
              <Link
                href="/editor"
                className="inline-flex items-center gap-2 px-6 py-3
                           bg-[hsl(var(--free))] hover:bg-[hsl(var(--free)/0.9)]
                           text-white rounded-lg font-mono text-sm uppercase tracking-wider
                           transition-all duration-200 hover:-translate-y-0.5
                           shadow-[0_0_20px_hsl(var(--free-glow))]"
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
