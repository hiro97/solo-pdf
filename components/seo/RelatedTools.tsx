"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  FileEdit,
  Merge,
  Split,
  FileDown,
  PenTool,
  EyeOff,
  LucideIcon,
} from "lucide-react"

interface Tool {
  icon: LucideIcon
  title: string
  description: string
  href: string
}

const allTools: Tool[] = [
  {
    icon: FileEdit,
    title: "Edit PDF",
    description: "Add text, images, and annotations",
    href: "/editor",
  },
  {
    icon: Merge,
    title: "Merge PDF",
    description: "Combine multiple PDFs into one",
    href: "/merge-pdf",
  },
  {
    icon: Split,
    title: "Split PDF",
    description: "Extract pages from PDFs",
    href: "/split-pdf",
  },
  {
    icon: FileDown,
    title: "Compress PDF",
    description: "Reduce PDF file size",
    href: "/compress-pdf",
  },
  {
    icon: PenTool,
    title: "Sign PDF",
    description: "Add electronic signatures",
    href: "/sign-pdf",
  },
  {
    icon: EyeOff,
    title: "Redact PDF",
    description: "Hide sensitive information",
    href: "/redact-pdf",
  },
]

interface RelatedToolsProps {
  currentPath?: string
  title?: string
  className?: string
}

export function RelatedTools({
  currentPath,
  title = "More PDF Tools",
  className = "",
}: RelatedToolsProps) {
  // Filter out the current page from the list
  const tools = currentPath
    ? allTools.filter((tool) => tool.href !== currentPath)
    : allTools

  return (
    <section className={`py-12 ${className}`}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-serif mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Explore our complete PDF toolkit
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={tool.href}>
                <div className="group flex flex-col items-center text-center p-4 rounded-xl bg-card border hover:border-primary/50 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <tool.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tool.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
