import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, PDFFont, StandardFonts } from 'pdf-lib'
import type { FontManager as IFontManager } from '../types'

const FALLBACK_FONT_FAMILY = 'Nanum Gothic'
const FALLBACK_FONT_URL = '/fonts/NanumGothic-Regular.ttf'

/**
 * Manages font embedding for PDF save operations.
 * Caches embedded fonts to avoid duplicate embedding.
 */
export class FontManager implements IFontManager {
  private pdfDoc: PDFDocument
  private fontCache: Map<string, PDFFont> = new Map()
  private fallbackFont: PDFFont | null = null
  private fallbackFontPromise: Promise<PDFFont | null> | null = null

  constructor(pdfDoc: PDFDocument) {
    this.pdfDoc = pdfDoc
    try {
      this.pdfDoc.registerFontkit(fontkit)
    } catch (err) {
      console.warn('[FontManager] Failed to register fontkit:', err)
    }
  }

  /**
   * Get a font for the given family and style options.
   * Returns a cached font if available, otherwise embeds a new one.
   */
  async getFont(
    fontFamily: string,
    options: { bold?: boolean; italic?: boolean; text?: string } = {}
  ): Promise<PDFFont> {
    const { bold = false, italic = false, text } = options
    const normalizedFamily = this.normalizeFamily(fontFamily)
    const cacheKey = `${normalizedFamily}-${bold ? 'bold' : 'normal'}-${italic ? 'italic' : 'normal'}`

    if (this.fontCache.has(cacheKey)) {
      const cached = this.fontCache.get(cacheKey)!
      if (!text || this.canEncode(cached, text)) {
        return cached
      }
    }

    let font: PDFFont | null = null

    if (this.isFallbackFamily(normalizedFamily)) {
      font = await this.getFallbackFont()
    }

    if (!font) {
      font = await this.embedFont(normalizedFamily, bold, italic)
    }

    if (text && !this.canEncode(font, text)) {
      const fallback = await this.getFallbackFont()
      if (fallback && this.canEncode(fallback, text)) {
        font = fallback
      } else {
        throw new Error(`Missing font for non-Latin text. Add ${FALLBACK_FONT_URL}`)
      }
    }

    this.fontCache.set(cacheKey, font)
    return font
  }

  /**
   * Embed a font based on family and style.
   * Maps common font names to PDF standard fonts.
   */
  private async embedFont(
    fontFamily: string,
    bold: boolean,
    italic: boolean
  ): Promise<PDFFont> {
    const standardFont = this.mapToStandardFont(fontFamily, bold, italic)
    return this.pdfDoc.embedFont(standardFont)
  }

  private async getFallbackFont(): Promise<PDFFont | null> {
    if (this.fallbackFont) {
      return this.fallbackFont
    }

    if (!this.fallbackFontPromise) {
      this.fallbackFontPromise = this.loadFontFromUrl(FALLBACK_FONT_URL)
    }

    this.fallbackFont = await this.fallbackFontPromise
    return this.fallbackFont
  }

  private async loadFontFromUrl(url: string): Promise<PDFFont | null> {
    try {
      const response = await fetch(url)
      if (!response.ok) return null
      const bytes = new Uint8Array(await response.arrayBuffer())
      return await this.pdfDoc.embedFont(bytes, { subset: true })
    } catch (err) {
      console.warn('[FontManager] Failed to load fallback font:', err)
      return null
    }
  }

  /**
   * Map font family and styles to PDF standard fonts.
   * Falls back to Helvetica variants if the font is not recognized.
   */
  private mapToStandardFont(
    family: string,
    bold: boolean,
    italic: boolean
  ): StandardFonts {
    // Normalize family name
    const normalizedFamily = this.normalizeFamily(family)

    // Font family mappings
    const fontMappings: Record<string, StandardFonts[]> = {
      // Helvetica family (also handles Arial)
      helvetica: [
        StandardFonts.Helvetica,
        StandardFonts.HelveticaBold,
        StandardFonts.HelveticaOblique,
        StandardFonts.HelveticaBoldOblique,
      ],
      arial: [
        StandardFonts.Helvetica,
        StandardFonts.HelveticaBold,
        StandardFonts.HelveticaOblique,
        StandardFonts.HelveticaBoldOblique,
      ],
      // Times family
      times: [
        StandardFonts.TimesRoman,
        StandardFonts.TimesRomanBold,
        StandardFonts.TimesRomanItalic,
        StandardFonts.TimesRomanBoldItalic,
      ],
      timesnewroman: [
        StandardFonts.TimesRoman,
        StandardFonts.TimesRomanBold,
        StandardFonts.TimesRomanItalic,
        StandardFonts.TimesRomanBoldItalic,
      ],
      timesroman: [
        StandardFonts.TimesRoman,
        StandardFonts.TimesRomanBold,
        StandardFonts.TimesRomanItalic,
        StandardFonts.TimesRomanBoldItalic,
      ],
      // Courier family
      courier: [
        StandardFonts.Courier,
        StandardFonts.CourierBold,
        StandardFonts.CourierOblique,
        StandardFonts.CourierBoldOblique,
      ],
      couriernew: [
        StandardFonts.Courier,
        StandardFonts.CourierBold,
        StandardFonts.CourierOblique,
        StandardFonts.CourierBoldOblique,
      ],
    }

    // Get the font variants array, default to Helvetica
    const variants = fontMappings[normalizedFamily] || fontMappings['helvetica']

    // Calculate index based on bold/italic flags
    // [0] = regular, [1] = bold, [2] = italic, [3] = bold+italic
    const index = (bold ? 1 : 0) + (italic ? 2 : 0)
    return variants[index]
  }

  private normalizeFamily(family: string): string {
    return family.toLowerCase().replace(/[^a-z]/g, '')
  }

  private isFallbackFamily(normalizedFamily: string): boolean {
    return normalizedFamily === this.normalizeFamily(FALLBACK_FONT_FAMILY)
  }

  private canEncode(font: PDFFont, text: string): boolean {
    if (!text) return true
    try {
      ;(font as unknown as { encodeText: (value: string) => Uint8Array }).encodeText(text)
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if the font cache has any fonts embedded
   */
  get hasFonts(): boolean {
    return this.fontCache.size > 0
  }

  /**
   * Clear the font cache (mainly for testing)
   */
  clearCache(): void {
    this.fontCache.clear()
  }
}
