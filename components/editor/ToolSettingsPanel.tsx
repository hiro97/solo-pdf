"use client"

import { useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ToolType, ToolSettings } from './types'

interface ToolSettingsPanelProps {
  activeTool: ToolType
  settings: ToolSettings
  onSettingsChange: (settings: ToolSettings) => void
}

const FONT_FAMILIES = [
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times-Roman', label: 'Times Roman' },
  { value: 'Courier', label: 'Courier' },
  { value: 'Arial', label: 'Arial' },
]

const PRESET_COLORS = [
  '#000000', // Black
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
]

export function ToolSettingsPanel({
  activeTool,
  settings,
  onSettingsChange,
}: ToolSettingsPanelProps) {
  // Update a single setting
  const updateSetting = useCallback(
    <K extends keyof ToolSettings>(key: K, value: ToolSettings[K]) => {
      onSettingsChange({ ...settings, [key]: value })
    },
    [settings, onSettingsChange]
  )

  // Don't show settings for select or signature tools
  if (activeTool === 'select' || activeTool === 'signature') {
    return null
  }

  return (
    <div className="flex items-center gap-4 px-3 py-2 bg-muted/30 border-b">
      {/* Color picker - shown for draw, text, rectangle, highlighter */}
      {['draw', 'text', 'rectangle', 'highlighter', 'circle', 'line', 'arrow'].includes(activeTool) && (
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Color</Label>
          <div className="flex gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => updateSetting('color', color)}
                className={`w-6 h-6 rounded border-2 transition-all ${
                  settings.color === color
                    ? 'border-primary scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {/* Custom color input */}
            <input
              type="color"
              value={settings.color}
              onChange={(e) => updateSetting('color', e.target.value)}
              className="w-6 h-6 rounded border cursor-pointer"
              title="Custom color"
            />
          </div>
        </div>
      )}

      {/* Stroke width - shown for draw, rectangle, highlighter */}
      {['draw', 'rectangle', 'highlighter', 'circle', 'line', 'arrow'].includes(activeTool) && (
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">
            Stroke
          </Label>
          <Slider
            value={[settings.strokeWidth]}
            onValueChange={([value]) => updateSetting('strokeWidth', value)}
            min={1}
            max={10}
            step={1}
            className="w-24"
          />
          <span className="text-xs text-muted-foreground w-4">
            {settings.strokeWidth}
          </span>
        </div>
      )}

      {/* Font size - shown for text tool */}
      {activeTool === 'text' && (
        <>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">
              Size
            </Label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => updateSetting('fontSize', value)}
              min={8}
              max={72}
              step={2}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground w-6">
              {settings.fontSize}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Font</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) => updateSetting('fontFamily', value)}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Redact tool has no settings - uses black fill */}
      {activeTool === 'redact' && (
        <span className="text-xs text-muted-foreground">
          Click and drag to redact areas (black fill)
        </span>
      )}
    </div>
  )
}
