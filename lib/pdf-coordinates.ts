/**
 * PDF Coordinate Transformation Utilities
 *
 * Fabric.js coordinate system:
 * - Origin: top-left
 * - Y-axis: positive downward
 * - left/top: position in CANVAS coordinates (affected by zoom/scale)
 * - width/height: BASE dimensions (NOT affected by canvas scale)
 * - scaleX/scaleY: object's local transform (user resize)
 *
 * PDF coordinate system:
 * - Origin: bottom-left
 * - Y-axis: positive upward
 * - All coordinates in points (1/72 inch)
 */

export interface FabricObjectData {
  left?: number
  top?: number
  width?: number
  height?: number
  scaleX?: number
  scaleY?: number
  fontSize?: number
  path?: Array<(string | number)[]>
}

export interface PDFCoordinates {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Transform Fabric.js object coordinates to PDF coordinates
 *
 * @param obj - Serialized Fabric object data from toObject()
 * @param pageHeight - PDF page height in points
 * @param canvasScale - Current canvas zoom level (e.g., 1.5 for 150%)
 * @returns PDF coordinates with origin at bottom-left
 */
export function fabricToPDF(
  obj: FabricObjectData,
  pageHeight: number,
  canvasScale: number
): PDFCoordinates {
  // Step 1: Convert position from canvas coords to PDF coords
  // left/top are in canvas-scaled coordinates, so divide by scale
  const pdfX = (obj.left || 0) / canvasScale
  const pdfTop = (obj.top || 0) / canvasScale

  // Step 2: Calculate actual dimensions
  // width/height are BASE dimensions, multiply by object scale only
  // NOTE: Do NOT divide by canvasScale - width/height are not affected by zoom
  const objScaleX = obj.scaleX || 1
  const objScaleY = obj.scaleY || 1
  const pdfWidth = (obj.width || 0) * objScaleX
  const pdfHeight = (obj.height || 0) * objScaleY

  // Step 3: Flip Y-axis (PDF origin is bottom-left)
  // In PDF, Y increases upward: pdfY = pageHeight - canvasTop - objectHeight
  const pdfY = pageHeight - pdfTop - pdfHeight

  return { x: pdfX, y: pdfY, width: pdfWidth, height: pdfHeight }
}

/**
 * Transform text annotation coordinates
 * Text baseline in PDF is at the bottom of the text
 *
 * @param obj - Serialized Fabric IText object data
 * @param pageHeight - PDF page height in points
 * @param canvasScale - Current canvas zoom level
 * @returns PDF text coordinates and effective font size
 */
export function fabricTextToPDF(
  obj: FabricObjectData,
  pageHeight: number,
  canvasScale: number
): { x: number; y: number; fontSize: number } {
  // Position from canvas coords
  const pdfX = (obj.left || 0) / canvasScale
  const pdfTop = (obj.top || 0) / canvasScale

  // Font size is stored unscaled in Fabric, apply object scaleY for resize
  // NOTE: Do NOT divide by canvasScale - fontSize is independent of zoom
  const baseFontSize = obj.fontSize || 16
  const effectiveFontSize = baseFontSize * (obj.scaleY || 1)

  // PDF text Y is the baseline position (approximately at the bottom of text)
  // Fabric top is the TOP of the text box, PDF needs the baseline
  const pdfY = pageHeight - pdfTop - effectiveFontSize

  return { x: pdfX, y: pdfY, fontSize: effectiveFontSize }
}

/**
 * Transform path point from Fabric canvas coords to PDF coords
 *
 * Path points in Fabric are relative to the path's local origin (0,0).
 * The path object's left/top define the container position.
 *
 * @param point - Raw path point (x, y) relative to path origin
 * @param pathOffset - Path container position (left, top) in canvas coords
 * @param pathScale - Path's scaleX/scaleY from user resize
 * @param pageHeight - PDF page height in points
 * @param canvasScale - Current canvas zoom level
 * @returns PDF point coordinates
 */
export function fabricPathPointToPDF(
  point: { x: number; y: number },
  pathOffset: { left: number; top: number },
  pathScale: { scaleX: number; scaleY: number },
  pageHeight: number,
  canvasScale: number
): { x: number; y: number } {
  // Path points are relative to path origin, apply path scale
  // Then add the path container offset (which is in canvas coords)
  const canvasX = pathOffset.left + point.x * pathScale.scaleX
  const canvasY = pathOffset.top + point.y * pathScale.scaleY

  // Convert to PDF coordinates
  const pdfX = canvasX / canvasScale
  const pdfY = pageHeight - (canvasY / canvasScale)

  return { x: pdfX, y: pdfY }
}

/**
 * Helper to convert hex color to RGB values (0-1 range for pdf-lib)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  const cleanHex = hex.replace('#', '')

  // Handle shorthand (e.g., #fff)
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex

  const num = parseInt(fullHex, 16)
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  }
}
