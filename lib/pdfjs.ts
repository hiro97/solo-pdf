import * as pdfjsLib from 'pdfjs-dist'

// Worker configuration for pdfjs-dist v5
let isWorkerConfigured = false

export function configurePdfWorker() {
  if (typeof window === 'undefined') return
  if (isWorkerConfigured) return

  // Set worker source to local file in public folder
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  isWorkerConfigured = true

  console.log('[PDF.js] Worker configured:', pdfjsLib.GlobalWorkerOptions.workerSrc)
}

// Eagerly configure on import in browser
if (typeof window !== 'undefined') {
  // Use setTimeout to ensure this runs after module initialization
  setTimeout(configurePdfWorker, 0)
}

export { pdfjsLib }
export type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
