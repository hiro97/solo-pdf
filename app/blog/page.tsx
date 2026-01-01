"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, ArrowRight, Calendar, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdSlot } from "@/components/ads/AdSlot"
import { getAllPosts, getAllTags, searchPosts, type BlogPost } from "@/lib/blog"

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <motion.article
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-8 md:p-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            Featured
          </Badge>
        </div>

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

        <h2 className="text-2xl md:text-3xl font-serif font-medium mb-3 group-hover:text-primary transition-colors">
          {post.title}
        </h2>

        <p className="text-muted-foreground mb-6 max-w-2xl">
          {post.description}
        </p>

        <div className="flex items-center gap-2 text-primary font-medium">
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
        className="h-full p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span>{post.date}</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>{post.readingTime}</span>
        </div>

        <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {post.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs font-normal"
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
        <section className="pt-16 pb-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm font-mono text-primary mb-4 uppercase tracking-wider">
                Knowledge Base
              </p>
              <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-4">
                PDF Tips & Guides
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Learn how to work with PDFs more efficiently while keeping your documents private.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="pb-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    selectedTag === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  All
                </button>
                {allTags.slice(0, 5).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      selectedTag === tag
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Results count */}
            <motion.p
              className="mt-4 text-sm text-muted-foreground"
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
        <section className="pb-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {filteredPosts.length === 0 ? (
              <motion.div
                className="py-16 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-muted-foreground text-lg">
                  No articles found. Try a different search term.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Featured Post */}
                {featuredPost && <FeaturedPost post={featuredPost} />}

                {/* Post Grid */}
                {remainingPosts.length > 0 && (
                  <div className="mt-8 grid gap-6 sm:grid-cols-2">
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
        <section className="py-16 border-t bg-muted/30">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-serif font-medium mb-3">
                Ready to try it yourself?
              </h2>
              <p className="text-muted-foreground mb-6">
                Edit PDFs directly in your browser. No upload, no signup.
              </p>
              <Link
                href="/editor"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
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
