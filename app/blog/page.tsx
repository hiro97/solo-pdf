"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, ArrowRight, Calendar, Clock, BookOpen } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdSlot } from "@/components/ads/AdSlot"
import { getAllPosts, getAllTags, searchPosts, type BlogPost } from "@/lib/blog"

// Section indicator component
function SectionIndicator({ label }: { label: string }) {
  return (
    <div className="section-indicator">
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <motion.article
        className="relative overflow-hidden rounded-2xl border border-[hsl(var(--free)/0.3)]
                   bg-gradient-to-br from-[hsl(var(--free)/0.05)] via-[hsl(var(--free)/0.08)] to-[hsl(var(--free)/0.02)]
                   p-6 md:p-10 transition-all duration-300
                   hover:border-[hsl(var(--free)/0.5)] hover:shadow-[0_0_30px_hsl(var(--free)/0.1)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Featured badge */}
        <div className="absolute top-4 right-4">
          <Badge
            className="bg-[hsl(var(--free))] text-white font-mono text-[10px] uppercase tracking-wider
                       shadow-[0_0_12px_hsl(var(--free-glow))]"
          >
            Featured
          </Badge>
        </div>

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
        <h2 className="text-2xl md:text-3xl font-serif font-medium mb-3
                       group-hover:text-[hsl(var(--free))] transition-colors">
          {post.title}
        </h2>

        {/* Description */}
        <p className="text-muted-foreground mb-6 max-w-2xl leading-relaxed">
          {post.description}
        </p>

        {/* Read more link */}
        <div className="flex items-center gap-2 text-[hsl(var(--free))] font-mono text-sm uppercase tracking-wider">
          Read article
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.article>
    </Link>
  )
}

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <motion.article
        className="h-full p-5 rounded-xl border bg-card/50 backdrop-blur-sm
                   transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                   hover:border-[hsl(var(--free)/0.3)] hover:bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Meta */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mb-3 uppercase tracking-wider">
          <span>{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-[hsl(var(--free))]" />
          <span>{post.readingTime}</span>
        </div>

        {/* Title */}
        <h3 className="font-medium text-lg mb-2 group-hover:text-[hsl(var(--free))] transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {post.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[10px] font-mono uppercase tracking-wider font-normal
                         border-border/50 text-muted-foreground"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </motion.article>
    </Link>
  )
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allPosts = getAllPosts()
  const allTags = getAllTags()

  const filteredPosts = useMemo(() => {
    let posts = allPosts

    if (searchQuery) {
      posts = searchPosts(searchQuery)
    }

    if (selectedTag) {
      posts = posts.filter((post) => post.tags.includes(selectedTag))
    }

    return posts
  }, [allPosts, searchQuery, selectedTag])

  const featuredPost = filteredPosts[0]
  const remainingPosts = filteredPosts.slice(1)

  return (
    <>
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

        {/* Hero */}
        <section className="pt-12 pb-6">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Section indicator */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[hsl(var(--free))]" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--free))]">
                    Knowledge Base
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-3">
                PDF Tips & Guides
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Learn how to work with PDFs more efficiently while keeping your documents private.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="pb-6">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 font-mono text-sm
                             focus:ring-[hsl(var(--free))] focus:border-[hsl(var(--free))]"
                />
              </div>

              {/* Tag filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full transition-all duration-200 ${
                    selectedTag === null
                      ? "bg-[hsl(var(--free))] text-white shadow-[0_0_10px_hsl(var(--free-glow))]"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {allTags.slice(0, 5).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full transition-all duration-200 ${
                      selectedTag === tag
                        ? "bg-[hsl(var(--free))] text-white shadow-[0_0_10px_hsl(var(--free-glow))]"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Results count */}
            <motion.p
              className="mt-4 text-xs font-mono text-muted-foreground uppercase tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedTag && ` tagged "${selectedTag}"`}
            </motion.p>
          </div>
        </section>

        {/* Content */}
        <section className="pb-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {filteredPosts.length === 0 ? (
              <motion.div
                className="py-16 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No articles found. Try a different search term.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Featured Post */}
                {featuredPost && <FeaturedPost post={featuredPost} />}

                {/* Post Grid */}
                {remainingPosts.length > 0 && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {remainingPosts.map((post, index) => (
                      <PostCard key={post.slug} post={post} index={index} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-12 border-t bg-gradient-to-b from-muted/20 to-transparent">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
            >
              <SectionIndicator label="Get Started" />
              <h2 className="text-2xl font-serif font-medium mb-2 mt-3">
                Ready to try it yourself?
              </h2>
              <p className="text-muted-foreground mb-6">
                Edit PDFs directly in your browser. No upload, no signup.
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
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
