"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import type { PDFDocumentProxy, PDFPageProxy } from "@/lib/pdfjs"
import { TextLayer } from "@/lib/pdfjs"
import type { ToolType, ToolSettings, PageDimensions, Annotation } from "./types"
import { AnnotationLayer } from "./AnnotationLayer"

interface PageRendererProps {
  pdfDoc: PDFDocumentProxy
  pageNumber: number
  scale: number
  activeTool: ToolType
  toolSettings: ToolSettings
  annotations: Annotation[]
  onAnnotationAdd: (pageNumber: number, fabricJSON: string, type: ToolType) => string
  onAnnotationUpdate: (pageNumber: number, id: string, fabricJSON: string) => void
  onAnnotationRemove: (pageNumber: number, id: string) => void
  onSignatureRequest?: () => void
  onPageVisible?: (pageNumber: number, isIntersecting: boolean) => void
  onStyleSync?: (styles: Partial<ToolSettings>) => void
  isVisible?: boolean
}

export const PageRenderer = React.memo(function PageRenderer({
  pdfDoc,
  pageNumber,
  scale,
  activeTool,
  toolSettings,
  annotations,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationRemove,
  onSignatureRequest,
  onPageVisible,
  onStyleSync,
  isVisible = true,
}: PageRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const [isRendering, setIsRendering] = useState(false)
  const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(null)
  const [hasRendered, setHasRendered] = useState(false)
  const renderTaskRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pageRef = useRef<PDFPageProxy | null>(null)

  // Get page dimensions (needed for placeholder sizing)
  const getPageDimensions = useCallback(async () => {
    if (!pdfDoc || pageDimensions) return
    try {
      const page = await pdfDoc.getPage(pageNumber)
      const unscaledViewport = page.getViewport({ scale: 1 })
      setPageDimensions({
        width: unscaledViewport.width,
        height: unscaledViewport.height,
      })
    } catch (err) {
      console.error("Failed to get page dimensions:", err)
    }
  }, [pdfDoc, pageNumber, pageDimensions])

  // Render PDF page to canvas
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !isVisible) return

    // Cancel any pending render
    if (renderTaskRef.current) {
      clearTimeout(renderTaskRef.current)
    }

    setIsRendering(true)

    try {
      const page = await pdfDoc.getPage(pageNumber)
      pageRef.current = page
      const viewport = page.getViewport({ scale })

      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      if (!context) return

      // Get devicePixelRatio for crisp rendering on high-DPI displays
      const dpr = window.devicePixelRatio || 1

      // Set canvas internal resolution (multiplied by DPR for sharpness)
      canvas.width = viewport.width * dpr
      canvas.height = viewport.height * dpr

      // Set CSS display size (actual visual size)
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`

      // Scale context to match DPR
      context.scale(dpr, dpr)

      // Store page dimensions (unscaled)
      const unscaledViewport = page.getViewport({ scale: 1 })
      setPageDimensions({
        width: unscaledViewport.width,
        height: unscaledViewport.height,
      })

      // Render PDF page
      await page.render({
        canvasContext: context,
        viewport,
        canvas,
      }).promise

      // Render text layer for text selection
      if (textLayerRef.current) {
        // Clear previous text layer content safely
        while (textLayerRef.current.firstChild) {
          textLayerRef.current.removeChild(textLayerRef.current.firstChild)
        }

        // Set text layer dimensions to match viewport exactly
        // Note: TextLayer uses CSS pixels (not scaled by DPR)
        textLayerRef.current.style.width = `${viewport.width}px`
        textLayerRef.current.style.height = `${viewport.height}px`
        // Reset any transforms that might interfere
        textLayerRef.current.style.transform = ''
        textLayerRef.current.style.transformOrigin = '0 0'

        const textContent = await page.getTextContent()
        const textLayer = new TextLayer({
          textContentSource: textContent,
          container: textLayerRef.current,
          viewport: viewport,
        })
        await textLayer.render()

        // Debug: Log text layer span count for verification
        console.log('[PageRenderer] TextLayer rendered, spans:', textLayerRef.current.querySelectorAll('span').length)
      }

      setHasRendered(true)
      setIsRendering(false)
    } catch (err) {
      console.error("Failed to render page:", err)
      setIsRendering(false)
    }
  }, [pdfDoc, pageNumber, scale, isVisible])

  // Reset dimensions when pdfDoc changes (e.g., after rotation)
  useEffect(() => {
    setPageDimensions(null)
    setHasRendered(false)
  }, [pdfDoc])

  // Get dimensions on mount (for placeholder sizing)
  useEffect(() => {
    getPageDimensions()
  }, [getPageDimensions])

  // Debounced render on changes (only when visible)
  useEffect(() => {
    if (!isVisible) return

    renderTaskRef.current = setTimeout(() => {
      renderPage()
    }, 100) // Increased debounce for better performance

    return () => {
      if (renderTaskRef.current) {
        clearTimeout(renderTaskRef.current)
      }
    }
  }, [renderPage, isVisible])

  // Intersection observer for visibility tracking
  useEffect(() => {
    if (!containerRef.current || !onPageVisible) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          onPageVisible(pageNumber, entry.isIntersecting)
        })
      },
      {
        threshold: 0,
        rootMargin: "100px 0px 100px 0px", // Buffer zone for pre-loading
      }
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [pageNumber, onPageVisible])

  // Handle annotation callbacks with pageNumber
  const handleAnnotationAdd = useCallback(
    (fabricJSON: string, type: ToolType): string => {
      return onAnnotationAdd(pageNumber, fabricJSON, type)
    },
    [onAnnotationAdd, pageNumber]
  )

  const handleAnnotationUpdate = useCallback(
    (id: string, fabricJSON: string) => {
      onAnnotationUpdate(pageNumber, id, fabricJSON)
    },
    [onAnnotationUpdate, pageNumber]
  )

  const handleAnnotationRemove = useCallback(
    (id: string) => {
      onAnnotationRemove(pageNumber, id)
    },
    [onAnnotationRemove, pageNumber]
  )

  // Calculate display dimensions
  const displayWidth = pageDimensions ? pageDimensions.width * scale : 612 * scale
  const displayHeight = pageDimensions ? pageDimensions.height * scale : 792 * scale

  return (
    <div
      ref={containerRef}
      className="relative shadow-lg bg-white"
      data-page-number={pageNumber}
      style={{
        width: displayWidth,
        height: displayHeight,
        minWidth: displayWidth,
        minHeight: displayHeight,
      }}
    >
      {/* Show content only when visible or has been rendered before */}
      {(isVisible || hasRendered) ? (
        <>
          {/* PDF Canvas (read-only background) */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0"
            style={{ pointerEvents: 'none' }}
          />

          {/* Text Layer for PDF text selection - only interactive when textSelect tool is active */}
          <div
            ref={textLayerRef}
            className="textLayer absolute top-0 left-0"
            style={{
              pointerEvents: activeTool === 'textSelect' ? 'auto' : 'none',
              zIndex: activeTool === 'textSelect' ? 30 : 5,
            }}
          />

          {/* Annotation Layer (interactive Fabric.js canvas) */}
          {pageDimensions && (
            <AnnotationLayer
              width={pageDimensions.width}
              height={pageDimensions.height}
              scale={scale}
              activeTool={activeTool}
              toolSettings={toolSettings}
              pageNumber={pageNumber}
              annotations={annotations}
              onAnnotationAdd={handleAnnotationAdd}
              onAnnotationUpdate={handleAnnotationUpdate}
              onAnnotationRemove={handleAnnotationRemove}
              onSignatureRequest={onSignatureRequest}
              onStyleSync={onStyleSync}
            />
          )}

          {/* Loading overlay */}
          {isRendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 pointer-events-none">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </>
      ) : (
        /* Placeholder for non-visible pages */
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
          <span className="text-muted-foreground text-sm">Page {pageNumber}</span>
        </div>
      )}
    </div>
  )
})
