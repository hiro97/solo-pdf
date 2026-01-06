"use client"

import { useCallback } from 'react'
import { Bold, Italic, Underline } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ToolType, ToolSettings } from './types'

interface ToolSettingsPanelProps {
  activeTool: ToolType
  settings: ToolSettings
  onSettingsChange: (settings: ToolSettings) => void
}

const FONT_FAMILIES = [
  { value: 'Nanum Gothic', label: 'Nanum Gothic' },
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
    <div className="flex items-center gap-3 px-3 py-1.5 editor-glass-panel border-b">
      {/* Color picker - shown for draw, text, rectangle, highlighter */}
      {['draw', 'text', 'rectangle', 'highlighter', 'circle', 'line', 'arrow'].includes(activeTool) && (
        <div className="flex items-center gap-2">
          <Label className="mono-label">Color</Label>
          <div className="flex gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => updateSetting('color', color)}
                className={cn(
                  "w-5 h-5 rounded border-2 transition-all editor-transition",
                  settings.color === color
                    ? "color-picker-active"
                    : "border-transparent hover:scale-105"
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {/* Custom color input */}
            <input
              type="color"
              value={settings.color}
              onChange={(e) => updateSetting('color', e.target.value)}
              className="w-5 h-5 rounded border cursor-pointer"
              title="Custom color"
            />
          </div>
        </div>
      )}

      {/* Stroke width - shown for draw, rectangle, highlighter */}
      {['draw', 'rectangle', 'highlighter', 'circle', 'line', 'arrow'].includes(activeTool) && (
        <div className="flex items-center gap-2">
          <Label className="mono-label whitespace-nowrap">Stroke</Label>
          <Slider
            value={[settings.strokeWidth]}
            onValueChange={([value]) => updateSetting('strokeWidth', value)}
            min={1}
            max={10}
            step={1}
            className="w-20 [&_[role=slider]]:border-[hsl(var(--free))] [&_[role=slider]]:focus-visible:ring-[hsl(var(--free))]"
          />
          <span className="text-[10px] font-mono text-muted-foreground w-4">
            {settings.strokeWidth}
          </span>
        </div>
      )}

      {/* Text formatting - shown for text tool */}
      {activeTool === 'text' && (
        <>
          {/* Bold, Italic, Underline toggle buttons */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateSetting('bold', !settings.bold)}
              className={cn(
                "h-7 w-7 p-0 editor-transition",
                settings.bold && "tool-active"
              )}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateSetting('italic', !settings.italic)}
              className={cn(
                "h-7 w-7 p-0 editor-transition",
                settings.italic && "tool-active"
              )}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateSetting('underline', !settings.underline)}
              className={cn(
                "h-7 w-7 p-0 editor-transition",
                settings.underline && "tool-active"
              )}
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="w-px h-5 bg-border/50" /> {/* Separator */}

          {/* Font size */}
          <div className="flex items-center gap-2">
            <Label className="mono-label whitespace-nowrap">Size</Label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => updateSetting('fontSize', value)}
              min={8}
              max={72}
              step={2}
              className="w-20 [&_[role=slider]]:border-[hsl(var(--free))] [&_[role=slider]]:focus-visible:ring-[hsl(var(--free))]"
            />
            <span className="text-[10px] font-mono text-muted-foreground w-5">
              {settings.fontSize}
            </span>
          </div>

          {/* Font family */}
          <div className="flex items-center gap-2">
            <Label className="mono-label">Font</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) => updateSetting('fontFamily', value)}
            >
              <SelectTrigger className="w-28 h-6 text-xs font-mono border-0 bg-muted/30 hover:bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value} className="text-xs">
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
        <span className="text-[10px] font-mono text-muted-foreground">
          Click and drag to redact areas (black fill)
        </span>
      )}
    </div>
  )
}
