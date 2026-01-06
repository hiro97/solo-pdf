import { rgb } from 'pdf-lib'
import { BaseRenderer } from './base'
import { quadraticToCubic, approximateQuadraticWithLines, type Point } from '../utils/bezier'
import type { FabricObject, FabricPathObject, SaveContext } from '../types'

/**
 * Renderer for path (freehand drawing) annotations.
 * Uses line approximation for curves since pdf-lib doesn't support bezier curves directly.
 */
export class PathRenderer extends BaseRenderer {
  canRender(obj: FabricObject): boolean {
    const type = this.getObjectType(obj)
    return type === 'path'
  }

  async render(obj: FabricObject, ctx: SaveContext, annotationId: string): Promise<void> {
    const pathObj = obj as FabricPathObject

    if (!pathObj.path || pathObj.path.length === 0) {
      this.addWarning(ctx, annotationId, 'path', 'Path has no drawing data.')
      return
    }

    try {
      const strokeColor = this.hexToRgb(pathObj.stroke ?? '#000000')
      const strokeWidth = this.getStrokeWidth(pathObj, ctx) || 1
      const opacity = pathObj.opacity ?? 1

      const bounds = this.getObjectBounds(pathObj)
      const centerX = bounds.left + (bounds.width / 2)
      const centerY = bounds.top + (bounds.height / 2)
      const scaleX = pathObj.scaleX ?? 1
      const scaleY = pathObj.scaleY ?? 1
      const pathBounds = this.getPathBounds(pathObj.path)
      const pathOffset = {
        x: (pathBounds.minX + pathBounds.maxX) / 2,
        y: (pathBounds.minY + pathBounds.maxY) / 2,
      }

      const toPdfPoint = (point: Point): Point => {
        const canvasX = centerX + ((point.x - pathOffset.x) * scaleX)
        const canvasY = centerY + ((point.y - pathOffset.y) * scaleY)
        return this.canvasPointToPDF({ x: canvasX, y: canvasY }, ctx)
      }

      // Track current point for curve rendering
      let currentPoint: Point | null = null

      for (const cmd of pathObj.path) {
        const command = cmd[0] as string

        switch (command) {
          case 'M': {
            // Move to - just update current point
            currentPoint = toPdfPoint({ x: cmd[1] as number, y: cmd[2] as number })
            break
          }

          case 'L': {
            // Line to
            const endPoint = toPdfPoint({ x: cmd[1] as number, y: cmd[2] as number })

            if (currentPoint) {
              ctx.page.drawLine({
                start: currentPoint,
                end: endPoint,
                thickness: strokeWidth,
                color: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
                opacity: opacity,
              })
            }
            currentPoint = endPoint
            break
          }

          case 'Q': {
            // Quadratic bezier curve - approximate with line segments
            if (!currentPoint) break

            const controlPoint = toPdfPoint({ x: cmd[1] as number, y: cmd[2] as number })
            const endPoint = toPdfPoint({ x: cmd[3] as number, y: cmd[4] as number })

            // Approximate curve with 8 line segments for smoothness
            const points = approximateQuadraticWithLines(currentPoint, controlPoint, endPoint, 8)

            // Draw line segments
            for (let i = 0; i < points.length - 1; i++) {
              ctx.page.drawLine({
                start: points[i],
                end: points[i + 1],
                thickness: strokeWidth,
                color: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
                opacity: opacity,
              })
            }

            currentPoint = endPoint
            break
          }

          case 'C': {
            // Cubic bezier curve - approximate with line segments
            if (!currentPoint) break

            const cp1 = toPdfPoint({ x: cmd[1] as number, y: cmd[2] as number })
            const cp2 = toPdfPoint({ x: cmd[3] as number, y: cmd[4] as number })
            const endPoint = toPdfPoint({ x: cmd[5] as number, y: cmd[6] as number })

            // Approximate cubic curve with line segments
            const segments = 10
            let prevPoint = currentPoint

            for (let i = 1; i <= segments; i++) {
              const t = i / segments
              const point = this.interpolateCubic(t, currentPoint, cp1, cp2, endPoint)

              ctx.page.drawLine({
                start: prevPoint,
                end: point,
                thickness: strokeWidth,
                color: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
                opacity: opacity,
              })

              prevPoint = point
            }

            currentPoint = endPoint
            break
          }

          case 'Z':
          case 'z': {
            // Close path - we don't need to do anything special here
            // since we're drawing individual line segments
            break
          }
        }
      }
    } catch (error) {
      this.addError(
        ctx,
        annotationId,
        'path',
        `Failed to render path: ${error instanceof Error ? error.message : 'Unknown error'}`,
        true
      )
    }
  }

  /**
   * Interpolate a point along a cubic bezier curve.
   */
  private interpolateCubic(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
    const oneMinusT = 1 - t
    const oneMinusT2 = oneMinusT * oneMinusT
    const oneMinusT3 = oneMinusT2 * oneMinusT
    const t2 = t * t
    const t3 = t2 * t

    return {
      x: oneMinusT3 * p0.x + 3 * oneMinusT2 * t * p1.x + 3 * oneMinusT * t2 * p2.x + t3 * p3.x,
      y: oneMinusT3 * p0.y + 3 * oneMinusT2 * t * p1.y + 3 * oneMinusT * t2 * p2.y + t3 * p3.y,
    }
  }

  private getPathBounds(path: Array<(string | number)[]>): { minX: number; minY: number; maxX: number; maxY: number } {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const cmd of path) {
      const command = cmd[0] as string
      switch (command) {
        case 'M':
        case 'L': {
          const x = cmd[1] as number
          const y = cmd[2] as number
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
          break
        }
        case 'Q': {
          const x1 = cmd[1] as number
          const y1 = cmd[2] as number
          const x = cmd[3] as number
          const y = cmd[4] as number
          minX = Math.min(minX, x1, x)
          minY = Math.min(minY, y1, y)
          maxX = Math.max(maxX, x1, x)
          maxY = Math.max(maxY, y1, y)
          break
        }
        case 'C': {
          const x1 = cmd[1] as number
          const y1 = cmd[2] as number
          const x2 = cmd[3] as number
          const y2 = cmd[4] as number
          const x = cmd[5] as number
          const y = cmd[6] as number
          minX = Math.min(minX, x1, x2, x)
          minY = Math.min(minY, y1, y2, y)
          maxX = Math.max(maxX, x1, x2, x)
          maxY = Math.max(maxY, y1, y2, y)
          break
        }
        default:
          break
      }
    }

    if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    }

    return { minX, minY, maxX, maxY }
  }
}
