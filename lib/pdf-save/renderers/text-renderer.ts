import { rgb } from 'pdf-lib'
import { BaseRenderer } from './base'
import type {
  FabricObject,
  FabricTextObject,
  TextCharStyle,
  SaveContext,
} from '../types'

/**
 * A styled text run - a sequence of characters with the same style.
 */
interface StyledTextRun {
  text: string
  style: {
    fill: string
    fontSize: number
    fontFamily: string
    bold: boolean
    italic: boolean
    underline: boolean
  }
}

/**
 * Renderer for text annotations with rich text support.
 * Handles character-level styling including bold, italic, and underline.
 */
export class TextRenderer extends BaseRenderer {
  canRender(obj: FabricObject): boolean {
    const type = this.getObjectType(obj)
    return type === 'i-text' || type === 'itext' || type === 'text' || type === 'textbox'
  }

  async render(obj: FabricObject, ctx: SaveContext, annotationId: string): Promise<void> {
    const textObj = obj as FabricTextObject

    if (!textObj.text) {
      this.addWarning(ctx, annotationId, 'text', 'Text annotation has no content.')
      return
    }

    try {
      // Get default styles from the object
      const defaultStyle = {
        fill: textObj.fill ?? '#000000',
        fontSize: textObj.fontSize ?? 16,
        fontFamily: textObj.fontFamily ?? 'Helvetica',
        bold: this.isBold(textObj.fontWeight),
        italic: textObj.fontStyle === 'italic',
        underline: textObj.underline ?? false,
      }

      // Parse text into styled runs
      const runs = this.parseStyledRuns(textObj.text, textObj.styles ?? {}, defaultStyle)

      const bounds = this.getObjectBounds(textObj)
      const baseX = (bounds.left / ctx.canvasScale) + ctx.cropBoxOffsetX
      const baseY = this.calculateTextY(bounds.top, textObj, ctx)

      // Calculate line height
      const baseFontSize = (defaultStyle.fontSize * (textObj.scaleY ?? 1)) / ctx.canvasScale
      const lineHeight = baseFontSize * (textObj.lineHeight ?? 1.2)

      // Render each run
      let currentX = baseX
      let currentY = baseY
      let currentLine = 0

      for (const run of runs) {
        // Check for line breaks
        const lines = run.text.split('\n')

        for (let i = 0; i < lines.length; i++) {
          const lineText = lines[i]

          if (i > 0) {
            // New line
            currentLine++
            currentX = baseX
            currentY -= lineHeight
          }

          if (lineText.length === 0) continue

          // Get font for this run
          const font = await ctx.fontManager.getFont(run.style.fontFamily, {
            bold: run.style.bold,
            italic: run.style.italic,
            text: lineText,
          })

          const fontSize = (run.style.fontSize * (textObj.scaleY ?? 1)) / ctx.canvasScale
          const color = this.hexToRgb(run.style.fill)

          // Draw the text
          ctx.page.drawText(lineText, {
            x: currentX,
            y: currentY,
            size: fontSize,
            font: font,
            color: rgb(color.r, color.g, color.b),
          })

          // Draw underline if needed
          if (run.style.underline) {
            const textWidth = font.widthOfTextAtSize(lineText, fontSize)
            ctx.page.drawLine({
              start: { x: currentX, y: currentY - fontSize * 0.1 },
              end: { x: currentX + textWidth, y: currentY - fontSize * 0.1 },
              thickness: fontSize / 15,
              color: rgb(color.r, color.g, color.b),
            })
          }

          // Advance X position for next run on same line
          const textWidth = font.widthOfTextAtSize(lineText, fontSize)
          currentX += textWidth
        }
      }
    } catch (error) {
      this.addError(
        ctx,
        annotationId,
        'text',
        `Failed to render text: ${error instanceof Error ? error.message : 'Unknown error'}`,
        true
      )
    }
  }

  /**
   * Calculate the Y position for text (accounting for baseline).
   */
  private calculateTextY(top: number, obj: FabricTextObject, ctx: SaveContext): number {
    const pdfTop = top / ctx.canvasScale
    const pdfFontSize = ((obj.fontSize ?? 16) * (obj.scaleY ?? 1)) / ctx.canvasScale

    // Fabric.js text origin is at top-left of text box
    // PDF text origin is at baseline (bottom of text)
    // Apply CropBox offset and flip Y axis
    const y = ctx.cropBoxOffsetY + (ctx.pageHeight - pdfTop - pdfFontSize)

    return y
  }

  /**
   * Parse text into styled runs based on character-level styles.
   */
  private parseStyledRuns(
    text: string,
    styles: Record<number, Record<number, TextCharStyle>>,
    defaultStyle: {
      fill: string
      fontSize: number
      fontFamily: string
      bold: boolean
      italic: boolean
      underline: boolean
    }
  ): StyledTextRun[] {
    const runs: StyledTextRun[] = []
    let currentRun: StyledTextRun | null = null
    let lineIndex = 0
    let charIndex = 0

    for (let i = 0; i < text.length; i++) {
      const char = text[i]

      // Get style for this character
      const charStyle = styles[lineIndex]?.[charIndex]

      // Merge with default style
      const mergedStyle = {
        fill: charStyle?.fill ?? defaultStyle.fill,
        fontSize: charStyle?.fontSize ?? defaultStyle.fontSize,
        fontFamily: charStyle?.fontFamily ?? defaultStyle.fontFamily,
        bold: this.isBold(charStyle?.fontWeight) || defaultStyle.bold,
        italic: charStyle?.fontStyle === 'italic' || defaultStyle.italic,
        underline: charStyle?.underline ?? defaultStyle.underline,
      }

      // Create a style key for comparison
      const styleKey = this.styleToKey(mergedStyle)
      const currentKey = currentRun ? this.styleToKey(currentRun.style) : null

      if (!currentRun || styleKey !== currentKey) {
        // Start a new run
        if (currentRun) {
          runs.push(currentRun)
        }
        currentRun = {
          text: char,
          style: mergedStyle,
        }
      } else {
        // Extend current run
        currentRun.text += char
      }

      // Track position in Fabric's style structure
      if (char === '\n') {
        lineIndex++
        charIndex = 0
      } else {
        charIndex++
      }
    }

    // Don't forget the last run
    if (currentRun) {
      runs.push(currentRun)
    }

    return runs
  }

  /**
   * Check if font weight indicates bold.
   */
  private isBold(fontWeight: string | number | undefined): boolean {
    if (!fontWeight) return false
    if (typeof fontWeight === 'number') return fontWeight >= 700
    return fontWeight === 'bold' || fontWeight === '700' || fontWeight === '800' || fontWeight === '900'
  }

  /**
   * Create a unique key for a style object.
   */
  private styleToKey(style: StyledTextRun['style']): string {
    return `${style.fill}-${style.fontSize}-${style.fontFamily}-${style.bold}-${style.italic}-${style.underline}`
  }
}
