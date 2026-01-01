"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { PDFDocumentProxy } from "pdfjs-dist"

interface EditorSidebarProps {
  pdfDoc: PDFDocumentProxy | null
  currentPage: number
  onPageSelect: (page: number) => void
  className?: string
}

// Store thumbnail blob URLs to avoid regeneration
const thumbnailCache = new Map<string, string>()

export function EditorSidebar({
  pdfDoc,
  currentPage,
  onPageSelect,
  className,
}: EditorSidebarProps) {
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map())
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  // Generate a single thumbnail
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
      const viewport = page.getViewport({ scale: 0.15 }) // Smaller scale for thumbnails

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
      }, 'image/jpeg', 0.7) // JPEG with 70% quality for smaller size
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

  if (!pdfDoc) return null

  const pageCount = pdfDoc.numPages
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-[120px] border-r bg-muted/30 overflow-y-auto flex-shrink-0",
        className
      )}
    >
      <div className="p-2 space-y-2">
        {pages.map((pageNumber) => {
          const thumbnailUrl = thumbnails.get(pageNumber)
          const isActive = pageNumber === currentPage

          return (
            <button
              key={pageNumber}
              ref={(el) => {
                setItemRef(pageNumber, el)
                if (isActive && el) {
                  (activeRef as React.MutableRefObject<HTMLButtonElement | null>).current = el
                }
              }}
              data-page={pageNumber}
              onClick={() => onPageSelect(pageNumber)}
              className={cn(
                "w-full relative group transition-all aspect-[3/4]",
                "rounded border-2 overflow-hidden bg-white",
                isActive
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
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/80 text-foreground"
                )}
              >
                {pageNumber}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
