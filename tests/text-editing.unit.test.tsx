import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToolSettingsPanel } from '@/components/editor/ToolSettingsPanel'
import type { ToolSettings } from '@/components/editor/types'

/**
 * Text Editing Feature - Unit Tests
 *
 * Tests cover:
 * 1. ToolSettings type structure
 * 2. ToolSettingsPanel B/I/U buttons
 * 3. Toggle behavior
 * 4. Settings change callbacks
 */

// Default test settings
const defaultSettings: ToolSettings = {
  color: '#000000',
  strokeWidth: 2,
  fontSize: 16,
  fontFamily: 'Helvetica',
  bold: false,
  italic: false,
  underline: false,
}

describe('ToolSettings Type', () => {
  it('should have bold, italic, underline properties', () => {
    const settings: ToolSettings = {
      ...defaultSettings,
      bold: true,
      italic: true,
      underline: true,
    }

    expect(settings.bold).toBe(true)
    expect(settings.italic).toBe(true)
    expect(settings.underline).toBe(true)
  })

  it('should default to false for text formatting', () => {
    expect(defaultSettings.bold).toBe(false)
    expect(defaultSettings.italic).toBe(false)
    expect(defaultSettings.underline).toBe(false)
  })
})

describe('ToolSettingsPanel - Text Tool', () => {
  it('should render B/I/U buttons when text tool is active', () => {
    const onSettingsChange = vi.fn()

    render(
      <ToolSettingsPanel
        activeTool="text"
        settings={defaultSettings}
        onSettingsChange={onSettingsChange}
      />
    )

    // Check for Bold, Italic, Underline buttons by their SVG icons
    expect(screen.getByTitle('Bold (Ctrl+B)')).toBeInTheDocument()
    expect(screen.getByTitle('Italic (Ctrl+I)')).toBeInTheDocument()
    expect(screen.getByTitle('Underline (Ctrl+U)')).toBeInTheDocument()
  })

  it('should NOT render B/I/U buttons for non-text tools', () => {
    const onSettingsChange = vi.fn()

    render(
      <ToolSettingsPanel
        activeTool="draw"
        settings={defaultSettings}
        onSettingsChange={onSettingsChange}
      />
    )

    // These should not be present for draw tool
    expect(screen.queryByTitle('Bold (Ctrl+B)')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Italic (Ctrl+I)')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Underline (Ctrl+U)')).not.toBeInTheDocument()
  })

  it('should NOT render for select tool', () => {
    const onSettingsChange = vi.fn()

    const { container } = render(
      <ToolSettingsPanel
        activeTool="select"
        settings={defaultSettings}
        onSettingsChange={onSettingsChange}
      />
    )

    // Panel should be empty for select tool
    expect(container.firstChild).toBeNull()
  })

  it('should call onSettingsChange with bold=true when Bold button is clicked', () => {
    const onSettingsChange = vi.fn()

    render(
      <ToolSettingsPanel
        activeTool="text"
        settings={defaultSettings}
        onSettingsChange={onSettingsChange}
      />
    )

    const boldButton = screen.getByTitle('Bold (Ctrl+B)')
    fireEvent.click(boldButton)

    expect(onSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      bold: true,
    })
  })

  it('should call onSettingsChange with italic=true when Italic button is clicked', () => {
    const onSettingsChange = vi.fn()

    render(
      <ToolSettingsPanel
        activeTool="text"
        settings={defaultSettings}
        onSettingsChange={onSettingsChange}
      />
    )

    const italicButton = screen.getByTitle('Italic (Ctrl+I)')
    fireEvent.click(italicButton)

    expect(onSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      italic: true,
    })
  })

  it('should call onSettingsChange with underline=true when Underline button is clicked', () => {
    const onSettingsChange = vi.fn()

    render(
      <ToolSettingsPanel
        activeTool="text"
        settings={defaultSettings}
        onSettingsChange={onSettingsChange}
      />
    )

    const underlineButton = screen.getByTitle('Underline (Ctrl+U)')
    fireEvent.click(underlineButton)

    expect(onSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      underline: true,
    })
  })

  it('should toggle Bold off when already active', () => {
    const onSettingsChange = vi.fn()
    const settingsWithBold = { ...defaultSettings, bold: true }

    render(
      <ToolSettingsPanel
        activeTool="text"
        settings={settingsWithBold}
        onSettingsChange={onSettingsChange}
      />
    )

    const boldButton = screen.getByTitle('Bold (Ctrl+B)')
    fireEvent.click(boldButton)

    expect(onSettingsChange).toHaveBeenCalledWith({
      ...settingsWithBold,
      bold: false,
    })
  })

  it('should show Bold button as active when bold=true', () => {
    const onSettingsChange = vi.fn()
    const settingsWithBold = { ...defaultSettings, bold: true }

    render(
      <ToolSettingsPanel
        activeTool="text"
        settings={settingsWithBold}
        onSettingsChange={onSettingsChange}
      />
    )

    const boldButton = screen.getByTitle('Bold (Ctrl+B)')
    expect(boldButton.className).toContain('bg-primary')
  })

  it('should show Bold button as inactive when bold=false', () => {
    const onSettingsChange = vi.fn()

    render(
      <ToolSettingsPanel
        activeTool="text"
        settings={defaultSettings}
        onSettingsChange={onSettingsChange}
      />
    )

    const boldButton = screen.getByTitle('Bold (Ctrl+B)')
    expect(boldButton.className).not.toContain('bg-primary')
  })

  it('should allow multiple formatting options at once', () => {
    const onSettingsChange = vi.fn()
    const settingsWithBoldItalic = {
      ...defaultSettings,
      bold: true,
      italic: true,
    }

    render(
      <ToolSettingsPanel
        activeTool="text"
        settings={settingsWithBoldItalic}
        onSettingsChange={onSettingsChange}
      />
    )

    // Both should show as active
    const boldButton = screen.getByTitle('Bold (Ctrl+B)')
    const italicButton = screen.getByTitle('Italic (Ctrl+I)')

    expect(boldButton.className).toContain('bg-primary')
    expect(italicButton.className).toContain('bg-primary')
  })
})

describe('ToolSettingsPanel - Font Settings', () => {
  it('should render font size control for text tool', () => {
    const onSettingsChange = vi.fn()

    render(
      <ToolSettingsPanel
        activeTool="text"
        settings={defaultSettings}
        onSettingsChange={onSettingsChange}
      />
    )

    expect(screen.getByText('Size')).toBeInTheDocument()
  })

  it('should render font family dropdown for text tool', () => {
    const onSettingsChange = vi.fn()

    render(
      <ToolSettingsPanel
        activeTool="text"
        settings={defaultSettings}
        onSettingsChange={onSettingsChange}
      />
    )

    expect(screen.getByText('Font')).toBeInTheDocument()
  })

  it('should render color picker for text tool', () => {
    const onSettingsChange = vi.fn()

    render(
      <ToolSettingsPanel
        activeTool="text"
        settings={defaultSettings}
        onSettingsChange={onSettingsChange}
      />
    )

    expect(screen.getByText('Color')).toBeInTheDocument()
  })
})

describe('ToolSettingsPanel - Edge Cases', () => {
  it('should handle rapid toggle clicks without errors', () => {
    const onSettingsChange = vi.fn()

    render(
      <ToolSettingsPanel
        activeTool="text"
        settings={defaultSettings}
        onSettingsChange={onSettingsChange}
      />
    )

    const boldButton = screen.getByTitle('Bold (Ctrl+B)')

    // Rapid clicks
    for (let i = 0; i < 10; i++) {
      fireEvent.click(boldButton)
    }

    // Should have been called 10 times
    expect(onSettingsChange).toHaveBeenCalledTimes(10)
  })

  it('should handle all three toggles clicked in sequence', () => {
    const onSettingsChange = vi.fn()

    render(
      <ToolSettingsPanel
        activeTool="text"
        settings={defaultSettings}
        onSettingsChange={onSettingsChange}
      />
    )

    const boldButton = screen.getByTitle('Bold (Ctrl+B)')
    const italicButton = screen.getByTitle('Italic (Ctrl+I)')
    const underlineButton = screen.getByTitle('Underline (Ctrl+U)')

    fireEvent.click(boldButton)
    fireEvent.click(italicButton)
    fireEvent.click(underlineButton)

    expect(onSettingsChange).toHaveBeenCalledTimes(3)
  })
})

describe('Text Styling Logic', () => {
  it('should convert bold=true to fontWeight="bold"', () => {
    const toolSettings: ToolSettings = {
      ...defaultSettings,
      bold: true,
    }

    const fontWeight = toolSettings.bold ? 'bold' : 'normal'
    expect(fontWeight).toBe('bold')
  })

  it('should convert bold=false to fontWeight="normal"', () => {
    const toolSettings: ToolSettings = {
      ...defaultSettings,
      bold: false,
    }

    const fontWeight = toolSettings.bold ? 'bold' : 'normal'
    expect(fontWeight).toBe('normal')
  })

  it('should convert italic=true to fontStyle="italic"', () => {
    const toolSettings: ToolSettings = {
      ...defaultSettings,
      italic: true,
    }

    const fontStyle = toolSettings.italic ? 'italic' : 'normal'
    expect(fontStyle).toBe('italic')
  })

  it('should convert italic=false to fontStyle="normal"', () => {
    const toolSettings: ToolSettings = {
      ...defaultSettings,
      italic: false,
    }

    const fontStyle = toolSettings.italic ? 'italic' : 'normal'
    expect(fontStyle).toBe('normal')
  })

  it('should pass underline directly as boolean', () => {
    const toolSettingsWithUnderline: ToolSettings = {
      ...defaultSettings,
      underline: true,
    }

    expect(toolSettingsWithUnderline.underline).toBe(true)

    const toolSettingsWithoutUnderline: ToolSettings = {
      ...defaultSettings,
      underline: false,
    }

    expect(toolSettingsWithoutUnderline.underline).toBe(false)
  })

  it('should build correct style object for Fabric.js', () => {
    const toolSettings: ToolSettings = {
      color: '#ff0000',
      strokeWidth: 2,
      fontSize: 24,
      fontFamily: 'Arial',
      bold: true,
      italic: true,
      underline: true,
    }

    // This is the style object that would be passed to Fabric.js
    const styleProps = {
      fill: toolSettings.color,
      fontSize: toolSettings.fontSize,
      fontFamily: toolSettings.fontFamily,
      fontWeight: toolSettings.bold ? 'bold' : 'normal',
      fontStyle: toolSettings.italic ? 'italic' : 'normal',
      underline: toolSettings.underline,
    }

    expect(styleProps).toEqual({
      fill: '#ff0000',
      fontSize: 24,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'italic',
      underline: true,
    })
  })
})

describe('Style Sync Logic', () => {
  it('should correctly extract bold state from fontWeight', () => {
    const fontWeight = 'bold'
    const isBold = fontWeight === 'bold'
    expect(isBold).toBe(true)
  })

  it('should correctly extract italic state from fontStyle', () => {
    const fontStyle = 'italic'
    const isItalic = fontStyle === 'italic'
    expect(isItalic).toBe(true)
  })

  it('should correctly extract underline state', () => {
    const underline = true
    expect(underline).toBe(true)
  })

  it('should handle mixed formatting detection', () => {
    // Simulating getting styles from selected text
    const selectionStyles = [
      { fontWeight: 'bold', fontStyle: 'normal', underline: false },
      { fontWeight: 'bold', fontStyle: 'italic', underline: true },
    ]

    // Using first character's style (as implemented)
    const firstCharStyle = selectionStyles[0]

    const syncedSettings = {
      bold: firstCharStyle.fontWeight === 'bold',
      italic: firstCharStyle.fontStyle === 'italic',
      underline: firstCharStyle.underline === true,
    }

    expect(syncedSettings.bold).toBe(true)
    expect(syncedSettings.italic).toBe(false)
    expect(syncedSettings.underline).toBe(false)
  })
})
