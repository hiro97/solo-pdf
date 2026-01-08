"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Download, Trash2, RotateCw } from "lucide-react"
import type { PDFDocumentProxy } from "pdfjs-dist"

interface EditorSidebarProps {
  pdfDoc: PDFDocumentProxy | null
  currentPage: number
  documentVersion?: number
  onPageSelect: (page: number) => void
  onReorderPages?: (fromIndex: number, toIndex: number) => void
  onMergePDF?: (file: File, insertAtIndex: number) => void
  onExtractPages?: (pageIndices: number[]) => void
  onDeletePages?: (pageIndices: number[]) => void
  onRotatePages?: (pageIndices: number[]) => void
  /** Notify parent when thumbnail selection changes (1-based page numbers) */
  onSelectedPagesChange?: (pageNumbers: number[]) => void
  className?: string
}

// Store thumbnail blob URLs to avoid regeneration
const thumbnailCache = new Map<string, string>()

export function EditorSidebar({
  pdfDoc,
  currentPage,
  documentVersion,
  onPageSelect,
  onReorderPages,
  onMergePDF,
  onExtractPages,
  onDeletePages,
  onRotatePages,
  onSelectedPagesChange,
  className,
}: EditorSidebarProps) {
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map())
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set())
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [draggedPage, setDraggedPage] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)
  const [isDraggingExternal, setIsDraggingExternal] = useState(false)
  const [externalDropTarget, setExternalDropTarget] = useState<number | null>(null)
  const lastSelectedRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  // Notify parent when selectedPages changes (after render completes)
  useEffect(() => {
    onSelectedPagesChange?.([...selectedPages].sort((a, b) => a - b))
  }, [selectedPages, onSelectedPagesChange])

  // Helper to update selection state
  const updateSelectedPages = useCallback(
    (updater: (prev: Set<number>) => Set<number>) => {
      setSelectedPages(prev => updater(prev))
    },
    []
  )

  // Clear cache when PDF changes or document version changes (rotation, reorder, etc.)
  useEffect(() => {
    setThumbnails(new Map())
    updateSelectedPages(() => new Set())
    lastSelectedRef.current = null
  }, [pdfDoc?.fingerprints[0], documentVersion, updateSelectedPages])

  // Generate a single thumbnail with higher resolution
  const generateThumbnail = useCallback(async (pageNumber: number) => {
    if (!pdfDoc || thumbnails.has(pageNumber)) return

    // Check cache first (include documentVersion to invalidate on rotation/reorder)
    const cacheKey = `${pdfDoc.fingerprints[0]}-${pageNumber}-${documentVersion ?? 0}-hires`
    if (thumbnailCache.has(cacheKey)) {
      setThumbnails(prev => new Map(prev).set(pageNumber, thumbnailCache.get(cacheKey)!))
      return
    }

    try {
      const page = await pdfDoc.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 0.3 }) // Higher resolution thumbnails

      const canvas = document.createElement("canvas")
      canvas.width = viewport.width
      canvas.height = viewport.height

      const context = canvas.getContext("2d")
      if (!context) return

      await page.render({
        canvasContext: context,
        viewport,
        canvas,
      }).promise

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          thumbnailCache.set(cacheKey, url)
          setThumbnails(prev => new Map(prev).set(pageNumber, url))
        }
      }, 'image/jpeg', 0.85) // Higher quality JPEG
    } catch (err) {
      console.error(`Failed to render thumbnail for page ${pageNumber}:`, err)
    }
  }, [pdfDoc, thumbnails, documentVersion])

  // Generate thumbnails for visible pages
  useEffect(() => {
    visiblePages.forEach(pageNumber => {
      if (!thumbnails.has(pageNumber)) {
        generateThumbnail(pageNumber)
      }
    })
  }, [visiblePages, thumbnails, generateThumbnail])

  // Set up intersection observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const newVisible = new Set<number>()
        entries.forEach((entry) => {
          const pageNumber = parseInt(entry.target.getAttribute('data-page') || '0')
          if (entry.isIntersecting && pageNumber > 0) {
            newVisible.add(pageNumber)
            if (pageNumber > 1) newVisible.add(pageNumber - 1)
            if (pdfDoc && pageNumber < pdfDoc.numPages) newVisible.add(pageNumber + 1)
          }
        })
        if (newVisible.size > 0) {
          setVisiblePages(prev => new Set([...prev, ...newVisible]))
        }
      },
      {
        root: containerRef.current,
        rootMargin: '50px 0px',
        threshold: 0,
      }
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [pdfDoc])

  // Observe thumbnail items
  useEffect(() => {
    const observer = observerRef.current
    if (!observer) return

    itemRefs.current.forEach((element) => {
      observer.observe(element)
    })

    return () => {
      observer.disconnect()
    }
  }, [pdfDoc?.numPages])

  // Scroll active thumbnail into view
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [currentPage])

  // Register item ref
  const setItemRef = useCallback((pageNumber: number, element: HTMLButtonElement | null) => {
    if (element) {
      itemRefs.current.set(pageNumber, element)
      observerRef.current?.observe(element)
    } else {
      itemRefs.current.delete(pageNumber)
    }
  }, [])

  // Handle page selection with multi-select support
  const handlePageClick = useCallback((pageNumber: number, event: React.MouseEvent) => {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey
    const isShift = event.shiftKey

    if (isShift && lastSelectedRef.current !== null) {
      // Shift-click: select range between last anchor and clicked page
      const start = Math.min(lastSelectedRef.current, pageNumber)
      const end = Math.max(lastSelectedRef.current, pageNumber)
      const range = new Set<number>()
      for (let i = start; i <= end; i++) {
        range.add(i)
      }
      if (isCtrlOrCmd) {
        updateSelectedPages(prev => new Set([...prev, ...range]))
      } else {
        updateSelectedPages(() => range)
      }
      // Update anchor to the last clicked page for predictable subsequent shift-clicks
      lastSelectedRef.current = pageNumber
    } else if (isCtrlOrCmd) {
      // Ctrl/Cmd-click: toggle selection
      updateSelectedPages(prev => {
        const next = new Set(prev)
        if (next.has(pageNumber)) {
          next.delete(pageNumber)
        } else {
          next.add(pageNumber)
        }
        return next
      })
      lastSelectedRef.current = pageNumber
    } else {
      // Regular click: select single page and navigate
      updateSelectedPages(() => new Set([pageNumber]))
      lastSelectedRef.current = pageNumber
      onPageSelect(pageNumber)
    }
  }, [onPageSelect, updateSelectedPages])

  // Drag and drop handlers for reordering
  const handleDragStart = useCallback((pageNumber: number, event: React.DragEvent) => {
    setDraggedPage(pageNumber)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', pageNumber.toString())

    // Include selected pages if the dragged page is part of selection
    if (selectedPages.has(pageNumber) && selectedPages.size > 1) {
      event.dataTransfer.setData('application/x-pages', JSON.stringify([...selectedPages].sort((a, b) => a - b)))
    }
  }, [selectedPages])

  const handleDragOver = useCallback((pageNumber: number, event: React.DragEvent) => {
    event.preventDefault()

    // Check if this is an external file
    if (event.dataTransfer.types.includes('Files')) {
      event.dataTransfer.dropEffect = 'copy'
      setIsDraggingExternal(true)
      setExternalDropTarget(pageNumber)
      setDropTarget(null)
    } else {
      event.dataTransfer.dropEffect = 'move'
      setDropTarget(pageNumber)
      setExternalDropTarget(null)
    }
  }, [])

  const handleDragLeave = useCallback(() => {
    setDropTarget(null)
    setExternalDropTarget(null)
  }, [])

  const handleDrop = useCallback((targetPage: number, event: React.DragEvent) => {
    event.preventDefault()

    // Handle external file drop (PDF merge)
    if (event.dataTransfer.types.includes('Files')) {
      const files = event.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type === 'application/pdf') {
          onMergePDF?.(file, targetPage - 1) // Insert before target page
        }
      }
      setIsDraggingExternal(false)
      setExternalDropTarget(null)
      return
    }

    // Handle internal reordering
    if (draggedPage !== null && draggedPage !== targetPage && onReorderPages) {
      onReorderPages(draggedPage - 1, targetPage - 1)
    }

    setDraggedPage(null)
    setDropTarget(null)
  }, [draggedPage, onReorderPages, onMergePDF])

  const handleDragEnd = useCallback(() => {
    setDraggedPage(null)
    setDropTarget(null)
    setIsDraggingExternal(false)
    setExternalDropTarget(null)
  }, [])

  // Container-level drag events for external files
  const handleContainerDragOver = useCallback((event: React.DragEvent) => {
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      setIsDraggingExternal(true)
    }
  }, [])

  const handleContainerDragLeave = useCallback((event: React.DragEvent) => {
    // Only reset if leaving the container entirely
    if (!containerRef.current?.contains(event.relatedTarget as Node)) {
      setIsDraggingExternal(false)
      setExternalDropTarget(null)
    }
  }, [])

  const handleContainerDrop = useCallback((event: React.DragEvent) => {
    // If dropped on container (not on a specific page), append at end
    if (event.dataTransfer.types.includes('Files') && pdfDoc) {
      event.preventDefault()
      const files = event.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.type === 'application/pdf') {
          onMergePDF?.(file, pdfDoc.numPages)
        }
      }
    }
    setIsDraggingExternal(false)
    setExternalDropTarget(null)
  }, [onMergePDF, pdfDoc])

  // Handle extract and delete actions
  const handleExtract = useCallback(() => {
    if (selectedPages.size > 0 && onExtractPages) {
      onExtractPages([...selectedPages].map(p => p - 1).sort((a, b) => a - b))
    }
  }, [selectedPages, onExtractPages])

  const handleDelete = useCallback(() => {
    if (selectedPages.size > 0 && onDeletePages) {
      onDeletePages([...selectedPages].map(p => p - 1).sort((a, b) => a - b))
      updateSelectedPages(() => new Set())
    }
  }, [selectedPages, onDeletePages, updateSelectedPages])

  const handleRotate = useCallback(() => {
    if (selectedPages.size > 0 && onRotatePages) {
      const pageNumbers = [...selectedPages].sort((a, b) => a - b)
      const pageIndices = pageNumbers.map(p => p - 1)
      console.log('[EditorSidebar] Selected pages (1-based):', pageNumbers)
      console.log('[EditorSidebar] Converted to indices (0-based):', pageIndices)
      onRotatePages(pageIndices)
    }
  }, [selectedPages, onRotatePages])

  if (!pdfDoc) return null

  const pageCount = pdfDoc.numPages
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)
  const hasSelection = selectedPages.size > 0

  return (
    <div
      ref={containerRef}
      onDragOver={handleContainerDragOver}
      onDragLeave={handleContainerDragLeave}
      onDrop={handleContainerDrop}
      className={cn(
        "w-[120px] border-r editor-glass-panel overflow-y-auto flex-shrink-0 flex flex-col",
        isDraggingExternal && "ring-2 ring-[hsl(var(--free))] ring-inset",
        className
      )}
    >
      {/* Header with section indicator */}
      <div className="px-2 py-2 border-b border-border/50 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="section-indicator">
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
            Pages
          </span>
        </div>
      </div>

      {/* Selection actions toolbar */}
      {hasSelection && (
        <div className="p-1.5 border-b border-border/50 bg-background/80 flex items-center justify-between gap-1 sticky top-8 z-10 backdrop-blur-sm">
          <span className="text-[10px] font-mono text-muted-foreground">{selectedPages.size} sel</span>
          <div className="flex gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={handleRotate}
              title="Rotate selected pages"
            >
              <RotateCw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={handleExtract}
              title="Extract selected pages"
            >
              <Download className="h-3 w-3" />
            </Button>
            {pageCount > selectedPages.size && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-destructive hover:text-destructive"
                onClick={handleDelete}
                title="Delete selected pages"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="p-1.5 space-y-1.5 flex-1">
        {pages.map((pageNumber) => {
          const thumbnailUrl = thumbnails.get(pageNumber)
          const isActive = pageNumber === currentPage
          const isSelected = selectedPages.has(pageNumber)
          const isDragging = draggedPage === pageNumber
          const isDropTarget = dropTarget === pageNumber
          const isExternalDropTarget = externalDropTarget === pageNumber

          return (
            <div
              key={pageNumber}
              className={cn(
                "relative",
                isDropTarget && "before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-[hsl(var(--free))] before:rounded",
                isExternalDropTarget && "before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-[hsl(var(--free))] before:rounded"
              )}
            >
              <button
                ref={(el) => {
                  setItemRef(pageNumber, el)
                  if (isActive && el) {
                    (activeRef as React.MutableRefObject<HTMLButtonElement | null>).current = el
                  }
                }}
                data-page={pageNumber}
                draggable
                onDragStart={(e) => handleDragStart(pageNumber, e)}
                onDragOver={(e) => handleDragOver(pageNumber, e)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(pageNumber, e)}
                onDragEnd={handleDragEnd}
                onClick={(e) => handlePageClick(pageNumber, e)}
                className={cn(
                  "w-full relative group transition-all aspect-[3/4] editor-transition",
                  "rounded border-2 overflow-hidden bg-white cursor-grab active:cursor-grabbing",
                  isDragging && "opacity-50",
                  isSelected && !isActive
                    ? "border-[hsl(var(--free)/0.5)] ring-1 ring-[hsl(var(--free)/0.15)]"
                    : isActive
                    ? "border-[hsl(var(--free))] ring-2 ring-[hsl(var(--free)/0.2)]"
                    : "border-transparent hover:border-muted-foreground/30"
                )}
              >
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={`Page ${pageNumber}`}
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                    <div className="w-3 h-3 border-2 border-[hsl(var(--free))] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 py-0.5 text-[10px] font-mono font-medium text-center",
                    isSelected && !isActive
                      ? "bg-[hsl(var(--free)/0.8)] text-white"
                      : isActive
                      ? "bg-[hsl(var(--free))] text-white"
                      : "bg-background/80 text-foreground"
                  )}
                >
                  {pageNumber}
                </div>
                {/* Selection checkbox indicator */}
                {isSelected && (
                  <div className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-[hsl(var(--free))] rounded-sm flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Drop zone hint at bottom */}
      {isDraggingExternal && (
        <div className="p-1.5 border-t border-dashed border-[hsl(var(--free))] bg-[hsl(var(--free)/0.05)] text-center">
          <p className="text-[10px] font-mono text-[hsl(var(--free))]">Drop PDF to merge</p>
        </div>
      )}
    </div>
  )
}
