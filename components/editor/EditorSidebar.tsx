"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Download, Trash2 } from "lucide-react"
import type { PDFDocumentProxy } from "pdfjs-dist"

interface EditorSidebarProps {
  pdfDoc: PDFDocumentProxy | null
  currentPage: number
  onPageSelect: (page: number) => void
  onReorderPages?: (fromIndex: number, toIndex: number) => void
  onMergePDF?: (file: File, insertAtIndex: number) => void
  onExtractPages?: (pageIndices: number[]) => void
  onDeletePages?: (pageIndices: number[]) => void
  className?: string
}

// Store thumbnail blob URLs to avoid regeneration
const thumbnailCache = new Map<string, string>()

export function EditorSidebar({
  pdfDoc,
  currentPage,
  onPageSelect,
  onReorderPages,
  onMergePDF,
  onExtractPages,
  onDeletePages,
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

  // Clear cache when PDF changes
  useEffect(() => {
    setThumbnails(new Map())
    setSelectedPages(new Set())
    lastSelectedRef.current = null
  }, [pdfDoc?.fingerprints[0]])

  // Generate a single thumbnail with higher resolution
  const generateThumbnail = useCallback(async (pageNumber: number) => {
    if (!pdfDoc || thumbnails.has(pageNumber)) return

    // Check cache first
    const cacheKey = `${pdfDoc.fingerprints[0]}-${pageNumber}-hires`
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
  }, [pdfDoc, thumbnails])

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
      // Shift-click: select range
      const start = Math.min(lastSelectedRef.current, pageNumber)
      const end = Math.max(lastSelectedRef.current, pageNumber)
      const range = new Set<number>()
      for (let i = start; i <= end; i++) {
        range.add(i)
      }
      setSelectedPages(isCtrlOrCmd ? prev => new Set([...prev, ...range]) : range)
    } else if (isCtrlOrCmd) {
      // Ctrl/Cmd-click: toggle selection
      setSelectedPages(prev => {
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
      setSelectedPages(new Set([pageNumber]))
      lastSelectedRef.current = pageNumber
      onPageSelect(pageNumber)
    }
  }, [onPageSelect])

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
      setSelectedPages(new Set())
    }
  }, [selectedPages, onDeletePages])

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
        "w-[140px] border-r bg-muted/30 overflow-y-auto flex-shrink-0 flex flex-col",
        isDraggingExternal && "ring-2 ring-primary ring-inset",
        className
      )}
    >
      {/* Selection actions toolbar */}
      {hasSelection && (
        <div className="p-2 border-b bg-background/80 flex items-center justify-between gap-1 sticky top-0 z-10">
          <span className="text-xs text-muted-foreground">{selectedPages.size} selected</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleExtract}
              title="Extract selected pages"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            {pageCount > selectedPages.size && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={handleDelete}
                title="Delete selected pages"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="p-2 space-y-2 flex-1">
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
                isDropTarget && "before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-primary before:rounded",
                isExternalDropTarget && "before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-green-500 before:rounded"
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
                  "w-full relative group transition-all aspect-[3/4]",
                  "rounded border-2 overflow-hidden bg-white cursor-grab active:cursor-grabbing",
                  isDragging && "opacity-50",
                  isSelected && !isActive
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : isActive
                    ? "border-primary ring-2 ring-primary/20"
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
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 py-0.5 text-xs font-medium text-center",
                    isSelected && !isActive
                      ? "bg-blue-500 text-white"
                      : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-background/80 text-foreground"
                  )}
                >
                  {pageNumber}
                </div>
                {/* Selection checkbox indicator */}
                {isSelected && (
                  <div className="absolute top-1 left-1 w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="p-2 border-t border-dashed border-primary bg-primary/5 text-center">
          <p className="text-xs text-primary">Drop PDF to merge</p>
        </div>
      )}
    </div>
  )
}
