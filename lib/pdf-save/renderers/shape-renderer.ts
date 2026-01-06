import { rgb } from 'pdf-lib'
import { BaseRenderer } from './base'
import type { FabricObject, FabricCircleObject, FabricLineObject, SaveContext } from '../types'

/**
 * Renderer for shape annotations: Circle, Line, and Highlighter.
 */
export class ShapeRenderer extends BaseRenderer {
  canRender(obj: FabricObject): boolean {
    const type = this.getObjectType(obj)
    return type === 'circle' || type === 'ellipse' || type === 'line'
  }

  async render(obj: FabricObject, ctx: SaveContext, annotationId: string): Promise<void> {
    const type = this.getObjectType(obj)

    try {
      if (type === 'circle' || type === 'ellipse') {
        await this.renderCircle(obj as FabricCircleObject, ctx, annotationId)
      } else if (type === 'line') {
        await this.renderLine(obj as FabricLineObject, ctx, annotationId)
      }
    } catch (error) {
      this.addError(
        ctx,
        annotationId,
        type,
        `Failed to render ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        true
      )
    }
  }

  private async renderCircle(
    obj: FabricCircleObject,
    ctx: SaveContext,
    annotationId: string
  ): Promise<void> {
    const bounds = this.getObjectBounds(obj)
    const centerX = bounds.left + (bounds.width / 2)
    const centerY = bounds.top + (bounds.height / 2)
    const radiusX = (bounds.width / 2) / ctx.canvasScale
    const radiusY = (bounds.height / 2) / ctx.canvasScale
    const center = this.canvasPointToPDF({ x: centerX, y: centerY }, ctx)

    // Get colors
    const fillColor =
      obj.fill && obj.fill !== 'transparent' && obj.fill !== ''
        ? this.hexToRgb(obj.fill)
        : null
    const strokeColor = obj.stroke ? this.hexToRgb(obj.stroke) : null
    const opacity = obj.opacity ?? 1

    ctx.page.drawEllipse({
      x: center.x,
      y: center.y,
      xScale: radiusX,
      yScale: radiusY,
      color: fillColor ? rgb(fillColor.r, fillColor.g, fillColor.b) : undefined,
      borderColor: strokeColor ? rgb(strokeColor.r, strokeColor.g, strokeColor.b) : undefined,
      borderWidth: this.getStrokeWidth(obj, ctx),
      opacity: opacity,
    })
  }

  private async renderLine(
    obj: FabricLineObject,
    ctx: SaveContext,
    annotationId: string
  ): Promise<void> {
    const scaleX = obj.scaleX ?? 1
    const scaleY = obj.scaleY ?? 1

    // Fabric.js Line has x1, y1, x2, y2 relative to its origin
    const x1 = obj.x1 ?? 0
    const y1 = obj.y1 ?? 0
    const x2 = obj.x2 ?? 0
    const y2 = obj.y2 ?? 0

    const bounds = this.getObjectBounds(obj)
    const centerX = bounds.left + (bounds.width / 2)
    const centerY = bounds.top + (bounds.height / 2)

    const start = this.canvasPointToPDF(
      { x: centerX + (x1 * scaleX), y: centerY + (y1 * scaleY) },
      ctx
    )
    const end = this.canvasPointToPDF(
      { x: centerX + (x2 * scaleX), y: centerY + (y2 * scaleY) },
      ctx
    )

    const strokeColor = obj.stroke ? this.hexToRgb(obj.stroke) : { r: 0, g: 0, b: 0 }
    const strokeWidth = this.getStrokeWidth(obj, ctx) || 1
    const opacity = obj.opacity ?? 1

    ctx.page.drawLine({
      start: { x: start.x, y: start.y },
      end: { x: end.x, y: end.y },
      thickness: strokeWidth,
      color: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
      opacity: opacity,
    })
  }
}

/**
 * Renderer for highlighter annotations.
 * Highlighter is essentially a semi-transparent rectangle.
 */
export class HighlighterRenderer extends BaseRenderer {
  canRender(obj: FabricObject): boolean {
    // Highlighter is typically stored as a rect with low opacity
    // We need additional metadata to distinguish it, but for now
    // we'll handle it in the rect renderer with opacity support
    return false // Handled by RectRenderer with opacity
  }

  async render(obj: FabricObject, ctx: SaveContext, annotationId: string): Promise<void> {
    // Highlighter rendering is handled by RectRenderer
    // This class exists for potential future separation
  }
}
