import type { PDFDocument, PDFPage, PDFFont } from 'pdf-lib'

// ========== Save Result Types ==========

export interface SaveResult {
  success: boolean
  savedCount: number
  failedCount: number
  errors: SaveError[]
  warnings: SaveWarning[]
  pdfBytes?: Uint8Array
}

export interface SaveError {
  annotationId: string
  annotationType: string
  message: string
  recoverable: boolean
}

export interface SaveWarning {
  annotationId: string
  annotationType: string
  message: string
}

// ========== Save Context ==========

export interface FontManager {
  getFont(
    fontFamily: string,
    options?: { bold?: boolean; italic?: boolean; text?: string }
  ): Promise<PDFFont>
}

export interface SaveContext {
  pdfDoc: PDFDocument
  page: PDFPage
  pageHeight: number
  pageWidth: number
  canvasScale: number
  fontManager: FontManager
  // CropBox offset - annotations need to be shifted by this amount
  // because pdf.js renders CropBox at (0,0) but PDF coords use MediaBox origin
  cropBoxOffsetX: number
  cropBoxOffsetY: number
  // Mutable: renderers add errors/warnings here
  errors: SaveError[]
  warnings: SaveWarning[]
}

// ========== Annotation Data ==========

export interface AnnotationData {
  id: string
  json: string
}

export type AnnotationsByPage = Map<number, AnnotationData[]>

// ========== Fabric.js Object Types (simplified for PDF rendering) ==========

export interface FabricBaseObject {
  type?: string
  left?: number
  top?: number
  width?: number
  height?: number
  scaleX?: number
  scaleY?: number
  originX?: string
  originY?: string
  angle?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  strokeUniform?: boolean
  opacity?: number
}

export interface FabricTextObject extends FabricBaseObject {
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string | number
  fontStyle?: string
  underline?: boolean
  linethrough?: boolean
  lineHeight?: number
  styles?: Record<number, Record<number, TextCharStyle>>
}

export interface TextCharStyle {
  fill?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string | number
  fontStyle?: string
  underline?: boolean
  linethrough?: boolean
}

export interface FabricPathObject extends FabricBaseObject {
  path?: Array<(string | number)[]>
}

export interface FabricImageObject extends FabricBaseObject {
  src?: string
}

export interface FabricCircleObject extends FabricBaseObject {
  radius?: number
}

export interface FabricLineObject extends FabricBaseObject {
  x1?: number
  y1?: number
  x2?: number
  y2?: number
}

export type FabricObject =
  | FabricTextObject
  | FabricPathObject
  | FabricImageObject
  | FabricCircleObject
  | FabricLineObject
  | FabricBaseObject

// ========== Renderer Interface ==========

export interface AnnotationRenderer {
  /**
   * Check if this renderer can handle the given Fabric.js object
   */
  canRender(obj: FabricObject): boolean

  /**
   * Render the Fabric.js object to the PDF page
   * Should not throw - instead add errors to ctx.errors
   */
  render(obj: FabricObject, ctx: SaveContext, annotationId: string): Promise<void>
}

// ========== Save Options ==========

export interface SaveOptions {
  /** Whether to validate the saved PDF */
  validate?: boolean
  /** Custom filename for download */
  filename?: string
}
