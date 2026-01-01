"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import type { PDFDocumentProxy } from "pdfjs-dist"
import type { ToolType, ToolSettings, Annotation } from "./types"
import { PageRenderer } from "./PageRenderer"
import { cn } from "@/lib/utils"

interface EditorCanvasProps {
  pdfDoc: PDFDocumentProxy | null
  pageCount: number
  scale: number
  activeTool: ToolType
  toolSettings: ToolSettings
  getPageAnnotations: (pageNumber: number) => Annotation[]
  onAnnotationAdd: (pageNumber: number, fabricJSON: string, type: ToolType) => void
  onAnnotationUpdate: (pageNumber: number, id: string, fabricJSON: string) => void
  onAnnotationRemove: (pageNumber: number, id: string) => void
  onSignatureRequest?: () => void
  onCurrentPageChange?: (pageNumber: number) => void
  className?: string
}

export function EditorCanvas({
  pdfDoc,
  pageCount,
  scale,
  activeTool,
  toolSettings,
  getPageAnnotations,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationRemove,
  onSignatureRequest,
  onCurrentPageChange,
  className,
}: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Track which pages are visible (with buffer)
  const [visiblePages, setVisiblePages] = useState<Set<number>>(() => new Set([1, 2, 3]))
  const [currentPage, setCurrentPage] = useState(1)

  // Notify parent of current page change (deferred to avoid setState during render)
  useEffect(() => {
    onCurrentPageChange?.(currentPage)
  }, [currentPage, onCurrentPageChange])

  // Track page visibility and update current page
  const handlePageVisible = useCallback(
    (pageNumber: number, isIntersecting: boolean) => {
      if (isIntersecting) {
        // Update visible pages with buffer
        setVisiblePages(prev => {
          const next = new Set(prev)
          for (let i = pageNumber - 2; i <= pageNumber + 2; i++) {
            if (i >= 1 && i <= pageCount) {
              next.add(i)
            }
          }
          return next
        })

        // Update current page (this triggers useEffect which notifies parent)
        setCurrentPage(prev => prev !== pageNumber ? pageNumber : prev)
      }
    },
    [pageCount]
  )

  if (!pdfDoc) {
    return (
      <div className={cn("flex-1 flex items-center justify-center bg-muted/20", className)}>
        <p className="text-muted-foreground">No PDF loaded</p>
      </div>
    )
  }

  // Generate array of page numbers
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 overflow-auto bg-muted/30",
        className
      )}
    >
      <div className="flex flex-col items-center py-4 gap-4">
        {pages.map((pageNumber) => (
          <PageRenderer
            key={pageNumber}
            pdfDoc={pdfDoc}
            pageNumber={pageNumber}
            scale={scale}
            activeTool={activeTool}
            toolSettings={toolSettings}
            annotations={getPageAnnotations(pageNumber)}
            onAnnotationAdd={onAnnotationAdd}
            onAnnotationUpdate={onAnnotationUpdate}
            onAnnotationRemove={onAnnotationRemove}
            onSignatureRequest={onSignatureRequest}
            onPageVisible={handlePageVisible}
            isVisible={visiblePages.has(pageNumber)}
          />
        ))}
      </div>
    </div>
  )
}
