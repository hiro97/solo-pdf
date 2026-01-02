"use client"

import { useState, useCallback } from 'react'
import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib'
import type { Annotation, AnnotationStore } from '../types'
import { pdfjsLib, configurePdfWorker, type PDFDocumentProxy } from '@/lib/pdfjs'
import type { PDFState } from '../types'

// Ensure worker is configured before any PDF operations
configurePdfWorker()

// Convert hex color to RGB values (0-1 range for pdf-lib)
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Parse hex string like "#ff0000" to RGB components
  const cleanHex = hex.replace('#', '')
  const bigint = parseInt(cleanHex, 16)
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  }
}

const initialState: PDFState = {
  file: null,
  pdfLib: null,
  pdfJs: null,
  pageCount: 0,
  currentPage: 1,
  isLoading: false,
  error: null,
}

export function usePDFDocument() {
  const [state, setState] = useState<PDFState>(initialState)

  const loadPDF = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    // Ensure worker is configured before loading
    configurePdfWorker()

    try {
      const arrayBuffer = await file.arrayBuffer()

      // Load with pdf-lib (for manipulation)
      const pdfLibDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      })

      // Load with PDF.js (for rendering)
      // Pass worker source explicitly to avoid CDN fallback
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      })
      const pdfJsDoc = await loadingTask.promise

      setState({
        file,
        pdfLib: pdfLibDoc,
        pdfJs: pdfJsDoc,
        pageCount: pdfJsDoc.numPages,
        currentPage: 1,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      console.error('Failed to load PDF:', err)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load PDF file',
      }))
    }
  }, [])

  const goToPage = useCallback((pageNumber: number) => {
    setState(prev => {
      const clampedPage = Math.max(1, Math.min(pageNumber, prev.pageCount))
      return { ...prev, currentPage: clampedPage }
    })
  }, [])

  const nextPage = useCallback(() => {
    setState(prev => {
      if (prev.currentPage < prev.pageCount) {
        return { ...prev, currentPage: prev.currentPage + 1 }
      }
      return prev
    })
  }, [])

  const prevPage = useCallback(() => {
    setState(prev => {
      if (prev.currentPage > 1) {
        return { ...prev, currentPage: prev.currentPage - 1 }
      }
      return prev
    })
  }, [])

  const rotatePage = useCallback(async (pageIndex: number, rotationDegrees: 90 | 180 | 270) => {
    if (!state.pdfLib) return

    const page = state.pdfLib.getPage(pageIndex)
    const currentRotation = page.getRotation().angle
    const newAngle = (currentRotation + rotationDegrees) % 360
    page.setRotation(degrees(newAngle))

    // Reload PDF.js document
    const pdfBytes = await state.pdfLib.save()
    const loadingTask = pdfjsLib.getDocument({
      data: pdfBytes,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    })
    const pdfJsDoc = await loadingTask.promise

    setState(prev => ({ ...prev, pdfJs: pdfJsDoc }))
  }, [state.pdfLib])

  const deletePage = useCallback(async (pageIndex: number) => {
    if (!state.pdfLib || state.pageCount <= 1) return

    state.pdfLib.removePage(pageIndex)

    // Reload PDF.js document
    const pdfBytes = await state.pdfLib.save()
    const loadingTask = pdfjsLib.getDocument({
      data: pdfBytes,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    })
    const pdfJsDoc = await loadingTask.promise

    setState(prev => ({
      ...prev,
      pdfJs: pdfJsDoc,
      pageCount: pdfJsDoc.numPages,
      currentPage: Math.min(prev.currentPage, pdfJsDoc.numPages),
    }))
  }, [state.pdfLib, state.pageCount])

  // Reorder pages by moving a page from one index to another
  const reorderPages = useCallback(async (fromIndex: number, toIndex: number) => {
    if (!state.pdfLib || fromIndex === toIndex) return
    if (fromIndex < 0 || fromIndex >= state.pageCount) return
    if (toIndex < 0 || toIndex >= state.pageCount) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // Create new PDF with reordered pages
      const newPdf = await PDFDocument.create()
      const pageIndices = Array.from({ length: state.pageCount }, (_, i) => i)

      // Remove from old position and insert at new position
      const [movedIndex] = pageIndices.splice(fromIndex, 1)
      pageIndices.splice(toIndex, 0, movedIndex)

      // Copy pages in new order
      const copiedPages = await newPdf.copyPages(state.pdfLib, pageIndices)
      copiedPages.forEach(page => newPdf.addPage(page))

      // Reload documents
      const pdfBytes = await newPdf.save()
      const newPdfLib = await PDFDocument.load(pdfBytes)
      const loadingTask = pdfjsLib.getDocument({
        data: pdfBytes,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      })
      const pdfJsDoc = await loadingTask.promise

      setState(prev => ({
        ...prev,
        pdfLib: newPdfLib,
        pdfJs: pdfJsDoc,
        isLoading: false,
      }))
    } catch (err) {
      console.error('Failed to reorder pages:', err)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [state.pdfLib, state.pageCount])

  // Merge another PDF file into the current document
  const mergePDF = useCallback(async (file: File, insertAtIndex?: number) => {
    if (!state.pdfLib) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const arrayBuffer = await file.arrayBuffer()
      const externalPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

      const insertIndex = insertAtIndex ?? state.pageCount
      const copiedPages = await state.pdfLib.copyPages(externalPdf, externalPdf.getPageIndices())

      // Insert pages at specified position
      copiedPages.forEach((page, i) => {
        state.pdfLib!.insertPage(insertIndex + i, page)
      })

      // Reload PDF.js document
      const pdfBytes = await state.pdfLib.save()
      const loadingTask = pdfjsLib.getDocument({
        data: pdfBytes,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      })
      const pdfJsDoc = await loadingTask.promise

      setState(prev => ({
        ...prev,
        pdfJs: pdfJsDoc,
        pageCount: pdfJsDoc.numPages,
        isLoading: false,
      }))
    } catch (err) {
      console.error('Failed to merge PDF:', err)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [state.pdfLib, state.pageCount])

  // Extract selected pages as a new PDF and download
  const extractPages = useCallback(async (pageIndices: number[]) => {
    if (!state.pdfLib || !state.file || pageIndices.length === 0) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const newPdf = await PDFDocument.create()
      const copiedPages = await newPdf.copyPages(state.pdfLib, pageIndices)
      copiedPages.forEach(page => newPdf.addPage(page))

      const pdfBytes = await newPdf.save()
      // Convert to ArrayBuffer to avoid SharedArrayBuffer type issues
      const arrayBuffer = pdfBytes.buffer.slice(
        pdfBytes.byteOffset,
        pdfBytes.byteOffset + pdfBytes.byteLength
      ) as ArrayBuffer
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = state.file.name.replace('.pdf', `-pages-${pageIndices.map(i => i + 1).join('-')}.pdf`)
      a.click()

      URL.revokeObjectURL(url)
      setState(prev => ({ ...prev, isLoading: false }))
    } catch (err) {
      console.error('Failed to extract pages:', err)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [state.pdfLib, state.file])

  const savePDF = useCallback(async (annotations?: AnnotationStore) => {
    if (!state.pdfLib || !state.file) return

    // Embed annotations if provided
    if (annotations && annotations.size > 0) {
      const helveticaFont = await state.pdfLib.embedFont(StandardFonts.Helvetica)

      for (const [pageNum, pageAnnotations] of annotations) {
        const pageIndex = pageNum - 1
        if (pageIndex < 0 || pageIndex >= state.pdfLib.getPageCount()) continue

        const page = state.pdfLib.getPage(pageIndex)
        const { height: pageHeight } = page.getSize()

        for (const annotation of pageAnnotations) {
          try {
            const obj = JSON.parse(annotation.fabricJSON)

            // Handle text annotations (IText)
            if (obj.type === 'i-text' && obj.text) {
              const color = hexToRgb(obj.fill || '#000000')
              page.drawText(obj.text, {
                x: obj.left || 0,
                y: pageHeight - (obj.top || 0) - (obj.fontSize || 16),
                size: obj.fontSize || 16,
                font: helveticaFont,
                color: rgb(color.r, color.g, color.b),
              })
            }

            // Handle rectangles (including redactions)
            if (obj.type === 'rect') {
              const fillColor = obj.fill && obj.fill !== 'transparent'
                ? hexToRgb(obj.fill)
                : null
              const strokeColor = obj.stroke
                ? hexToRgb(obj.stroke)
                : null

              page.drawRectangle({
                x: obj.left || 0,
                y: pageHeight - (obj.top || 0) - (obj.height || 0),
                width: obj.width || 0,
                height: obj.height || 0,
                color: fillColor ? rgb(fillColor.r, fillColor.g, fillColor.b) : undefined,
                borderColor: strokeColor ? rgb(strokeColor.r, strokeColor.g, strokeColor.b) : undefined,
                borderWidth: obj.strokeWidth || 0,
              })
            }

            // Handle paths (freehand drawing)
            if (obj.type === 'path' && obj.path) {
              const strokeColor = hexToRgb(obj.stroke || '#000000')
              // Simplified path rendering - draw as lines between points
              // Full SVG path support would require more complex parsing
              const pathData = obj.path as Array<(string | number)[]>
              let lastX = 0, lastY = 0

              for (const cmd of pathData) {
                if (cmd[0] === 'M' || cmd[0] === 'L') {
                  const x = cmd[1] as number
                  const y = cmd[2] as number
                  if (cmd[0] === 'L') {
                    page.drawLine({
                      start: { x: lastX, y: pageHeight - lastY },
                      end: { x, y: pageHeight - y },
                      thickness: obj.strokeWidth || 2,
                      color: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
                    })
                  }
                  lastX = x
                  lastY = y
                } else if (cmd[0] === 'Q') {
                  // Quadratic curve - approximate with line to endpoint
                  const endX = cmd[3] as number
                  const endY = cmd[4] as number
                  page.drawLine({
                    start: { x: lastX, y: pageHeight - lastY },
                    end: { x: endX, y: pageHeight - endY },
                    thickness: obj.strokeWidth || 2,
                    color: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
                  })
                  lastX = endX
                  lastY = endY
                }
              }
            }
          } catch (err) {
            console.error('Failed to embed annotation:', err)
          }
        }
      }
    }

    const pdfBytes = await state.pdfLib.save()
    // Convert to ArrayBuffer to avoid SharedArrayBuffer type issues
    const arrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    ) as ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = state.file.name.replace('.pdf', '-edited.pdf')
    a.click()

    URL.revokeObjectURL(url)
  }, [state.pdfLib, state.file])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    ...state,
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
    reset,
  }
}
