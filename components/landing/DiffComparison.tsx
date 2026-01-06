"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const cloudWay = [
  "Upload files to unknown servers",
  "Wait for server processing",
  "Trust third parties with your data",
  "Requires internet connection",
  "Account registration needed",
  "Hidden fees and upsells",
  "Data retention policies unclear",
]

const soloWay = [
  "Files stay on your device",
  "Instant local processing",
  "Trust only yourself",
  "Works completely offline",
  "No account required",
  "100% free forever",
  "Zero data collection",
]

interface DiffLineProps {
  lineNumber: number
  text: string
  type: "removed" | "added"
  delay: number
}

function DiffLine({ lineNumber, text, type, delay }: DiffLineProps) {
  return (
    <motion.div
      className={cn(
        "flex font-mono text-xs sm:text-sm",
        type === "removed"
          ? "bg-red-500/10 hover:bg-red-500/20"
          : "bg-[hsl(var(--free))]/10 hover:bg-[hsl(var(--free))]/20",
        "transition-colors group"
      )}
      initial={{ opacity: 0, x: type === "removed" ? -10 : 10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <span className="w-8 sm:w-10 py-1 px-2 text-muted-foreground/50 text-right shrink-0 border-r border-border/30">
        {lineNumber}
      </span>
      <span
        className={cn(
          "w-6 sm:w-8 py-1 px-2 font-bold shrink-0",
          type === "removed" ? "text-red-500" : "text-[hsl(var(--free))]"
        )}
      >
        {type === "removed" ? "-" : "+"}
      </span>
      <span
        className={cn(
          "flex-1 py-1 pr-4",
          type === "removed" ? "text-red-500/80" : "text-[hsl(var(--free))]"
        )}
      >
        {text}
      </span>
    </motion.div>
  )
}

export function DiffComparison() {
  return (
    <section className="py-12 px-4 bg-background">
      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--free))]" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            The Difference
          </h2>
        </div>

        {/* Diff Container */}
        <div className="grid md:grid-cols-2 border border-border/50 rounded-lg overflow-hidden">
          {/* Cloud Way */}
          <div className="border-b md:border-b-0 md:border-r border-border/50">
            <div className="px-4 py-2 bg-red-500/5 border-b border-border/50">
              <span className="font-mono text-xs text-red-500">
                --- cloud-editors.txt
              </span>
            </div>
            <div className="divide-y divide-border/20">
              {cloudWay.map((text, index) => (
                <DiffLine
                  key={text}
                  lineNumber={index + 1}
                  text={text}
                  type="removed"
                  delay={index * 0.05}
                />
              ))}
            </div>
          </div>

          {/* Solo Way */}
          <div>
            <div className="px-4 py-2 bg-[hsl(var(--free))]/5 border-b border-border/50">
              <span className="font-mono text-xs text-[hsl(var(--free))]">
                +++ solo-pdf.txt
              </span>
            </div>
            <div className="divide-y divide-border/20">
              {soloWay.map((text, index) => (
                <DiffLine
                  key={text}
                  lineNumber={index + 1}
                  text={text}
                  type="added"
                  delay={0.2 + index * 0.05}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <motion.div
          className="mt-6 flex items-center justify-center gap-4 text-xs font-mono"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-red-500">
            <span className="font-bold">-{cloudWay.length}</span> problems removed
          </span>
          <span className="text-muted-foreground/50">|</span>
          <span className="text-[hsl(var(--free))]">
            <span className="font-bold">+{soloWay.length}</span> benefits added
          </span>
        </motion.div>
      </div>
    </section>
  )
}
