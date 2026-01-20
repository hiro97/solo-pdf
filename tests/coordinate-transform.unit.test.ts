import { describe, it, expect, beforeEach } from 'vitest'
import { BaseRenderer } from '@/lib/pdf-save/renderers/base'
import type { FabricObject as ActualFabricObject, SaveContext as ActualSaveContext } from '@/lib/pdf-save/types'

/**
 * Tests for PDF coordinate transformation logic.
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

// Recreate the transformation logic for testing
interface FabricObject {
  left?: number
  top?: number
  width?: number
  height?: number
  scaleX?: number
  scaleY?: number
  fontSize?: number
}

interface SaveContext {
  pageHeight: number
  pageWidth: number
  canvasScale: number
  cropBoxOffsetX: number
  cropBoxOffsetY: number
}

// This should match the implementation in base.ts
function transformCoordinates(
  obj: FabricObject,
  ctx: SaveContext
): { x: number; y: number; width: number; height: number } {
  const left = obj.left ?? 0
  const top = obj.top ?? 0

  // Width/height are BASE dimensions in Fabric.js - NOT affected by canvas scale
  // Only apply object's local scale (scaleX/scaleY from user resize)
  const pdfWidth = (obj.width ?? 0) * (obj.scaleX ?? 1)
  const pdfHeight = (obj.height ?? 0) * (obj.scaleY ?? 1)

  // Convert position from canvas coords to PDF points
  // left/top ARE affected by canvas scale, so divide by scale
  const pdfX = left / ctx.canvasScale

  // Apply CropBox offset
  const x = pdfX + ctx.cropBoxOffsetX

  // Flip Y axis: PDF origin is bottom-left
  const pdfTop = top / ctx.canvasScale
  const y = ctx.cropBoxOffsetY + (ctx.pageHeight - pdfTop - pdfHeight)

  return { x, y, width: pdfWidth, height: pdfHeight }
}

// This should match the implementation in base.ts
function transformPathPoint(
  point: { x: number; y: number },
  pathOffset: { left: number; top: number },
  pathScale: { scaleX: number; scaleY: number },
  ctx: SaveContext
): { x: number; y: number } {
  // Apply path's local scale (user resize)
  const scaledX = point.x * pathScale.scaleX
  const scaledY = point.y * pathScale.scaleY

  // pathOffset.left/top are in CANVAS coordinates - divide by canvasScale
  const pdfX = (pathOffset.left / ctx.canvasScale) + scaledX
  const pdfY = (pathOffset.top / ctx.canvasScale) + scaledY

  // Apply CropBox offset and flip Y axis
  const x = pdfX + ctx.cropBoxOffsetX
  const y = ctx.cropBoxOffsetY + (ctx.pageHeight - pdfY)

  return { x, y }
}

// Text Y calculation (from text-renderer.ts)
function calculateTextY(
  obj: { top?: number; fontSize?: number; scaleY?: number },
  ctx: SaveContext
): number {
  const pdfTop = (obj.top ?? 0) / ctx.canvasScale
  const pdfFontSize = (obj.fontSize ?? 16) * (obj.scaleY ?? 1)
  const y = ctx.cropBoxOffsetY + (ctx.pageHeight - pdfTop - pdfFontSize)
  return y
}

describe('Coordinate Transformation', () => {
  let baseContext: SaveContext

  beforeEach(() => {
    // Standard US Letter page (612 x 792 points)
    baseContext = {
      pageHeight: 792,
      pageWidth: 612,
      canvasScale: 1,
      cropBoxOffsetX: 0,
      cropBoxOffsetY: 0,
    }
  })

  describe('transformCoordinates', () => {
    describe('Basic Transformations', () => {
      it('should correctly transform coordinates at scale 1', () => {
        const obj: FabricObject = {
          left: 100,
          top: 100,
          width: 200,
          height: 150,
        }

        const result = transformCoordinates(obj, baseContext)

        expect(result.x).toBe(100)
        expect(result.width).toBe(200)
        expect(result.height).toBe(150)
        // Y should be flipped: pageHeight - top - height = 792 - 100 - 150 = 542
        expect(result.y).toBe(542)
      })

      it('should handle zero coordinates', () => {
        const obj: FabricObject = {
          left: 0,
          top: 0,
          width: 100,
          height: 100,
        }

        const result = transformCoordinates(obj, baseContext)

        expect(result.x).toBe(0)
        expect(result.width).toBe(100)
        expect(result.height).toBe(100)
        expect(result.y).toBe(692) // 792 - 0 - 100
      })
    })

    describe('Canvas Scale Independence for Dimensions', () => {
      it('should NOT scale width/height by canvasScale', () => {
        const obj: FabricObject = {
          left: 150, // canvas coordinate
          top: 150,  // canvas coordinate
          width: 100, // base dimension - should NOT be affected by canvas scale
          height: 80, // base dimension - should NOT be affected by canvas scale
        }

        // At scale 1.5
        const ctx15 = { ...baseContext, canvasScale: 1.5 }
        const result15 = transformCoordinates(obj, ctx15)

        // Width and height should stay the same regardless of canvas scale
        expect(result15.width).toBe(100)
        expect(result15.height).toBe(80)

        // Position should be divided by scale
        expect(result15.x).toBe(100) // 150 / 1.5 = 100

        // At scale 2.0
        const ctx20 = { ...baseContext, canvasScale: 2.0 }
        const result20 = transformCoordinates(obj, ctx20)

        // Width and height should still be the same
        expect(result20.width).toBe(100)
        expect(result20.height).toBe(80)

        // Position changes with scale
        expect(result20.x).toBe(75) // 150 / 2.0 = 75
      })

      it('should handle various canvas scales correctly', () => {
        const obj: FabricObject = {
          left: 300,
          top: 300,
          width: 50,
          height: 50,
        }

        const scales = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0]

        for (const scale of scales) {
          const ctx = { ...baseContext, canvasScale: scale }
          const result = transformCoordinates(obj, ctx)

          // Dimensions should NEVER change with scale
          expect(result.width).toBe(50)
          expect(result.height).toBe(50)

          // Position should be inversely proportional to scale
          expect(result.x).toBeCloseTo(300 / scale, 5)
        }
      })
    })

    describe('Object Scale (User Resize)', () => {
      it('should apply scaleX/scaleY to dimensions', () => {
        const obj: FabricObject = {
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          scaleX: 2, // User doubled the width
          scaleY: 0.5, // User halved the height
        }

        const result = transformCoordinates(obj, baseContext)

        expect(result.width).toBe(200) // 100 * 2
        expect(result.height).toBe(50) // 100 * 0.5
      })

      it('should NOT confuse canvas scale with object scale', () => {
        const obj: FabricObject = {
          left: 150,
          top: 150,
          width: 100,
          height: 100,
          scaleX: 1.5, // User resize
          scaleY: 1.5, // User resize
        }

        const ctx = { ...baseContext, canvasScale: 2.0 } // Canvas zoom
        const result = transformCoordinates(obj, ctx)

        // Dimensions should only reflect object scale, NOT canvas scale
        expect(result.width).toBe(150) // 100 * 1.5 (object scale only)
        expect(result.height).toBe(150) // 100 * 1.5 (object scale only)

        // Position should be affected by canvas scale
        expect(result.x).toBe(75) // 150 / 2.0
      })
    })

    describe('CropBox Offset', () => {
      it('should apply CropBox offset to coordinates', () => {
        const obj: FabricObject = {
          left: 100,
          top: 100,
          width: 50,
          height: 50,
        }

        const ctx = {
          ...baseContext,
          cropBoxOffsetX: 36, // 0.5 inch margin
          cropBoxOffsetY: 36,
        }

        const result = transformCoordinates(obj, ctx)

        expect(result.x).toBe(136) // 100 + 36
        // Y calculation includes cropBoxOffsetY
        expect(result.y).toBe(678) // 36 + (792 - 100 - 50)
      })
    })

    describe('Edge Cases', () => {
      it('should handle undefined/missing properties', () => {
        const obj: FabricObject = {} // All properties undefined

        const result = transformCoordinates(obj, baseContext)

        expect(result.x).toBe(0)
        expect(result.y).toBe(792) // pageHeight - 0 - 0
        expect(result.width).toBe(0)
        expect(result.height).toBe(0)
      })

      it('should handle very small canvas scales', () => {
        const obj: FabricObject = {
          left: 10,
          top: 10,
          width: 100,
          height: 100,
        }

        const ctx = { ...baseContext, canvasScale: 0.1 }
        const result = transformCoordinates(obj, ctx)

        expect(result.x).toBe(100) // 10 / 0.1
        expect(result.width).toBe(100) // NOT divided by scale
        expect(result.height).toBe(100) // NOT divided by scale
      })

      it('should handle very large canvas scales', () => {
        const obj: FabricObject = {
          left: 1000,
          top: 1000,
          width: 100,
          height: 100,
        }

        const ctx = { ...baseContext, canvasScale: 10 }
        const result = transformCoordinates(obj, ctx)

        expect(result.x).toBe(100) // 1000 / 10
        expect(result.width).toBe(100) // NOT divided by scale
        expect(result.height).toBe(100) // NOT divided by scale
      })

      it('should handle coordinates at page boundaries', () => {
        const obj: FabricObject = {
          left: 612, // At right edge
          top: 792, // At bottom edge
          width: 10,
          height: 10,
        }

        const result = transformCoordinates(obj, baseContext)

        expect(result.x).toBe(612)
        expect(result.y).toBe(-10) // Object extends below page
      })
    })
  })

  describe('transformPathPoint', () => {
    describe('Basic Path Point Transformation', () => {
      it('should transform path points correctly at scale 1', () => {
        const point = { x: 50, y: 50 }
        const pathOffset = { left: 100, top: 100 }
        const pathScale = { scaleX: 1, scaleY: 1 }

        const result = transformPathPoint(point, pathOffset, pathScale, baseContext)

        expect(result.x).toBe(150) // 100 + 50
        expect(result.y).toBe(642) // 792 - (100 + 50)
      })
    })

    describe('Canvas Scale Independence for Path Points', () => {
      it('should only apply canvas scale to pathOffset, not point coordinates', () => {
        const point = { x: 50, y: 50 } // Local path coordinate
        const pathOffset = { left: 150, top: 150 } // Canvas coordinate
        const pathScale = { scaleX: 1, scaleY: 1 }

        const ctx = { ...baseContext, canvasScale: 1.5 }
        const result = transformPathPoint(point, pathOffset, pathScale, ctx)

        // pathOffset.left (150) / canvasScale (1.5) = 100
        // Then add point.x (50) = 150
        expect(result.x).toBe(150)

        // pathOffset.top (150) / canvasScale (1.5) = 100
        // Then add point.y (50) = 150
        // Y flip: 792 - 150 = 642
        expect(result.y).toBe(642)
      })

      it('should maintain consistent point relative positions across scales', () => {
        const point = { x: 20, y: 30 }
        const pathOffset = { left: 100, top: 100 }
        const pathScale = { scaleX: 1, scaleY: 1 }

        // At different canvas scales, the relative position of points should be consistent
        const scales = [1.0, 1.5, 2.0]
        const results = scales.map(scale => {
          const ctx = { ...baseContext, canvasScale: scale }
          return transformPathPoint(point,
            { left: pathOffset.left * scale, top: pathOffset.top * scale }, // Same visual position
            pathScale, ctx)
        })

        // All results should have the same X and Y
        for (let i = 1; i < results.length; i++) {
          expect(results[i].x).toBeCloseTo(results[0].x, 5)
          expect(results[i].y).toBeCloseTo(results[0].y, 5)
        }
      })
    })

    describe('Path Scale (User Resize)', () => {
      it('should apply path scale to point coordinates', () => {
        const point = { x: 50, y: 50 }
        const pathOffset = { left: 100, top: 100 }
        const pathScale = { scaleX: 2, scaleY: 2 }

        const result = transformPathPoint(point, pathOffset, pathScale, baseContext)

        // Point is scaled: 50 * 2 = 100
        // Then added to offset: 100 + 100 = 200
        expect(result.x).toBe(200)
      })
    })
  })

  describe('calculateTextY', () => {
    describe('Font Size Independence from Canvas Scale', () => {
      it('should NOT divide fontSize by canvasScale', () => {
        const textObj = {
          top: 150,
          fontSize: 24,
          scaleY: 1,
        }

        const ctx15 = { ...baseContext, canvasScale: 1.5 }
        const result15 = calculateTextY(textObj, ctx15)

        const ctx20 = { ...baseContext, canvasScale: 2.0 }
        const result20 = calculateTextY(textObj, ctx20)

        // The difference in Y should ONLY come from the top position division
        // NOT from fontSize being divided differently
        // Note: Y axis is flipped, so the difference is negated
        const expectedDiff = (150 / 2.0) - (150 / 1.5) // Flipped: larger scale = smaller pdfTop = larger y
        const actualDiff = result15 - result20

        expect(actualDiff).toBeCloseTo(expectedDiff, 5)

        // More importantly: fontSize should be the same in both calculations
        // Both should use fontSize=24, not fontSize/scale
        // result15 = 792 - (150/1.5) - 24 = 792 - 100 - 24 = 668
        // result20 = 792 - (150/2.0) - 24 = 792 - 75 - 24 = 693
        expect(result15).toBe(668)
        expect(result20).toBe(693)
      })

      it('should correctly apply scaleY to fontSize', () => {
        const textObj = {
          top: 100,
          fontSize: 20,
          scaleY: 2, // User doubled the text size
        }

        const result = calculateTextY(textObj, baseContext)

        // Effective font size is 20 * 2 = 40
        // Y = pageHeight - top - fontSize = 792 - 100 - 40 = 652
        expect(result).toBe(652)
      })
    })
  })

  describe('Integration: Scale Consistency', () => {
    it('should produce consistent PDF coordinates regardless of canvas zoom', () => {
      // This test simulates the same visual element at different zoom levels
      // The resulting PDF coordinates should be identical

      const baseObj: FabricObject = {
        left: 100,
        top: 100,
        width: 200,
        height: 100,
      }

      // At scale 1, the object is at canvas position (100, 100)
      const ctx1 = { ...baseContext, canvasScale: 1 }
      const result1 = transformCoordinates(baseObj, ctx1)

      // At scale 2, the same PDF position would be at canvas position (200, 200)
      const objAtScale2: FabricObject = {
        left: 200, // 100 * 2
        top: 200,  // 100 * 2
        width: 200, // Base dimension - unchanged
        height: 100, // Base dimension - unchanged
      }
      const ctx2 = { ...baseContext, canvasScale: 2 }
      const result2 = transformCoordinates(objAtScale2, ctx2)

      // Both should produce the same PDF coordinates
      expect(result1.x).toBe(result2.x)
      expect(result1.y).toBe(result2.y)
      expect(result1.width).toBe(result2.width)
      expect(result1.height).toBe(result2.height)
    })

    it('should maintain aspect ratio across zoom levels', () => {
      const obj: FabricObject = {
        left: 100,
        top: 100,
        width: 200,
        height: 100,
        scaleX: 1.5,
        scaleY: 1.5,
      }

      const scales = [0.5, 1.0, 1.5, 2.0, 3.0]
      const results: Array<{ width: number; height: number }> = []

      for (const scale of scales) {
        // Adjust canvas position for zoom, but keep base dimensions
        const adjustedObj = {
          ...obj,
          left: obj.left! * scale,
          top: obj.top! * scale,
        }
        const ctx = { ...baseContext, canvasScale: scale }
        results.push(transformCoordinates(adjustedObj, ctx))
      }

      // All results should have identical width and height
      const expectedWidth = 200 * 1.5 // width * scaleX
      const expectedHeight = 100 * 1.5 // height * scaleY

      for (const result of results) {
        expect(result.width).toBe(expectedWidth)
        expect(result.height).toBe(expectedHeight)
      }
    })
  })

  describe('Actual Implementation Verification', () => {
    // Create a concrete subclass to access protected methods
    class TestableRenderer extends BaseRenderer {
      canRender(): boolean { return true }
      async render(): Promise<void> {}

      // Expose protected methods for testing
      public testTransformCoordinates(obj: ActualFabricObject, ctx: ActualSaveContext) {
        return this.transformCoordinates(obj, ctx)
      }

      public testTransformPathPoint(
        point: { x: number; y: number },
        pathOffset: { left: number; top: number },
        pathScale: { scaleX: number; scaleY: number },
        ctx: ActualSaveContext
      ) {
        return this.transformPathPoint(point, pathOffset, pathScale, ctx)
      }
    }

    const renderer = new TestableRenderer()

    it('actual transformCoordinates should match expected behavior', () => {
      const obj: ActualFabricObject = {
        left: 150,
        top: 150,
        width: 100,
        height: 80,
        scaleX: 1,
        scaleY: 1,
      }

      const ctx = {
        pageHeight: 792,
        pageWidth: 612,
        canvasScale: 1.5,
        cropBoxOffsetX: 0,
        cropBoxOffsetY: 0,
        errors: [],
        warnings: [],
      } as unknown as ActualSaveContext

      const result = renderer.testTransformCoordinates(obj, ctx)

      // Position should be divided by scale
      expect(result.x).toBe(100) // 150 / 1.5

      // Dimensions should NOT be divided by scale
      expect(result.width).toBe(100)
      expect(result.height).toBe(80)
    })

    it('actual transformPathPoint should match expected behavior', () => {
      const point = { x: 50, y: 50 }
      const pathOffset = { left: 150, top: 150 }
      const pathScale = { scaleX: 1, scaleY: 1 }

      const ctx = {
        pageHeight: 792,
        pageWidth: 612,
        canvasScale: 1.5,
        cropBoxOffsetX: 0,
        cropBoxOffsetY: 0,
        errors: [],
        warnings: [],
      } as unknown as ActualSaveContext

      const result = renderer.testTransformPathPoint(point, pathOffset, pathScale, ctx)

      // pathOffset.left / canvasScale + point.x = 150/1.5 + 50 = 100 + 50 = 150
      expect(result.x).toBe(150)
    })
  })

  describe('Real-World Scenarios', () => {
    it('should correctly transform a text box added at 150% zoom', () => {
      // User added a text box at 150% zoom
      // Canvas coordinates: left=300, top=300 (appears at PDF position 200, 200)
      // Font size: 24 (not affected by zoom)
      const textObj = {
        left: 300,
        top: 300,
        width: 150, // Base width
        height: 30, // Base height
        fontSize: 24,
        scaleX: 1,
        scaleY: 1,
      }

      const ctx = { ...baseContext, canvasScale: 1.5 }
      const result = transformCoordinates(textObj, ctx)

      expect(result.x).toBe(200) // 300 / 1.5
      expect(result.width).toBe(150) // NOT divided by scale
      expect(result.height).toBe(30) // NOT divided by scale
    })

    it('should correctly transform an image resized by user at 200% zoom', () => {
      // User placed an image at 200% zoom and resized it
      const imageObj: FabricObject = {
        left: 400, // Canvas X at 200% zoom -> PDF X = 200
        top: 200,  // Canvas Y at 200% zoom -> PDF Y after flip
        width: 300, // Original image width
        height: 200, // Original image height
        scaleX: 0.5, // User shrunk width to 50%
        scaleY: 0.5, // User shrunk height to 50%
      }

      const ctx = { ...baseContext, canvasScale: 2.0 }
      const result = transformCoordinates(imageObj, ctx)

      expect(result.x).toBe(200) // 400 / 2
      expect(result.width).toBe(150) // 300 * 0.5
      expect(result.height).toBe(100) // 200 * 0.5
    })

    it('should correctly transform a freehand path drawn at 75% zoom', () => {
      // User drew a path at 75% zoom
      // Path origin at canvas (75, 75) -> PDF (100, 100)
      const pathOffset = { left: 75, top: 75 }
      const pathScale = { scaleX: 1, scaleY: 1 }

      // A point 50 units to the right and down from path origin
      const point = { x: 50, y: 50 }

      const ctx = { ...baseContext, canvasScale: 0.75 }
      const result = transformPathPoint(point, pathOffset, pathScale, ctx)

      // pathOffset.left / scale = 75 / 0.75 = 100
      // Then add point.x = 100 + 50 = 150
      expect(result.x).toBe(150)
    })
  })
})
