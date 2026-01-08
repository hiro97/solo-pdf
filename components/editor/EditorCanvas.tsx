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
  onAnnotationAdd: (pageNumber: number, fabricJSON: string, type: ToolType, pageRotation?: number) => string
  onAnnotationUpdate: (pageNumber: number, id: string, fabricJSON: string) => void
  onAnnotationRemove: (pageNumber: number, id: string) => void
  onSignatureRequest?: () => void
  onCurrentPageChange?: (pageNumber: number) => void
  onStyleSync?: (styles: Partial<ToolSettings>) => void
  targetPage?: number | null
  className?: string
  /** Document version - changes trigger re-render (e.g., after rotation) */
  documentVersion?: number
  /** Get rotation angle for a page */
  getPageRotation: (pageIndex: number) => number
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
  onStyleSync,
  targetPage,
  className,
  documentVersion = 0,
  getPageRotation,
}: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Track which pages are visible (with buffer)
  // Initialize as empty - pages are set visible via useEffect to ensure proper mount cycle
  const [visiblePages, setVisiblePages] = useState<Set<number>>(() => new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const currentPageRef = useRef(1)

  // Initialize first few pages as visible AFTER mount
  // This ensures page 1 goes through the same state-change-triggered mount flow as scrolled pages
  useEffect(() => {
    setVisiblePages(new Set([1, 2, 3]))
  }, [])

  // Keep a ref in sync for scroll handlers
  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])

  // Notify parent of current page change (deferred to avoid setState during render)
  useEffect(() => {
    onCurrentPageChange?.(currentPage)
  }, [currentPage, onCurrentPageChange])

  // Scroll to target page when it changes (from sidebar click)
  useEffect(() => {
    if (targetPage && containerRef.current) {
      const pageElement = containerRef.current.querySelector(
        `[data-page-number="${targetPage}"]`
      )
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [targetPage])

  // Track page visibility (used for lazy rendering)
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

  // Determine current page based on scroll position (page closest to container center)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let frameId: number | null = null

    const handleScroll = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }

      frameId = window.requestAnimationFrame(() => {
        if (!containerRef.current) return

        const containerRect = containerRef.current.getBoundingClientRect()
        const centerY = containerRect.top + containerRect.height / 2

        let closestPage = currentPageRef.current
        let minDistance = Infinity

        visiblePages.forEach(pageNumber => {
          const el = containerRef.current!.querySelector<HTMLElement>(
            `[data-page-number="${pageNumber}"]`
          )
          if (!el) return

          const rect = el.getBoundingClientRect()
          const pageCenterY = rect.top + rect.height / 2
          const distance = Math.abs(pageCenterY - centerY)

          if (distance < minDistance) {
            minDistance = distance
            closestPage = pageNumber
          }
        })

        setCurrentPage(prev => (prev !== closestPage ? closestPage : prev))
      })
    }

    // Run once to initialize current page based on initial scroll position
    handleScroll()

    container.addEventListener("scroll", handleScroll)

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
      container.removeEventListener("scroll", handleScroll)
    }
  }, [visiblePages])

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 overflow-auto bg-muted/30 relative",
        className
      )}
    >
      <div className="flex flex-col items-center py-4 gap-4">
        {pages.map((pageNumber) => (
          <PageRenderer
            key={pageNumber}
            pdfDoc={pdfDoc}
            documentVersion={documentVersion}
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
            onStyleSync={onStyleSync}
            isVisible={visiblePages.has(pageNumber)}
            pageRotation={getPageRotation(pageNumber - 1)}
          />
        ))}
      </div>
    </div>
  )
}
