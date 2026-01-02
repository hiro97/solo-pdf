"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getPendingFile, clearPendingFile } from "@/lib/file-store"
import { EditorToolbar } from "./EditorToolbar"
import { EditorSidebar } from "./EditorSidebar"
import { EditorCanvas } from "./EditorCanvas"
import { ToolSettingsPanel } from "./ToolSettingsPanel"
import { usePDFDocument } from "./hooks/usePDFDocument"
import { useZoom } from "./hooks/useZoom"
import { useAnnotations } from "./hooks/useAnnotations"
import { SignatureModal } from "./modals/SignatureModal"
import type { ToolType, ToolSettings, PageDimensions, DEFAULT_TOOL_SETTINGS } from "./types"

export function EditorPageContent() {
  const router = useRouter()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [activeTool, setActiveTool] = useState<ToolType>("select")
  const [toolSettings, setToolSettings] = useState<ToolSettings>({
    color: '#000000',
    strokeWidth: 2,
    fontSize: 16,
    fontFamily: 'Helvetica',
    bold: false,
    italic: false,
    underline: false,
  })
  const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(null)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // PDF Document state
  const {
    file,
    pdfJs,
    pageCount,
    currentPage,
    isLoading: isPdfLoading,
    error,
    loadPDF,
    goToPage,
    nextPage,
    prevPage,
    rotatePage,
    deletePage,
    reorderPages,
    mergePDF,
    extractPages,
    savePDF,
  } = usePDFDocument()

  // Zoom state
  const { scale, zoomIn, zoomOut, zoomTo, fitToPage, reset: resetZoom } = useZoom()

  // Annotations state
  const {
    annotations,
    addAnnotation,
    removeAnnotation,
    updateAnnotation,
    getPageAnnotations,
    clearAllAnnotations,
  } = useAnnotations()

  // Load pending file on mount
  useEffect(() => {
    async function loadPendingFile() {
      try {
        const pendingFile = await getPendingFile()
        if (pendingFile) {
          await loadPDF(pendingFile)
          await clearPendingFile()
        }
      } catch (err) {
        console.error("Failed to load pending file:", err)
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadPendingFile()
  }, [loadPDF])

  // Redirect to home if no file loaded (after initial loading completes)
  useEffect(() => {
    if (!isInitialLoading && !file) {
      router.replace("/")
    }
  }, [isInitialLoading, file, router])

  // Handle file select from input
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile && selectedFile.type === "application/pdf") {
        await loadPDF(selectedFile)
        resetZoom()
        clearAllAnnotations()
      }
      e.target.value = ""
    },
    [loadPDF, resetZoom, clearAllAnnotations]
  )

  // Open file dialog
  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Handle rotate current page
  const handleRotate = useCallback(() => {
    rotatePage(currentPage - 1, 90)
  }, [rotatePage, currentPage])

  // Handle delete current page
  const handleDelete = useCallback(() => {
    if (pageCount > 1) {
      deletePage(currentPage - 1)
    }
  }, [deletePage, currentPage, pageCount])

  // Handle delete multiple pages from sidebar
  const handleDeletePages = useCallback(
    (pageIndices: number[]) => {
      // Delete pages in reverse order to maintain correct indices
      const sorted = [...pageIndices].sort((a, b) => b - a)
      for (const index of sorted) {
        if (pageCount > 1) {
          deletePage(index)
        }
      }
    },
    [deletePage, pageCount]
  )

  // Handle fit to page
  const handleFitToPage = useCallback(() => {
    if (containerRef.current && pageDimensions) {
      const rect = containerRef.current.getBoundingClientRect()
      fitToPage({ width: rect.width, height: rect.height }, pageDimensions)
    }
  }, [fitToPage, pageDimensions])

  // Handle annotation add (now receives pageNumber from PageRenderer)
  const handleAnnotationAdd = useCallback(
    (pageNumber: number, fabricJSON: string, type: ToolType): string => {
      return addAnnotation(pageNumber, fabricJSON, type)
    },
    [addAnnotation]
  )

  // Handle annotation update (now receives pageNumber from PageRenderer)
  const handleAnnotationUpdate = useCallback(
    (pageNumber: number, id: string, fabricJSON: string) => {
      updateAnnotation(pageNumber, id, fabricJSON)
    },
    [updateAnnotation]
  )

  // Handle annotation remove (now receives pageNumber from PageRenderer)
  const handleAnnotationRemove = useCallback(
    (pageNumber: number, id: string) => {
      removeAnnotation(pageNumber, id)
    },
    [removeAnnotation]
  )

  // Handle current page change from scroll
  const handleCurrentPageChange = useCallback(
    (pageNumber: number) => {
      goToPage(pageNumber)
    },
    [goToPage]
  )

  // Handle signature request
  const handleSignatureRequest = useCallback(() => {
    setShowSignatureModal(true)
  }, [])

  // Handle save with annotations
  const handleSave = useCallback(() => {
    savePDF(annotations)
  }, [savePDF, annotations])

  // Handle signature save from modal
  const handleSignatureSave = useCallback(
    (dataUrl: string) => {
      setShowSignatureModal(false)
      // Add signature to canvas via window method (temporary solution)
      const addFn = (window as unknown as { addSignatureToCanvas?: (url: string) => void }).addSignatureToCanvas
      if (addFn) {
        addFn(dataUrl)
      }
    },
    []
  )

  // Handle style sync from AnnotationLayer (sync toolbar when text is selected)
  const handleStyleSync = useCallback(
    (styles: Partial<typeof toolSettings>) => {
      setToolSettings(prev => ({ ...prev, ...styles }))
    },
    []
  )

  // Loading state
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // No file loaded - show redirecting state (useEffect above handles actual redirect)
  if (!file || !pdfJs) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Toolbar */}
      <EditorToolbar
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={goToPage}
        onPrevPage={prevPage}
        onNextPage={nextPage}
        scale={scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomTo={zoomTo}
        onFitToPage={handleFitToPage}
        onRotate={handleRotate}
        onDelete={handleDelete}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onSave={handleSave}
        onOpenFile={handleOpenFile}
      />

      {/* Tool Settings Panel */}
      <ToolSettingsPanel
        activeTool={activeTool}
        settings={toolSettings}
        onSettingsChange={setToolSettings}
      />

      {/* Main content area */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Sidebar with thumbnails */}
        <EditorSidebar
          pdfDoc={pdfJs}
          currentPage={currentPage}
          onPageSelect={goToPage}
          onReorderPages={reorderPages}
          onMergePDF={mergePDF}
          onExtractPages={extractPages}
          onDeletePages={handleDeletePages}
        />

        {/* Canvas area - renders all pages with vertical scroll */}
        <EditorCanvas
          pdfDoc={pdfJs}
          pageCount={pageCount}
          scale={scale}
          activeTool={activeTool}
          toolSettings={toolSettings}
          getPageAnnotations={getPageAnnotations}
          onAnnotationAdd={handleAnnotationAdd}
          onAnnotationUpdate={handleAnnotationUpdate}
          onAnnotationRemove={handleAnnotationRemove}
          onSignatureRequest={handleSignatureRequest}
          onCurrentPageChange={handleCurrentPageChange}
          onStyleSync={handleStyleSync}
        />
      </div>

      {/* Loading overlay for PDF operations */}
      {isPdfLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
        <SignatureModal
          onSave={handleSignatureSave}
          onClose={() => setShowSignatureModal(false)}
        />
      )}
    </div>
  )
}
