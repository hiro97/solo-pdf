/**
 * Bezier curve utilities for converting between curve types.
 *
 * Fabric.js PencilBrush generates Quadratic Bezier curves (Q commands),
 * but pdf-lib works better with Cubic Bezier curves (C commands).
 */

export interface Point {
  x: number
  y: number
}

/**
 * Convert a Quadratic Bezier curve to a Cubic Bezier curve.
 *
 * A quadratic curve has 1 control point, while a cubic has 2.
 * The conversion formula:
 *   CP1 = P0 + (2/3) * (QCP - P0)
 *   CP2 = P1 + (2/3) * (QCP - P1)
 *
 * Where:
 *   P0 = start point
 *   P1 = end point
 *   QCP = quadratic control point
 *   CP1, CP2 = cubic control points
 */
export function quadraticToCubic(
  start: Point,
  control: Point,
  end: Point
): { cp1: Point; cp2: Point; end: Point } {
  const cp1: Point = {
    x: start.x + (2 / 3) * (control.x - start.x),
    y: start.y + (2 / 3) * (control.y - start.y),
  }

  const cp2: Point = {
    x: end.x + (2 / 3) * (control.x - end.x),
    y: end.y + (2 / 3) * (control.y - end.y),
  }

  return { cp1, cp2, end }
}

/**
 * Interpolate a point along a quadratic bezier curve.
 * Useful for debugging or approximating curves with line segments.
 *
 * @param t - Parameter from 0 to 1
 * @param p0 - Start point
 * @param p1 - Control point
 * @param p2 - End point
 */
export function interpolateQuadratic(
  t: number,
  p0: Point,
  p1: Point,
  p2: Point
): Point {
  const oneMinusT = 1 - t
  return {
    x: oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x,
    y: oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y,
  }
}

/**
 * Interpolate a point along a cubic bezier curve.
 *
 * @param t - Parameter from 0 to 1
 * @param p0 - Start point
 * @param p1 - Control point 1
 * @param p2 - Control point 2
 * @param p3 - End point
 */
export function interpolateCubic(
  t: number,
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point
): Point {
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

/**
 * Approximate a bezier curve with line segments.
 * Useful when PDF library doesn't support curves directly.
 *
 * @param start - Start point
 * @param control - Control point (for quadratic)
 * @param end - End point
 * @param segments - Number of line segments (default: 8)
 */
export function approximateQuadraticWithLines(
  start: Point,
  control: Point,
  end: Point,
  segments: number = 8
): Point[] {
  const points: Point[] = [start]

  for (let i = 1; i <= segments; i++) {
    const t = i / segments
    points.push(interpolateQuadratic(t, start, control, end))
  }

  return points
}

/**
 * Calculate the length of a quadratic bezier curve (approximation).
 * Uses line segment approximation for estimation.
 */
export function approximateQuadraticLength(
  start: Point,
  control: Point,
  end: Point,
  segments: number = 16
): number {
  let length = 0
  let prevPoint = start

  for (let i = 1; i <= segments; i++) {
    const t = i / segments
    const point = interpolateQuadratic(t, start, control, end)
    length += Math.sqrt(
      Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
    )
    prevPoint = point
  }

  return length
}
