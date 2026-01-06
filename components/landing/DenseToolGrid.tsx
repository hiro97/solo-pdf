"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Layers,
  Split,
  FileDown,
  Type,
  EyeOff,
  PenTool,
  ArrowRight,
  Shield,
  Lock,
  Cpu,
} from "lucide-react"
import { cn } from "@/lib/utils"

const tools = [
  {
    id: "edit",
    title: "EDIT",
    subtitle: "Add Text & Images",
    description: "Insert text, images, shapes anywhere on your PDF",
    icon: Type,
    href: "/add-text-to-pdf",
    span: "col-span-1",
  },
  {
    id: "merge",
    title: "MERGE",
    subtitle: "Combine PDFs",
    description: "Join multiple files into one document",
    icon: Layers,
    href: "/merge-pdf",
    span: "col-span-1",
  },
  {
    id: "split",
    title: "SPLIT",
    subtitle: "Extract Pages",
    description: "Separate pages into individual files",
    icon: Split,
    href: "/split-pdf",
    span: "col-span-1",
  },
  {
    id: "compress",
    title: "COMPRESS",
    subtitle: "Reduce Size",
    description: "Make files smaller without quality loss",
    icon: FileDown,
    href: "/compress-pdf",
    span: "col-span-1",
  },
  {
    id: "redact",
    title: "REDACT",
    subtitle: "Hide Info",
    description: "Permanently remove sensitive data",
    icon: EyeOff,
    href: "/redact-pdf",
    span: "col-span-1 md:col-span-1",
  },
  {
    id: "sign",
    title: "SIGN",
    subtitle: "Add Signature",
    description: "Draw or upload your signature",
    icon: PenTool,
    href: "/sign-pdf",
    span: "col-span-1 md:col-span-2",
  },
]

export function DenseToolGrid() {
  return (
    <section className="bg-background border-y border-border/50">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--free))]" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Available Tools
              </h2>
            </div>
            <Link
              href="/editor"
              className="flex items-center gap-1 text-xs font-mono text-[hsl(var(--free))] hover:underline"
            >
              Open Full Editor
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5">
          {/* Tool Cells */}
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              className={cn(
                "dense-cell group relative",
                tool.span,
                index < 4 ? "md:border-b border-border/50" : ""
              )}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={tool.href} className="block h-full">
                <div className="flex flex-col h-full min-h-[120px] md:min-h-[140px]">
                  <div className="flex items-start justify-between mb-2">
                    <tool.icon className="w-5 h-5 text-muted-foreground group-hover:text-[hsl(var(--free))] transition-colors" />
                    <ArrowRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors" />
                  </div>
                  <h3 className="font-bold text-sm tracking-tight">{tool.title}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
                    {tool.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">
                    {tool.description}
                  </p>
                  <div className="mt-3 text-[10px] font-mono text-[hsl(var(--free))] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Try It →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* 100% LOCAL - Spanning Cell */}
          <motion.div
            className="dense-cell col-span-2 md:col-span-1 md:row-span-2 bg-foreground text-background relative overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col h-full min-h-[160px] md:min-h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-[hsl(var(--free))]" />
                  <Lock className="w-4 h-4 text-background/50" />
                  <Cpu className="w-4 h-4 text-background/50" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">
                  100%
                  <br />
                  LOCAL
                </h3>
                <div className="w-12 h-0.5 bg-[hsl(var(--free))] mt-3" />
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs text-background/70 leading-relaxed">
                  Your files never leave your device. All processing happens in your browser.
                </p>
                <div className="flex flex-wrap gap-1">
                  {["Zero upload", "Zero tracking", "Zero trust required"].map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-background/10 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Background Pattern */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-background/10 rounded-full" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 border border-background/5 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
