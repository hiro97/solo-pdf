"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Type,
  Image,
  PenTool,
  Square,
  Circle,
  Minus,
  Plus,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
  Upload,
  MousePointer2,
  Highlighter,
  Eraser,
  FolderOpen,
  FileText,
  ArrowRight,
} from "lucide-react"
import { storePendingFile } from "@/lib/file-store"
import { cn } from "@/lib/utils"

const sidebarTools = [
  { icon: MousePointer2, label: "Select" },
  { icon: Type, label: "Text" },
  { icon: Image, label: "Image" },
  { icon: PenTool, label: "Draw" },
  { icon: Square, label: "Rectangle" },
  { icon: Circle, label: "Circle" },
  { icon: Highlighter, label: "Highlight" },
  { icon: Eraser, label: "Erase" },
]

const usps = [
  { text: "No Sign Up Required", checked: true },
  { text: "No File Upload", checked: true },
  { text: "100% Local Processing", checked: true },
  { text: "Works Offline", checked: true },
]

export function PDFViewportHero() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    if (!file || file.type !== "application/pdf") return

    setIsLoading(true)
    try {
      await storePendingFile(file)
      router.push("/editor")
    } catch (err) {
      console.error("Failed to store file:", err)
      setIsLoading(false)
    }
  }, [router])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
      e.target.value = ""
    }
  }, [handleFile])

  return (
    <section className="min-h-screen bg-muted/30 pt-20 pb-4 px-2 sm:px-4">
      {/* PDF Viewer Container */}
      <motion.div
        className="h-[calc(100vh-6rem)] max-h-[800px] border border-border/60 rounded-lg overflow-hidden bg-background shadow-2xl shadow-black/10"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Top Toolbar - PDF Viewer Style */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <button className="p-1 hover:bg-muted rounded transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 py-0.5 bg-muted/50 rounded text-[10px]">
                Page 1 of 1
              </span>
              <button className="p-1 hover:bg-muted rounded transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="w-px h-4 bg-border/50 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <button className="p-1 hover:bg-muted rounded transition-colors">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 py-0.5 bg-muted/50 rounded text-[10px] min-w-[50px] text-center">
                100%
              </span>
              <button className="p-1 hover:bg-muted rounded transition-colors">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider hidden sm:block">
              Preview Mode
            </span>
            <button className="p-1 hover:bg-muted rounded transition-colors">
              <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(100%-2.5rem)]">
          {/* Left Sidebar - Tools */}
          <div className="w-10 sm:w-12 border-r border-border/50 bg-muted/20 py-2 flex flex-col items-center gap-1 shrink-0">
            {sidebarTools.map((tool, index) => (
              <motion.button
                key={tool.label}
                className={cn(
                  "w-8 h-8 rounded flex items-center justify-center transition-colors group relative",
                  index === 0 ? "bg-foreground/10" : "hover:bg-muted"
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                title={tool.label}
              >
                <tool.icon className={cn(
                  "w-4 h-4",
                  index === 0 ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
              </motion.button>
            ))}
          </div>

          {/* Main Content - PDF Page Preview */}
          <div
            className={cn(
              "flex-1 bg-muted/10 p-4 sm:p-8 overflow-auto flex items-center justify-center transition-colors",
              isDragging && "bg-[hsl(var(--free))]/5"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {/* Fake PDF Page */}
            <motion.div
              className="w-full max-w-xl aspect-[8.5/11] bg-white dark:bg-zinc-900 rounded shadow-2xl shadow-black/20 relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Page Content */}
              <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center">
                {/* Main Headline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">
                    <span className="text-[hsl(var(--free))]">FREE</span>
                    <br />
                    <span className="text-foreground">PDF EDITOR</span>
                  </h1>
                </motion.div>

                {/* Underline */}
                <motion.div
                  className="w-24 h-1 bg-[hsl(var(--free))] mt-4"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  style={{ transformOrigin: "left" }}
                />

                {/* USP List */}
                <motion.div
                  className="mt-6 sm:mt-8 space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {usps.map((usp, index) => (
                    <motion.div
                      key={usp.text}
                      className="flex items-center gap-2 font-mono text-xs sm:text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <div className="w-4 h-4 rounded-sm bg-[hsl(var(--free))] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-muted-foreground">{usp.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  className="mt-6 sm:mt-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <label
                    className={cn(
                      "inline-flex items-center gap-2 px-5 py-3 rounded-lg cursor-pointer",
                      "bg-foreground text-background",
                      "font-bold text-sm uppercase tracking-wide",
                      "hover:opacity-90 transition-all",
                      "shadow-lg hover:shadow-xl",
                      isLoading && "opacity-70 pointer-events-none"
                    )}
                  >
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isLoading}
                    />
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        <span>Opening...</span>
                      </>
                    ) : (
                      <>
                        <FolderOpen className="w-4 h-4" />
                        <span>Select PDF to Start</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </label>
                </motion.div>

                {/* Drop hint */}
                <motion.p
                  className="mt-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                >
                  or drag & drop anywhere
                </motion.p>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-1 bg-muted/30 rounded" />
              <div className="absolute top-7 right-4 w-12 h-1 bg-muted/20 rounded" />
              <div className="absolute bottom-4 left-6 right-6 flex gap-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 bg-muted/20 rounded" />
                ))}
              </div>

              {/* Drag overlay */}
              {isDragging && (
                <motion.div
                  className="absolute inset-0 bg-[hsl(var(--free))]/10 border-2 border-dashed border-[hsl(var(--free))] flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-[hsl(var(--free))]" />
                    <span className="font-mono text-sm text-[hsl(var(--free))]">Drop PDF here</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
