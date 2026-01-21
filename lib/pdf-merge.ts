import { PDFDocument } from 'pdf-lib'

/**
 * Progress information during PDF merge
 */
export interface MergeProgress {
  currentFile: number
  totalFiles: number
  percentage: number
}

/**
 * Merges multiple PDF files into a single PDF
 *
 * Strategy:
 * - Sequential processing (not parallel) to manage memory efficiently
 * - Each PDF is loaded, pages copied, then source can be garbage collected
 * - Progress tracking after each file for real-time feedback
 *
 * @param files - Array of PDF files to merge
 * @param onProgress - Optional callback for progress updates
 * @returns ArrayBuffer containing the merged PDF
 * @throws Error if merge fails or no files provided
 */
export async function mergePDFs(
  files: File[],
  onProgress?: (progress: MergeProgress) => void
): Promise<ArrayBuffer> {
  if (!files || files.length === 0) {
    throw new Error('No files to merge')
  }

  // Create new PDF document for merged result
  const mergedPdf = await PDFDocument.create()

  // Process each file sequentially
  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await readFileAsArrayBuffer(file)

      // Load PDF with ignoreEncryption to handle encrypted PDFs
      const sourcePdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      })

      // Get all page indices
      const pageCount = sourcePdf.getPageCount()
      const pageIndices = Array.from({ length: pageCount }, (_, idx) => idx)

      // Copy all pages from source to merged PDF
      const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices)

      // Add copied pages to merged document
      copiedPages.forEach(page => {
        mergedPdf.addPage(page)
      })

      // Report progress after processing each file
      if (onProgress) {
        const currentFile = i + 1
        const totalFiles = files.length
        const percentage = Math.round((currentFile / totalFiles) * 100)

        onProgress({
          currentFile,
          totalFiles,
          percentage,
        })
      }
    } catch (error) {
      // Add context to error for better debugging
      throw new Error(
        `Failed to process file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  // Save merged PDF as ArrayBuffer
  const mergedPdfBytes = await mergedPdf.save()
  // Convert Uint8Array to ArrayBuffer (create a copy to ensure it's an ArrayBuffer, not SharedArrayBuffer)
  const arrayBuffer = new ArrayBuffer(mergedPdfBytes.byteLength)
  const view = new Uint8Array(arrayBuffer)
  view.set(mergedPdfBytes)
  return arrayBuffer
}

/**
 * Helper: Read File as ArrayBuffer
 */
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.readAsArrayBuffer(file)
  })
}
