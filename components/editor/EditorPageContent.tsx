"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getPendingFile, clearPendingFile } from "@/lib/file-store"
import { EditorTopBar } from "./EditorTopBar"
import { EditorVerticalToolbar } from "./EditorVerticalToolbar"
import { EditorSidebar } from "./EditorSidebar"
import { EditorCanvas } from "./EditorCanvas"
import { ToolSettingsPanel } from "./ToolSettingsPanel"
import { SaveToast } from "./SaveToast"
import { BannerAdSlot } from "@/components/ads/AdSlot"
import { usePDFDocument } from "./hooks/usePDFDocument"
import { useZoom } from "./hooks/useZoom"
import { useAnnotations } from "./hooks/useAnnotations"
import { SignatureModal } from "./modals/SignatureModal"
import { syncAllCanvasesToAnnotations, getCanvasAnnotationsDirectly } from "@/lib/canvas-registry"
import type { ToolType, ToolSettings } from "./types"
import type { SaveResult } from "@/lib/pdf-save"

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
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null)
  // Current thumbnail selection (1-based page numbers)
  const [selectedThumbnailPages, setSelectedThumbnailPages] = useState<number[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // PDF Document state
  const {
    file,
    pdfJs,
    pageCount,
    currentPage,
    documentVersion,
    isLoading: isPdfLoading,
    error,
    needsPassword,
    loadPDF,
    submitPassword,
    cancelPasswordPrompt,
    goToPage,
    nextPage,
    prevPage,
    rotatePage,
    deletePage,
    reorderPages,
    mergePDF,
    extractPages,
    savePDF,
    getPageRotation,
  } = usePDFDocument()

  // Scroll target page (set when sidebar thumbnail is clicked)
  const [scrollTargetPage, setScrollTargetPage] = useState<number | null>(null)

  // Password input state
  const [passwordInput, setPasswordInput] = useState("")

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
    undoAnnotation,
    redoAnnotation,
    canUndo,
    canRedo,
  } = useAnnotations()

  // Ref to access latest annotations in async callbacks (avoids stale closure)
  const annotationsRef = useRef(annotations)
  annotationsRef.current = annotations

  // Load pending file on mount
  // Use ref to prevent double execution in StrictMode from causing race conditions
  const loadAttemptedRef = useRef(false)

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (loadAttemptedRef.current) {
      return
    }
    loadAttemptedRef.current = true

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
  // Don't redirect if password prompt is showing OR if PDF is currently loading
  useEffect(() => {
    if (!isInitialLoading && !file && !needsPassword && !isPdfLoading) {
      router.replace("/")
    }
  }, [isInitialLoading, file, needsPassword, isPdfLoading, router])

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

  // Handle rotate multiple pages from sidebar
  const handleRotatePages = useCallback(
    async (pageIndices: number[]) => {
      console.log('[handleRotatePages] Rotating pages (0-based indices):', pageIndices)
      // Rotate all selected pages sequentially
      for (const index of pageIndices) {
        console.log('[handleRotatePages] Rotating page at index:', index)
        await rotatePage(index, 90)
      }
    },
    [rotatePage]
  )

  // Handle rotate action from top bar
  // - If thumbnails have an explicit selection, rotate those pages
  // - Otherwise, rotate the currently focused page in the main viewer
  const handleRotate = useCallback(() => {
    if (selectedThumbnailPages.length > 0) {
      const indices = selectedThumbnailPages
        .slice()
        .sort((a, b) => a - b)
        .map(p => p - 1)
      handleRotatePages(indices)
    } else {
      rotatePage(currentPage - 1, 90)
    }
  }, [currentPage, rotatePage, selectedThumbnailPages, handleRotatePages])

  // Handle delete action from top bar
  // - If thumbnails have a selection, delete those pages
  // - Otherwise, delete the current page
  const handleDelete = useCallback(() => {
    if (selectedThumbnailPages.length > 0) {
      handleDeletePages(selectedThumbnailPages.map(p => p - 1))
      return
    }

    if (pageCount > 1) {
      deletePage(currentPage - 1)
    }
  }, [deletePage, currentPage, pageCount, selectedThumbnailPages, handleDeletePages])

  // Handle fit to page - uses canvasContainerRef for accurate dimensions
  const handleFitToPage = useCallback(async () => {
    if (!canvasContainerRef.current || !pdfJs) return

    try {
      // Get dimensions from the current page
      const page = await pdfJs.getPage(currentPage)
      const viewport = page.getViewport({ scale: 1 })
      const dimensions = { width: viewport.width, height: viewport.height }

      const rect = canvasContainerRef.current.getBoundingClientRect()
      fitToPage({ width: rect.width, height: rect.height }, dimensions)
    } catch (err) {
      console.error('Failed to get page dimensions for fit-to-page:', err)
    }
  }, [fitToPage, pdfJs, currentPage])

  // Handle annotation add (now receives pageNumber from PageRenderer)
  const handleAnnotationAdd = useCallback(
    (pageNumber: number, fabricJSON: string, type: ToolType, pageRotation?: number): string => {
      return addAnnotation(pageNumber, fabricJSON, type, pageRotation)
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

  // Handle page selection from sidebar (triggers scroll to page)
  const handlePageSelect = useCallback(
    (pageNumber: number) => {
      goToPage(pageNumber)
      setScrollTargetPage(pageNumber)
    },
    [goToPage]
  )

  // Handle signature request
  const handleSignatureRequest = useCallback(() => {
    setShowSignatureModal(true)
  }, [])

  // Handle save/download with annotations
  // Uses direct canvas data to avoid React state race condition
  const handleSave = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)
    setSaveResult(null)

    console.log('[handleSave] Starting save process...')

    try {
      // Step 1: Sync canvas to React state (for undo/redo history)
      syncAllCanvasesToAnnotations()

      // Step 2: Get canvas data directly (bypass React state race condition)
      const directCanvasData = getCanvasAnnotationsDirectly()

      console.log('[handleSave] Direct canvas data pages:', directCanvasData.size)

      // Step 3: Save PDF using direct canvas data (most reliable)
      const result = await savePDF(annotations, scale, directCanvasData)

      // Step 4: Show result to user
      if (result) {
        setSaveResult(result)
      }

      console.log('[handleSave] Save complete!')
    } catch (err) {
      console.error('[handleSave] Save failed:', err)
      // Create error result for display
      setSaveResult({
        success: false,
        savedCount: 0,
        failedCount: 0,
        errors: [{
          annotationId: '',
          annotationType: '',
          message: err instanceof Error ? err.message : 'Unknown error occurred',
          recoverable: false,
        }],
        warnings: [],
      })
    } finally {
      setIsSaving(false)
    }
  }, [savePDF, annotations, scale, isSaving])

  // Dismiss save result toast
  const handleDismissSaveResult = useCallback(() => {
    setSaveResult(null)
  }, [])

  // Handle password submit
  const handlePasswordSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await submitPassword(passwordInput)
    setPasswordInput("")
  }, [submitPassword, passwordInput])

  // Handle password cancel
  const handlePasswordCancel = useCallback(() => {
    cancelPasswordPrompt()
    setPasswordInput("")
    router.replace("/")
  }, [cancelPasswordPrompt, router])

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

  // Handle undo
  const handleUndo = useCallback(() => {
    undoAnnotation(currentPage)
  }, [undoAnnotation, currentPage])

  // Handle redo
  const handleRedo = useCallback(() => {
    redoAnnotation(currentPage)
  }, [redoAnnotation, currentPage])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      if (!modifier) return

      // Undo: Ctrl+Z (or Cmd+Z on Mac)
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undoAnnotation(currentPage)
      }
      // Redo: Ctrl+Shift+Z or Ctrl+Y (or Cmd+Shift+Z on Mac)
      else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault()
        redoAnnotation(currentPage)
      }
      // Save: Ctrl+S (or Cmd+S on Mac)
      else if (e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undoAnnotation, redoAnnotation, currentPage, handleSave])

  // Password prompt for protected PDFs
  if (needsPassword) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-sm p-6 border rounded-lg bg-card">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Password Protected PDF</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This PDF requires a password to open
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePasswordCancel}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!passwordInput || isPdfLoading}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isPdfLoading ? "Opening..." : "Open"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Loading state (initial page load)
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

  // PDF is loading (file selected but not yet fully loaded)
  // This handles the case where PDF.js is processing the file
  if (isPdfLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">PDF 열는 중...</p>
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

      {/* Compact Top Bar */}
      <EditorTopBar
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
        onSave={handleSave}
        onOpenFile={handleOpenFile}
        isSaving={isSaving}
        canUndo={canUndo(currentPage)}
        canRedo={canRedo(currentPage)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        fileName={file?.name}
      />

      {/* Main content area with vertical toolbar */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Left Vertical Toolbar - Tools */}
        <EditorVerticalToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
        />

        {/* Sidebar with thumbnails */}
        <EditorSidebar
          pdfDoc={pdfJs}
          currentPage={currentPage}
          documentVersion={documentVersion}
          onPageSelect={handlePageSelect}
          onReorderPages={reorderPages}
          onMergePDF={mergePDF}
          onExtractPages={extractPages}
          onDeletePages={handleDeletePages}
          onRotatePages={handleRotatePages}
          onSelectedPagesChange={setSelectedThumbnailPages}
        />

        {/* Tool Settings Panel - now floats over canvas */}
        <div ref={canvasContainerRef} className="relative flex-1 flex flex-col overflow-hidden">
          <ToolSettingsPanel
            activeTool={activeTool}
            settings={toolSettings}
            onSettingsChange={setToolSettings}
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
            targetPage={scrollTargetPage}
            documentVersion={documentVersion}
            getPageRotation={getPageRotation}
          />
        </div>
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

      {/* Save Result Toast */}
      <SaveToast
        result={saveResult}
        onDismiss={handleDismissSaveResult}
      />

      {/* Bottom Sticky Ad */}
      <div className="mt-auto sticky bottom-0 left-0 right-0 bg-background border-t border-border z-30">
        <BannerAdSlot slot="8315683602" />
      </div>
    </div>
  )
}
