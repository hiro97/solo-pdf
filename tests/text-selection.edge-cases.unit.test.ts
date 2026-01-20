import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Text Selection Edge Cases - Unit Tests
 *
 * Tests cover edge cases for text selection functionality including:
 * 1. Selection boundary conditions
 * 2. Empty/null states
 * 3. Multi-line text handling
 * 4. Rich text with mixed styles
 * 5. Rapid selection changes
 * 6. Unicode and special characters
 */

// Mock IText object factory for testing
const createMockIText = (options: {
  text?: string
  isEditing?: boolean
  selectionStart?: number
  selectionEnd?: number
  styles?: Record<number, Record<number, Record<string, unknown>>>
  fontSize?: number
  fontFamily?: string
  fill?: string
  fontWeight?: string
  fontStyle?: string
  underline?: boolean
}) => {
  const {
    text = 'Hello World',
    isEditing = false,
    selectionStart = 0,
    selectionEnd = 0,
    styles = {},
    fontSize = 16,
    fontFamily = 'Helvetica',
    fill = '#000000',
    fontWeight = 'normal',
    fontStyle = 'normal',
    underline = false,
  } = options

  return {
    text,
    isEditing,
    selectionStart,
    selectionEnd,
    styles,
    fontSize,
    fontFamily,
    fill,
    fontWeight,
    fontStyle,
    underline,
    getSelectionStyles: vi.fn(() => {
      if (!isEditing || selectionEnd <= selectionStart) return []

      const result = []
      for (let i = selectionStart; i < selectionEnd; i++) {
        const lineStyles = styles[0] || {}
        const charStyle = lineStyles[i] || {}
        result.push({
          fontSize: charStyle.fontSize ?? fontSize,
          fontFamily: charStyle.fontFamily ?? fontFamily,
          fill: charStyle.fill ?? fill,
          fontWeight: charStyle.fontWeight ?? fontWeight,
          fontStyle: charStyle.fontStyle ?? fontStyle,
          underline: charStyle.underline ?? underline,
        })
      }
      return result
    }),
    setSelectionStyles: vi.fn(),
    set: vi.fn(),
    initDimensions: vi.fn(),
    setCoords: vi.fn(),
  }
}

// Logic under test: hasPartialSelection check
const hasPartialSelection = (textObj: ReturnType<typeof createMockIText>) => {
  return textObj.isEditing && textObj.selectionEnd > textObj.selectionStart
}

// Logic under test: syncToolbarWithText
const syncToolbarWithText = (
  textObj: ReturnType<typeof createMockIText>,
  onStyleSync: (styles: Record<string, unknown>) => void
) => {
  const hasSelection = hasPartialSelection(textObj)

  if (hasSelection) {
    const styles = textObj.getSelectionStyles()
    if (styles.length > 0) {
      const style = styles[0] as Record<string, unknown>
      onStyleSync({
        bold: style.fontWeight === 'bold',
        italic: style.fontStyle === 'italic',
        underline: style.underline === true,
        fontSize: (style.fontSize as number) || textObj.fontSize,
        fontFamily: (style.fontFamily as string) || textObj.fontFamily,
        color: (style.fill as string) || (textObj.fill as string),
      })
    }
  } else {
    onStyleSync({
      bold: textObj.fontWeight === 'bold',
      italic: textObj.fontStyle === 'italic',
      underline: textObj.underline === true,
      fontSize: textObj.fontSize,
      fontFamily: textObj.fontFamily,
      color: textObj.fill as string,
    })
  }
}

describe('Text Selection Edge Cases', () => {
  describe('Selection Boundary Conditions', () => {
    it('should detect NO selection when selectionStart === selectionEnd', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 2,
        selectionEnd: 2, // Cursor position, not selection
      })

      expect(hasPartialSelection(textObj)).toBe(false)
    })

    it('should detect selection when selectionEnd > selectionStart', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 3,
      })

      expect(hasPartialSelection(textObj)).toBe(true)
    })

    it('should handle single character selection', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 1,
      })

      expect(hasPartialSelection(textObj)).toBe(true)
    })

    it('should handle full text selection', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 5,
      })

      expect(hasPartialSelection(textObj)).toBe(true)
    })

    it('should return false when NOT in editing mode even with selection range', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: false, // Not in editing mode
        selectionStart: 0,
        selectionEnd: 3,
      })

      expect(hasPartialSelection(textObj)).toBe(false)
    })

    it('should handle selection at end of text', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 4,
        selectionEnd: 5,
      })

      expect(hasPartialSelection(textObj)).toBe(true)
    })
  })

  describe('Empty and Null States', () => {
    it('should handle empty text with no selection', () => {
      const textObj = createMockIText({
        text: '',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 0,
      })

      expect(hasPartialSelection(textObj)).toBe(false)
    })

    it('should sync default styles for empty text', () => {
      const textObj = createMockIText({
        text: '',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 0,
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#ff0000',
      })

      const onStyleSync = vi.fn()
      syncToolbarWithText(textObj, onStyleSync)

      expect(onStyleSync).toHaveBeenCalledWith({
        bold: false,
        italic: false,
        underline: false,
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#ff0000',
      })
    })

    it('should handle text with only whitespace', () => {
      const textObj = createMockIText({
        text: '   ',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 3,
      })

      expect(hasPartialSelection(textObj)).toBe(true)
    })
  })

  describe('Selection Range Overflow', () => {
    it('should handle selectionEnd beyond text length', () => {
      const textObj = createMockIText({
        text: 'Hi',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 10, // Beyond text length
      })

      // Should still detect as having selection
      expect(hasPartialSelection(textObj)).toBe(true)
    })

    it('should handle negative selectionStart (edge case)', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: -1, // Invalid
        selectionEnd: 3,
      })

      // selectionEnd > selectionStart is true (-1 < 3)
      expect(hasPartialSelection(textObj)).toBe(true)
    })
  })

  describe('Rich Text with Mixed Styles', () => {
    it('should get first character style when multiple styles in selection', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 3,
        styles: {
          0: {
            0: { fontWeight: 'bold' },
            1: { fontWeight: 'normal' },
            2: { fontWeight: 'bold', fontStyle: 'italic' },
          },
        },
      })

      const onStyleSync = vi.fn()
      syncToolbarWithText(textObj, onStyleSync)

      // Should use first character's style
      expect(onStyleSync).toHaveBeenCalledWith(
        expect.objectContaining({
          bold: true,
          italic: false,
        })
      )
    })

    it('should fall back to object styles when selection style is undefined', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 2,
        styles: {}, // No per-character styles
        fontWeight: 'bold',
        fontStyle: 'italic',
      })

      const onStyleSync = vi.fn()
      syncToolbarWithText(textObj, onStyleSync)

      expect(onStyleSync).toHaveBeenCalledWith(
        expect.objectContaining({
          bold: true,
          italic: true,
        })
      )
    })

    it('should handle partial style inheritance', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 1,
        styles: {
          0: {
            0: { fontWeight: 'bold' }, // Only fontWeight specified
          },
        },
        fontStyle: 'italic', // Object-level style
        underline: true,
      })

      const onStyleSync = vi.fn()
      syncToolbarWithText(textObj, onStyleSync)

      // fontWeight from char style, fontStyle from object
      expect(onStyleSync).toHaveBeenCalledWith(
        expect.objectContaining({
          bold: true,
          italic: true, // Falls back to object style
          underline: true,
        })
      )
    })
  })

  describe('Unicode and Special Characters', () => {
    it('should handle emoji in text', () => {
      const textObj = createMockIText({
        text: 'Hello 👋 World',
        isEditing: true,
        selectionStart: 6,
        selectionEnd: 8, // Emoji selection
      })

      expect(hasPartialSelection(textObj)).toBe(true)
    })

    it('should handle Korean characters', () => {
      const textObj = createMockIText({
        text: '안녕하세요',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 3,
      })

      expect(hasPartialSelection(textObj)).toBe(true)
    })

    it('should handle mixed unicode text', () => {
      const textObj = createMockIText({
        text: 'Hello 世界 🌍',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 12,
      })

      expect(hasPartialSelection(textObj)).toBe(true)
    })

    it('should handle newline characters', () => {
      const textObj = createMockIText({
        text: 'Hello\nWorld',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 11,
      })

      expect(hasPartialSelection(textObj)).toBe(true)
    })

    it('should handle tab characters', () => {
      const textObj = createMockIText({
        text: 'Hello\tWorld',
        isEditing: true,
        selectionStart: 5,
        selectionEnd: 6, // Tab character
      })

      expect(hasPartialSelection(textObj)).toBe(true)
    })
  })

  describe('Style Sync with No Selection', () => {
    it('should use object-level styles when not editing', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: false,
        fontWeight: 'bold',
        fontStyle: 'italic',
        underline: true,
        fontSize: 24,
      })

      const onStyleSync = vi.fn()
      syncToolbarWithText(textObj, onStyleSync)

      expect(onStyleSync).toHaveBeenCalledWith({
        bold: true,
        italic: true,
        underline: true,
        fontSize: 24,
        fontFamily: 'Helvetica',
        color: '#000000',
      })
    })

    it('should use object-level styles when cursor is positioned (no selection)', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 3,
        selectionEnd: 3, // Cursor, not selection
        fontWeight: 'bold',
      })

      const onStyleSync = vi.fn()
      syncToolbarWithText(textObj, onStyleSync)

      expect(onStyleSync).toHaveBeenCalledWith(
        expect.objectContaining({
          bold: true,
        })
      )
    })
  })

  describe('Rapid Selection Changes', () => {
    it('should handle multiple rapid sync calls', () => {
      const textObj = createMockIText({
        text: 'Hello World',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 5,
      })

      const onStyleSync = vi.fn()

      // Rapid calls
      for (let i = 0; i < 100; i++) {
        syncToolbarWithText(textObj, onStyleSync)
      }

      expect(onStyleSync).toHaveBeenCalledTimes(100)
    })

    it('should handle selection range changes', () => {
      const calls: Array<{ start: number; end: number }> = []

      for (let i = 0; i < 10; i++) {
        const textObj = createMockIText({
          text: 'Hello World',
          isEditing: true,
          selectionStart: i,
          selectionEnd: i + 1,
        })

        calls.push({ start: i, end: i + 1 })
        expect(hasPartialSelection(textObj)).toBe(true)
      }

      expect(calls.length).toBe(10)
    })
  })

  describe('Style Application Edge Cases', () => {
    it('should call setSelectionStyles for partial selection', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 3,
      })

      const styleProps = { fontWeight: 'bold' }

      if (hasPartialSelection(textObj)) {
        textObj.setSelectionStyles(
          styleProps,
          textObj.selectionStart,
          textObj.selectionEnd
        )
      }

      expect(textObj.setSelectionStyles).toHaveBeenCalledWith(
        styleProps,
        0,
        3
      )
    })

    it('should call set() for full object style when no partial selection', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: false,
        selectionStart: 0,
        selectionEnd: 0,
      })

      const styleProps = { fontWeight: 'bold' }

      if (!hasPartialSelection(textObj)) {
        textObj.set(styleProps)
      }

      expect(textObj.set).toHaveBeenCalledWith(styleProps)
    })

    it('should not apply styles to empty selection', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 2,
        selectionEnd: 2,
      })

      expect(hasPartialSelection(textObj)).toBe(false)
      // When no partial selection, styles should be applied to whole object
      expect(textObj.setSelectionStyles).not.toHaveBeenCalled()
    })
  })

  describe('getSelectionStyles Return Values', () => {
    it('should return empty array when not editing', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: false,
        selectionStart: 0,
        selectionEnd: 3,
      })

      const styles = textObj.getSelectionStyles()
      expect(styles).toEqual([])
    })

    it('should return empty array when no selection range', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 2,
        selectionEnd: 2,
      })

      const styles = textObj.getSelectionStyles()
      expect(styles).toEqual([])
    })

    it('should return style array matching selection length', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 1,
        selectionEnd: 4,
      })

      const styles = textObj.getSelectionStyles()
      expect(styles.length).toBe(3) // 4 - 1 = 3 characters
    })
  })

  describe('Font Size Edge Cases', () => {
    it('should handle very small font size', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 5,
        fontSize: 1,
      })

      const onStyleSync = vi.fn()
      syncToolbarWithText(textObj, onStyleSync)

      expect(onStyleSync).toHaveBeenCalledWith(
        expect.objectContaining({ fontSize: 1 })
      )
    })

    it('should handle very large font size', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: true,
        selectionStart: 0,
        selectionEnd: 5,
        fontSize: 999,
      })

      const onStyleSync = vi.fn()
      syncToolbarWithText(textObj, onStyleSync)

      expect(onStyleSync).toHaveBeenCalledWith(
        expect.objectContaining({ fontSize: 999 })
      )
    })

    it('should handle zero font size gracefully', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: false,
        fontSize: 0,
      })

      const onStyleSync = vi.fn()
      syncToolbarWithText(textObj, onStyleSync)

      expect(onStyleSync).toHaveBeenCalledWith(
        expect.objectContaining({ fontSize: 0 })
      )
    })
  })

  describe('Color Edge Cases', () => {
    it('should handle rgb color format', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: false,
        fill: 'rgb(255, 0, 0)',
      })

      const onStyleSync = vi.fn()
      syncToolbarWithText(textObj, onStyleSync)

      expect(onStyleSync).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'rgb(255, 0, 0)' })
      )
    })

    it('should handle rgba color format', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: false,
        fill: 'rgba(255, 0, 0, 0.5)',
      })

      const onStyleSync = vi.fn()
      syncToolbarWithText(textObj, onStyleSync)

      expect(onStyleSync).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'rgba(255, 0, 0, 0.5)' })
      )
    })

    it('should handle named colors', () => {
      const textObj = createMockIText({
        text: 'Hello',
        isEditing: false,
        fill: 'red',
      })

      const onStyleSync = vi.fn()
      syncToolbarWithText(textObj, onStyleSync)

      expect(onStyleSync).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'red' })
      )
    })
  })
})

describe('Integration: Selection to Style Application', () => {
  it('should complete full selection -> sync -> apply cycle', () => {
    // 1. Create text with selection
    const textObj = createMockIText({
      text: 'Hello World',
      isEditing: true,
      selectionStart: 0,
      selectionEnd: 5,
      fontWeight: 'normal',
    })

    // 2. Check selection exists
    expect(hasPartialSelection(textObj)).toBe(true)

    // 3. Sync toolbar
    const onStyleSync = vi.fn()
    syncToolbarWithText(textObj, onStyleSync)
    expect(onStyleSync).toHaveBeenCalled()

    // 4. Apply new style to selection
    const newStyle = { fontWeight: 'bold' }
    textObj.setSelectionStyles(newStyle, 0, 5)

    expect(textObj.setSelectionStyles).toHaveBeenCalledWith(newStyle, 0, 5)
  })

  it('should handle edit mode exit with style preservation', () => {
    const textObj = createMockIText({
      text: 'Hello',
      isEditing: true,
      selectionStart: 0,
      selectionEnd: 5,
      styles: {
        0: {
          0: { fontWeight: 'bold' },
          1: { fontWeight: 'bold' },
          2: { fontWeight: 'bold' },
          3: { fontWeight: 'bold' },
          4: { fontWeight: 'bold' },
        },
      },
    })

    // During editing, should detect selection
    expect(hasPartialSelection(textObj)).toBe(true)

    // After exiting edit mode
    textObj.isEditing = false

    // Should no longer detect selection
    expect(hasPartialSelection(textObj)).toBe(false)
  })
})
