"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FolderOpen, FileText, X } from "lucide-react"
import { storePendingFile } from "@/lib/file-store"
import { cn } from "@/lib/utils"

interface FileSelectModalProps {
  className?: string
  variant?: "default" | "compact" | "hero"
}

export function FileSelectModal({ className, variant = "default" }: FileSelectModalProps) {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    if (!file) return

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file")
      return
    }

    setSelectedFileName(file.name)
    setIsLoading(true)

    try {
      await storePendingFile(file)
      router.push("/editor")
    } catch (err) {
      console.error("Failed to store file:", err)
      setError("Failed to process file. Please try again.")
      setIsLoading(false)
      setSelectedFileName(null)
    }
  }, [router])

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

  const sizeClasses = {
    default: "h-40 max-w-lg",
    compact: "h-32 max-w-md",
    hero: "h-36 max-w-md",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <label
        className={cn(
          "relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl cursor-pointer transition-all",
          "bg-background/50 backdrop-blur-sm",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
            : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30 hover:shadow-md",
          isLoading && "opacity-70 pointer-events-none",
          sizeClasses[variant]
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
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-sm font-medium">Opening editor...</span>
            </div>
            {selectedFileName && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{selectedFileName}</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
              isDragging ? "bg-primary/10" : "bg-muted"
            )}>
              <FolderOpen className={cn(
                "w-6 h-6 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <p className="text-sm font-medium">
              Select PDF or drag here
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Files never leave your device
            </p>
          </>
        )}

        {error && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/50 px-3 py-1 rounded-full">
            <span>{error}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setError(null)
              }}
              className="hover:text-red-700"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </label>
    </motion.div>
  )
}
