import type { FabricObject, SaveContext, AnnotationRenderer } from '../types'

/**
 * Abstract base class for annotation renderers.
 * Provides common utilities for coordinate transformation and error handling.
 */
export abstract class BaseRenderer implements AnnotationRenderer {
  abstract canRender(obj: FabricObject): boolean
  abstract render(obj: FabricObject, ctx: SaveContext, annotationId: string): Promise<void>

  protected resolveOrigin(origin: string | undefined): number {
    if (origin === 'left' || origin === 'top') return 0
    if (origin === 'right' || origin === 'bottom') return 1
    if (origin === 'center') return 0.5
    if (origin === 'middle') return 0.5
    return 0.5
  }

  protected getObjectBounds(obj: FabricObject): { left: number; top: number; width: number; height: number } {
    const width = (obj.width ?? 0) * (obj.scaleX ?? 1)
    const height = (obj.height ?? 0) * (obj.scaleY ?? 1)
    const originX = this.resolveOrigin(obj.originX)
    const originY = this.resolveOrigin(obj.originY)
    const left = (obj.left ?? 0) - (originX * width)
    const top = (obj.top ?? 0) - (originY * height)

    return { left, top, width, height }
  }

  protected canvasPointToPDF(
    point: { x: number; y: number },
    ctx: SaveContext
  ): { x: number; y: number } {
    const pdfX = (point.x / ctx.canvasScale) + ctx.cropBoxOffsetX
    const pdfY = ctx.cropBoxOffsetY + (ctx.pageHeight - (point.y / ctx.canvasScale))
    return { x: pdfX, y: pdfY }
  }

  protected getStrokeWidth(obj: FabricObject, ctx: SaveContext): number {
    const base = obj.strokeWidth ?? 0
    const uniform = obj.strokeUniform ?? false
    const scaleFactor = uniform ? 1 : (Math.abs(obj.scaleX ?? 1) + Math.abs(obj.scaleY ?? 1)) / 2
    return (base * scaleFactor) / ctx.canvasScale
  }

  /**
   * Convert hex color to RGB values (0-1 range for pdf-lib)
   */
  protected hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      return {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    }
    // Default to black if parsing fails
    return { r: 0, g: 0, b: 0 }
  }

  /**
   * Transform Fabric.js coordinates to PDF coordinates.
   * Fabric: origin top-left, Y increases downward
   * PDF: origin bottom-left, Y increases upward
   *
   * Also applies CropBox offset if the PDF uses a CropBox that doesn't
   * start at (0,0). This is necessary because pdf.js renders the CropBox
   * area at canvas (0,0), but PDF coordinates are relative to MediaBox origin.
   */
  protected transformCoordinates(
    obj: FabricObject,
    ctx: SaveContext
  ): { x: number; y: number; width: number; height: number } {
    const bounds = this.getObjectBounds(obj)

    const pdfX = bounds.left / ctx.canvasScale
    const pdfTop = bounds.top / ctx.canvasScale
    const pdfWidth = bounds.width / ctx.canvasScale
    const pdfHeight = bounds.height / ctx.canvasScale

    // Apply CropBox offset - shift coordinates to align with MediaBox origin
    // Canvas (0,0) = CropBox origin, but PDF uses MediaBox origin
    const x = pdfX + ctx.cropBoxOffsetX

    // Flip Y axis: PDF origin is bottom-left
    // Also apply CropBox Y offset
    const y = ctx.cropBoxOffsetY + (ctx.pageHeight - pdfTop - pdfHeight)

    return { x, y, width: pdfWidth, height: pdfHeight }
  }

  /**
   * Transform a point from Fabric.js path coordinates to PDF coordinates.
   * Used for path rendering where points are relative to the path origin.
   *
   * Path points in Fabric.js are in LOCAL coordinates (not affected by canvas scale).
   * Only pathOffset (left/top) is in canvas coordinates and needs scale conversion.
   */
  protected transformPathPoint(
    point: { x: number; y: number },
    pathOffset: { left: number; top: number },
    pathScale: { scaleX: number; scaleY: number },
    ctx: SaveContext
  ): { x: number; y: number } {
    // Apply path's local scale (user resize)
    // Point coordinates are in LOCAL space - NOT affected by canvas scale
    const scaledX = (point.x * pathScale.scaleX) / ctx.canvasScale
    const scaledY = (point.y * pathScale.scaleY) / ctx.canvasScale

    // pathOffset.left/top are in CANVAS coordinates - divide by canvasScale
    // Then add local coordinates (which are already in PDF points)
    const pdfX = (pathOffset.left / ctx.canvasScale) + scaledX
    const pdfY = (pathOffset.top / ctx.canvasScale) + scaledY

    // Apply CropBox offset and flip Y axis
    const x = pdfX + ctx.cropBoxOffsetX
    const y = ctx.cropBoxOffsetY + (ctx.pageHeight - pdfY)

    return { x, y }
  }

  /**
   * Add an error to the save context
   */
  protected addError(
    ctx: SaveContext,
    annotationId: string,
    annotationType: string,
    message: string,
    recoverable: boolean = true
  ): void {
    ctx.errors.push({
      annotationId,
      annotationType,
      message,
      recoverable,
    })
  }

  /**
   * Add a warning to the save context
   */
  protected addWarning(
    ctx: SaveContext,
    annotationId: string,
    annotationType: string,
    message: string
  ): void {
    ctx.warnings.push({
      annotationId,
      annotationType,
      message,
    })
  }

  /**
   * Get normalized object type (lowercase)
   */
  protected getObjectType(obj: FabricObject): string {
    return (obj.type ?? '').toLowerCase()
  }
}
