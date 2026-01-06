import type { PDFDocument } from 'pdf-lib'
import { FontManager } from './utils/font-manager'
import { RectRenderer } from './renderers/rect-renderer'
import { ShapeRenderer } from './renderers/shape-renderer'
import { ImageRenderer } from './renderers/image-renderer'
import { PathRenderer } from './renderers/path-renderer'
import { TextRenderer } from './renderers/text-renderer'
import type {
  SaveResult,
  SaveContext,
  SaveOptions,
  AnnotationsByPage,
  AnnotationRenderer,
  FabricObject,
} from './types'

// Re-export types for convenience
export * from './types'

/**
 * Main class for saving PDF documents with annotations.
 * Orchestrates the rendering of different annotation types.
 */
export class PDFSaveManager {
  private renderers: AnnotationRenderer[] = []

  constructor() {
    // Register renderers in order of specificity
    this.renderers = [
      new TextRenderer(),
      new PathRenderer(),
      new RectRenderer(),
      new ShapeRenderer(),
      new ImageRenderer(),
    ]
  }

  /**
   * Save annotations to a PDF document.
   *
   * @param pdfDoc - The pdf-lib PDFDocument to modify
   * @param annotations - Map of page numbers to annotation data
   * @param scale - Canvas scale factor
   * @param options - Save options
   * @returns Save result with status and any errors/warnings
   */
  async save(
    pdfDoc: PDFDocument,
    annotations: AnnotationsByPage,
    scale: number,
    options: SaveOptions = {}
  ): Promise<SaveResult> {
    const result: SaveResult = {
      success: true,
      savedCount: 0,
      failedCount: 0,
      errors: [],
      warnings: [],
    }

    // Create font manager for this save operation
    const fontManager = new FontManager(pdfDoc)

    // Process each page with annotations
    for (const [pageNum, pageAnnotations] of annotations) {
      const pageIndex = pageNum - 1

      // Validate page index
      if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
        result.warnings.push({
          annotationId: '',
          annotationType: '',
          message: `Page ${pageNum} does not exist in the PDF. Skipping ${pageAnnotations.length} annotation(s).`,
        })
        continue
      }

      const page = pdfDoc.getPage(pageIndex)

      // Use the same dimensions that pdf.js uses for rendering
      // pdf.js uses CropBox if present, otherwise MediaBox
      // This ensures annotation coordinates match the visible page area
      const cropBox = page.getCropBox()
      const mediaBox = page.getMediaBox()
      const rotation = page.getRotation().angle

      // Use CropBox dimensions if present, otherwise MediaBox
      // CropBox defines the visible area that pdf.js renders
      const box = cropBox ?? mediaBox
      let pageWidth = box.width
      let pageHeight = box.height

      // Calculate CropBox offset from MediaBox origin
      // pdf.js renders CropBox at canvas (0,0), so we need to add this offset
      // when placing annotations in PDF coordinate space
      let cropBoxOffsetX = cropBox ? cropBox.x : 0
      let cropBoxOffsetY = cropBox ? cropBox.y : 0

      // If page is rotated 90° or 270°, swap width and height
      // This matches how pdf.js getViewport() handles rotation
      if (rotation === 90 || rotation === 270) {
        [pageWidth, pageHeight] = [pageHeight, pageWidth]
        // For rotated pages, the offset also needs transformation
        // This is complex - for now, assume most PDFs don't combine rotation with CropBox offset
      }

      // Create save context for this page
      const ctx: SaveContext = {
        pdfDoc,
        page,
        pageHeight,
        pageWidth,
        canvasScale: scale,
        fontManager,
        cropBoxOffsetX,
        cropBoxOffsetY,
        errors: [],
        warnings: [],
      }

      // Process each annotation on this page
      for (const annotation of pageAnnotations) {
        try {
          const obj = JSON.parse(annotation.json) as FabricObject
          const objType = (obj.type ?? '').toLowerCase()

          // Find a renderer for this object
          const renderer = this.renderers.find((r) => r.canRender(obj))

          if (renderer) {
            await renderer.render(obj, ctx, annotation.id)
            result.savedCount++
          } else {
            result.warnings.push({
              annotationId: annotation.id,
              annotationType: objType,
              message: `No renderer found for annotation type: ${objType}`,
            })
          }
        } catch (error) {
          result.failedCount++
          result.errors.push({
            annotationId: annotation.id,
            annotationType: 'unknown',
            message: `Failed to parse annotation: ${error instanceof Error ? error.message : 'Unknown error'}`,
            recoverable: true,
          })
        }
      }

      // Collect errors and warnings from the context
      result.errors.push(...ctx.errors)
      result.warnings.push(...ctx.warnings)
    }

    // Generate PDF bytes
    try {
      result.pdfBytes = await pdfDoc.save()
    } catch (error) {
      result.success = false
      result.errors.push({
        annotationId: '',
        annotationType: '',
        message: `Failed to save PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recoverable: false,
      })
    }

    // Determine overall success
    // Success if no non-recoverable errors
    result.success = !result.errors.some((e) => !e.recoverable)

    return result
  }
}

/**
 * Convenience function to create a PDFSaveManager and save.
 */
export async function savePDFWithAnnotations(
  pdfDoc: PDFDocument,
  annotations: AnnotationsByPage,
  scale: number,
  options: SaveOptions = {}
): Promise<SaveResult> {
  const manager = new PDFSaveManager()
  return manager.save(pdfDoc, annotations, scale, options)
}

/**
 * Download a PDF to the user's device.
 */
export function downloadPDF(
  pdfBytes: Uint8Array,
  filename: string
): void {
  // Create a new ArrayBuffer copy to avoid SharedArrayBuffer issues
  const buffer = new ArrayBuffer(pdfBytes.byteLength)
  new Uint8Array(buffer).set(pdfBytes)

  const blob = new Blob([buffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  URL.revokeObjectURL(url)
}
