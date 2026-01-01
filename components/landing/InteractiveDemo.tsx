"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FolderOpen, FileText, Download, ArrowRight } from "lucide-react"
import { NetworkMonitor } from "./NetworkMonitor"
import { Button } from "@/components/ui/button"
import { storePendingFile } from "@/lib/file-store"
import { cn } from "@/lib/utils"

export function InteractiveDemo() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [step, setStep] = useState<"drop" | "process" | "done">("drop")
  const [isNavigating, setIsNavigating] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile)
      setStep("process")
      setTimeout(() => setStep("done"), 2000)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile)
      setStep("process")
      setTimeout(() => setStep("done"), 2000)
    }
    e.target.value = ""
  }, [])

  const handleOpenEditor = async () => {
    if (!file) return

    setIsNavigating(true)
    try {
      await storePendingFile(file)
      router.push("/editor")
    } catch (err) {
      console.error("Failed to store file:", err)
      setIsNavigating(false)
    }
  }

  const reset = () => {
    setFile(null)
    setStep("drop")
  }

  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">
            See for yourself
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Drop a PDF and watch the network monitor. Zero uploads.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Panel 1: Drop Zone */}
          <motion.div
            className="glass-elevated p-6 min-h-[300px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-mono text-muted-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                1
              </span>
              Select a PDF
            </h3>

            <label
              className={cn(
                "flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/20 hover:border-primary/50",
                file && "border-green-500 bg-green-500/5"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <FileText className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </motion.div>
              ) : (
                <>
                  <FolderOpen className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select PDF or drag here
                  </p>
                </>
              )}
            </label>
          </motion.div>

          {/* Panel 2: Network Monitor */}
          <motion.div
            className="glass-elevated p-6 min-h-[300px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-mono text-muted-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                2
              </span>
              Watch Network
            </h3>

            <NetworkMonitor isActive={!!file} hasFile={!!file} />
          </motion.div>

          {/* Panel 3: Result */}
          <motion.div
            className="glass-elevated p-6 min-h-[300px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-mono text-muted-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                3
              </span>
              Open in Editor
            </h3>

            <div className="flex flex-col items-center justify-center h-48">
              {step === "done" ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <ArrowRight className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-sm font-medium mb-4">Ready to edit</p>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={handleOpenEditor}
                      disabled={isNavigating}
                    >
                      {isNavigating ? "Opening..." : "Open Editor"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={reset}>
                      Try another file
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Download className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    {step === "process" ? "Processing..." : "Waiting for file..."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* CTA below demo */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Button asChild size="lg" className="gap-2">
            <a href="/editor">
              Open Full Editor
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
