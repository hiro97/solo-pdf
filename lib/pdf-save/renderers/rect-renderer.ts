import { rgb } from 'pdf-lib'
import { BaseRenderer } from './base'
import type { FabricObject, SaveContext } from '../types'

/**
 * Renderer for rectangle annotations including redactions.
 * Handles both filled and stroked rectangles.
 */
export class RectRenderer extends BaseRenderer {
  canRender(obj: FabricObject): boolean {
    const type = this.getObjectType(obj)
    return type === 'rect'
  }

  async render(obj: FabricObject, ctx: SaveContext, annotationId: string): Promise<void> {
    try {
      const coords = this.transformCoordinates(obj, ctx)

      // Get fill color if not transparent
      const fillColor =
        obj.fill && obj.fill !== 'transparent' && obj.fill !== ''
          ? this.hexToRgb(obj.fill)
          : null

      // Get stroke color
      const strokeColor = obj.stroke ? this.hexToRgb(obj.stroke) : null

      const strokeWidth = this.getStrokeWidth(obj, ctx)

      // Handle opacity for highlighter effect
      const opacity = obj.opacity ?? 1

      ctx.page.drawRectangle({
        x: coords.x,
        y: coords.y,
        width: coords.width,
        height: coords.height,
        color: fillColor ? rgb(fillColor.r, fillColor.g, fillColor.b) : undefined,
        borderColor: strokeColor ? rgb(strokeColor.r, strokeColor.g, strokeColor.b) : undefined,
        borderWidth: strokeWidth,
        opacity: opacity,
      })
    } catch (error) {
      this.addError(
        ctx,
        annotationId,
        'rect',
        `Failed to render rectangle: ${error instanceof Error ? error.message : 'Unknown error'}`,
        true
      )
    }
  }
}
