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
  /** Document version - triggers re-render when changed (e.g., after rotation) */
  documentVersion?: number
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
  documentVersion = 0,
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

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

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

      // Check if still mounted after async operation
      if (!isMountedRef.current || !canvasRef.current) return

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

      // Clear canvas before rendering (important for rotation/document changes)
      context.clearRect(0, 0, canvas.width, canvas.height)

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

      // Check if still mounted after render
      if (!isMountedRef.current) return

      // Render text layer for text selection
      const textLayerContainer = textLayerRef.current
      if (textLayerContainer) {
        // Clear previous text layer content safely using replaceChildren (avoids removeChild race conditions)
        textLayerContainer.replaceChildren()

        // Set text layer dimensions to match viewport exactly
        // Note: TextLayer uses CSS pixels (not scaled by DPR)
        textLayerContainer.style.width = `${viewport.width}px`
        textLayerContainer.style.height = `${viewport.height}px`
        // Reset any transforms that might interfere
        textLayerContainer.style.transform = ''
        textLayerContainer.style.transformOrigin = '0 0'

        const textContent = await page.getTextContent()

        // Check if container is still mounted after async operation
        if (textLayerRef.current) {
          const textLayer = new TextLayer({
            textContentSource: textContent,
            container: textLayerRef.current,
            viewport: viewport,
          })
          await textLayer.render()

          // Debug: Log text layer span count for verification
          if (textLayerRef.current) {
            console.log('[PageRenderer] TextLayer rendered, spans:', textLayerRef.current.querySelectorAll('span').length)
          }
        }
      }

      if (isMountedRef.current) {
        setHasRendered(true)
        setIsRendering(false)
      }
    } catch (err) {
      console.error("Failed to render page:", err)
      if (isMountedRef.current) {
        setIsRendering(false)
      }
    }
  }, [pdfDoc, pageNumber, scale, isVisible, documentVersion])

  // Track previous documentVersion for immediate re-render on document changes
  const prevDocVersionRef = useRef(documentVersion)

  // Reset dimensions when pdfDoc or documentVersion changes (e.g., after rotation)
  useEffect(() => {
    setPageDimensions(null)
    setHasRendered(false)
  }, [pdfDoc, documentVersion])

  // Get dimensions on mount (for placeholder sizing)
  useEffect(() => {
    getPageDimensions()
  }, [getPageDimensions])

  // Immediate render when documentVersion changes (user action like rotation)
  useEffect(() => {
    if (prevDocVersionRef.current !== documentVersion && isVisible) {
      prevDocVersionRef.current = documentVersion
      // Cancel any pending debounced render
      if (renderTaskRef.current) {
        clearTimeout(renderTaskRef.current)
        renderTaskRef.current = null
      }
      // Render immediately for user-initiated changes
      renderPage()
    }
  }, [documentVersion, isVisible, renderPage])

  // Debounced render on scale/visibility changes (not document changes)
  useEffect(() => {
    if (!isVisible) return

    renderTaskRef.current = setTimeout(() => {
      renderPage()
    }, 100) // Debounce for performance

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
