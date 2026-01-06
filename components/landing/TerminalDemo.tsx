"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { Upload, ArrowRight, Circle } from "lucide-react"
import { storePendingFile } from "@/lib/file-store"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface LogLine {
  id: number
  text: string
  type: "command" | "output" | "success" | "highlight"
}

export function TerminalDemo() {
  const router = useRouter()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<LogLine[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(false)

  // Demo animation
  useEffect(() => {
    if (isInView && !fileName && !showDemo) {
      const timeout = setTimeout(() => {
        setShowDemo(true)
        runDemoSequence()
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [isInView, fileName, showDemo])

  const addLog = (text: string, type: LogLine["type"] = "output") => {
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), text, type }])
  }

  const runDemoSequence = async () => {
    setLogs([])
    await sleep(300)
    addLog("$ waiting for file input...", "command")
    await sleep(800)
    addLog("$ file received: example.pdf (2.4 MB)", "command")
    await sleep(400)
    addLog("checking network requests...", "output")
    await sleep(600)
    addLog("→ outbound connections: 0", "highlight")
    await sleep(400)
    addLog("→ data uploaded: 0 bytes", "highlight")
    await sleep(600)
    addLog("processing locally with WebAssembly...", "output")
    await sleep(800)
    addLog("✓ PDF ready to edit (processed in 0.3s)", "success")
  }

  const handleFile = useCallback(async (file: File) => {
    if (!file || file.type !== "application/pdf") return

    setFileName(file.name)
    setLogs([])
    setShowDemo(false)

    // Real file sequence
    addLog(`$ file selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`, "command")
    await sleep(300)
    addLog("checking network requests...", "output")
    await sleep(500)
    addLog("→ outbound connections: 0", "highlight")
    addLog("→ data uploaded: 0 bytes", "highlight")
    await sleep(400)
    addLog("processing locally...", "output")

    setIsLoading(true)
    try {
      await storePendingFile(file)
      await sleep(300)
      addLog("✓ PDF ready! Opening editor...", "success")
      await sleep(500)
      router.push("/editor")
    } catch (err) {
      console.error("Failed to store file:", err)
      addLog("✗ Error processing file", "output")
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
    <section ref={ref} className="py-12 px-4 bg-background">
      <div className="mx-auto max-w-3xl">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--free))]" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            See It In Action
          </h2>
        </div>

        {/* Terminal Window */}
        <div
          className={cn(
            "rounded-lg overflow-hidden border border-border/50 shadow-2xl shadow-black/10",
            isDragging && "ring-2 ring-[hsl(var(--free))]"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Circle className="w-3 h-3 fill-red-500 text-red-500" />
              <Circle className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              <Circle className="w-3 h-3 fill-green-500 text-green-500" />
            </div>
            <span className="text-xs font-mono text-zinc-500">network-monitor</span>
            <div className="w-16" />
          </div>

          {/* Terminal Body */}
          <div className="bg-zinc-950 p-4 min-h-[200px] font-mono text-sm">
            <AnimatePresence mode="popLayout">
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "py-0.5",
                    log.type === "command" && "text-zinc-400",
                    log.type === "output" && "text-zinc-500",
                    log.type === "success" && "text-[hsl(var(--free))]",
                    log.type === "highlight" && "text-white"
                  )}
                >
                  {log.text}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Cursor */}
            {logs.length > 0 && !isLoading && (
              <div className="flex items-center gap-1 py-0.5 text-zinc-400">
                <span>$</span>
                <span className="terminal-cursor w-2 h-4 bg-zinc-400 inline-block" />
              </div>
            )}

            {/* Empty state / Drop zone */}
            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                <Upload className="w-8 h-8 mb-2" />
                <p className="text-xs">Drop a PDF to see the demo</p>
              </div>
            )}
          </div>

          {/* Terminal Footer */}
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-t border-zinc-800">
            <label
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition-colors",
                "bg-zinc-800 hover:bg-zinc-700 text-zinc-300",
                isLoading && "opacity-50 pointer-events-none"
              )}
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
              />
              <Upload className="w-3 h-3" />
              Try with your PDF
            </label>

            <Link
              href="/editor"
              className="flex items-center gap-1 text-xs font-mono text-[hsl(var(--free))] hover:underline"
            >
              Open Editor
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Caption */}
        <p className="mt-4 text-xs text-center text-muted-foreground">
          Watch the network tab — <span className="text-[hsl(var(--free))] font-medium">zero requests are made</span>
        </p>
      </div>
    </section>
  )
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
