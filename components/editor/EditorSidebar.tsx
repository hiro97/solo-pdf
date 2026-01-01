"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { PDFDocumentProxy } from "pdfjs-dist"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Download, Trash2, FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EditorSidebarProps {
  pdfDoc: PDFDocumentProxy | null
  currentPage: number
  onPageSelect: (page: number) => void
  onPageReorder?: (fromIndex: number, toIndex: number) => void
  onPagesExtract?: (pageNumbers: number[]) => void
  onPDFMerge?: (file: File, insertAtPage: number) => void
  className?: string
}

// Store thumbnail blob URLs to avoid regeneration
const thumbnailCache = new Map<string, string>()

interface SortableThumbnailProps {
  pageNumber: number
  thumbnailUrl: string | null
  isActive: boolean
  isSelected: boolean
  onSelect: (pageNumber: number, isCtrlClick: boolean) => void
  onDragOver: (pageNumber: number) => void
}

function SortableThumbnail({
  pageNumber,
  thumbnailUrl,
  isActive,
  isSelected,
  onSelect,
  onDragOver,
}: SortableThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pageNumber.toString() })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleClick = (e: React.MouseEvent) => {
    onSelect(pageNumber, e.ctrlKey || e.metaKey)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    onDragOver(pageNumber)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      // Trigger merge via data attribute
      const event = new CustomEvent('pdf-merge', {
        detail: { file, insertAtPage: pageNumber }
      })
      window.dispatchEvent(event)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
      onDragOver={handleDragOver}
      onDrop={handleFileDrop}
    >
      <button
        onClick={handleClick}
        className={cn(
          "w-full relative transition-all aspect-[3/4]",
          "rounded border-2 overflow-hidden bg-white",
          isSelected
            ? "border-blue-500 ring-2 ring-blue-500/30"
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
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 py-0.5 text-xs font-medium text-center",
            isSelected
              ? "bg-blue-500 text-white"
              : isActive
              ? "bg-primary text-primary-foreground"
              : "bg-background/80 text-foreground"
          )}
        >
          {pageNumber}
        </div>
      </button>

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute top-1 right-1 p-1 bg-background/80 rounded cursor-grab active:cursor-grabbing",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
      >
        <GripVertical className="h-3 w-3" />
      </div>
    </div>
  )
}

export function EditorSidebar({
  pdfDoc,
  currentPage,
  onPageSelect,
  onPageReorder,
  onPagesExtract,
  onPDFMerge,
  className,
}: EditorSidebarProps) {
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map())
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set())
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [dragOverPage, setDragOverPage] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Initialize page order
  useEffect(() => {
    if (pdfDoc) {
      setPageOrder(Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1))
    }
  }, [pdfDoc?.numPages])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Generate a single thumbnail with higher resolution
  const generateThumbnail = useCallback(async (pageNumber: number) => {
    if (!pdfDoc || thumbnails.has(pageNumber)) return

    // Check cache first
    const cacheKey = `${pdfDoc.fingerprints[0]}-${pageNumber}`
    if (thumbnailCache.has(cacheKey)) {
      setThumbnails(prev => new Map(prev).set(pageNumber, thumbnailCache.get(cacheKey)!))
      return
    }

    try {
      const page = await pdfDoc.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 0.4 }) // Increased from 0.15 for better quality

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

      // Use toBlob for better performance than toDataURL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          thumbnailCache.set(cacheKey, url)
          setThumbnails(prev => new Map(prev).set(pageNumber, url))
        }
      }, 'image/jpeg', 0.85) // Increased quality from 0.7 to 0.85
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
            // Also preload adjacent pages
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
  }, [pageOrder])

  // Register item ref
  const setItemRef = useCallback((pageNumber: number, element: HTMLDivElement | null) => {
    if (element) {
      itemRefs.current.set(pageNumber, element)
      observerRef.current?.observe(element)
    } else {
      itemRefs.current.delete(pageNumber)
    }
  }, [])

  // Handle page selection (with ctrl/cmd for multi-select)
  const handlePageSelect = useCallback((pageNumber: number, isCtrlClick: boolean) => {
    if (isCtrlClick) {
      setSelectedPages(prev => {
        const newSet = new Set(prev)
        if (newSet.has(pageNumber)) {
          newSet.delete(pageNumber)
        } else {
          newSet.add(pageNumber)
        }
        return newSet
      })
    } else {
      setSelectedPages(new Set())
      onPageSelect(pageNumber)
    }
  }, [onPageSelect])

  // Handle drag end (reorder pages)
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setPageOrder((pages) => {
        const oldIndex = pages.indexOf(Number(active.id))
        const newIndex = pages.indexOf(Number(over.id))

        const newOrder = arrayMove(pages, oldIndex, newIndex)

        // Notify parent component
        if (onPageReorder) {
          onPageReorder(oldIndex, newIndex)
        }

        return newOrder
      })
    }
  }, [onPageReorder])

  // Handle external PDF file drop for merging
  useEffect(() => {
    const handlePDFMerge = (e: Event) => {
      const customEvent = e as CustomEvent<{ file: File; insertAtPage: number }>
      if (onPDFMerge) {
        onPDFMerge(customEvent.detail.file, customEvent.detail.insertAtPage)
      }
    }

    window.addEventListener('pdf-merge', handlePDFMerge)
    return () => window.removeEventListener('pdf-merge', handlePDFMerge)
  }, [onPDFMerge])

  // Handle extract selected pages
  const handleExtractPages = useCallback(() => {
    if (selectedPages.size > 0 && onPagesExtract) {
      onPagesExtract(Array.from(selectedPages).sort((a, b) => a - b))
      setSelectedPages(new Set())
    }
  }, [selectedPages, onPagesExtract])

  if (!pdfDoc) return null

  const hasSelection = selectedPages.size > 0

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "w-[140px] border-r bg-muted/30 overflow-y-auto flex-shrink-0 flex flex-col",
          className
        )}
      >
        {/* Action buttons */}
        {hasSelection && (
          <div className="p-2 border-b bg-background/50 space-y-1">
            <div className="text-xs text-muted-foreground text-center mb-1">
              {selectedPages.size} selected
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-7"
                  onClick={handleExtractPages}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Extract
                </Button>
              </TooltipTrigger>
              <TooltipContent>Extract selected pages to new PDF</TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-7"
              onClick={() => setSelectedPages(new Set())}
            >
              Clear
            </Button>
          </div>
        )}

        {/* Thumbnails */}
        <div ref={containerRef} className="flex-1 overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pageOrder.map(p => p.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="p-2 space-y-2">
                {pageOrder.map((pageNumber) => {
                  const thumbnailUrl = thumbnails.get(pageNumber) || null
                  const isActive = pageNumber === currentPage
                  const isSelected = selectedPages.has(pageNumber)

                  return (
                    <div
                      key={pageNumber}
                      ref={(el) => setItemRef(pageNumber, el)}
                      data-page={pageNumber}
                    >
                      <SortableThumbnail
                        pageNumber={pageNumber}
                        thumbnailUrl={thumbnailUrl}
                        isActive={isActive}
                        isSelected={isSelected}
                        onSelect={handlePageSelect}
                        onDragOver={setDragOverPage}
                      />
                    </div>
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Drop zone indicator */}
        <div className="p-2 border-t bg-muted/50 text-center text-xs text-muted-foreground">
          <FilePlus className="h-4 w-4 mx-auto mb-1 opacity-50" />
          <div>Drop PDF to merge</div>
        </div>
      </div>
    </TooltipProvider>
  )
}
