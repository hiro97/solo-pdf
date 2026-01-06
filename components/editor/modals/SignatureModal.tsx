"use client"

import { useEffect, useRef, useCallback, useState } from 'react'
import { Canvas, PencilBrush } from 'fabric'
import { X, Trash2, Check, Type, Pencil, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SignatureModalProps {
  onSave: (dataUrl: string) => void
  onClose: () => void
}

type TabType = 'type' | 'draw' | 'upload'

interface FontOption {
  name: string
  fontFamily: string
  cssVar: string
}

const SIGNATURE_FONTS: FontOption[] = [
  { name: 'Elegant', fontFamily: 'Great Vibes', cssVar: 'var(--font-great-vibes)' },
  { name: 'Casual', fontFamily: 'Dancing Script', cssVar: 'var(--font-dancing-script)' },
  { name: 'Classic', fontFamily: 'Allura', cssVar: 'var(--font-allura)' },
]

export function SignatureModal({ onSave, onClose }: SignatureModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('type')

  // Type tab state
  const [name, setName] = useState('')
  const [selectedFont, setSelectedFont] = useState<FontOption>(SIGNATURE_FONTS[0])

  // Draw tab state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const [hasDrawn, setHasDrawn] = useState(false)

  // Upload tab state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize Fabric.js canvas for signature drawing
  useEffect(() => {
    if (activeTab !== 'draw' || !canvasRef.current) return

    // Dispose existing canvas if any
    if (fabricRef.current) {
      fabricRef.current.dispose()
    }

    const canvas = new Canvas(canvasRef.current, {
      width: 500,
      height: 200,
      backgroundColor: '#ffffff',
      isDrawingMode: true,
    })

    const brush = new PencilBrush(canvas)
    brush.width = 2
    brush.color = '#000000'
    canvas.freeDrawingBrush = brush

    canvas.on('path:created', () => {
      setHasDrawn(true)
    })

    fabricRef.current = canvas

    return () => {
      canvas.dispose()
      fabricRef.current = null
    }
  }, [activeTab])

  // Clear draw canvas
  const handleClearDraw = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    canvas.clear()
    canvas.backgroundColor = '#ffffff'
    canvas.renderAll()
    setHasDrawn(false)
  }, [])

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  // Clear uploaded image
  const handleClearUpload = useCallback(() => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Export typed signature to canvas
  const exportTypedSignature = useCallback((text: string, font: FontOption): string => {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 200
    const ctx = canvas.getContext('2d')!

    // Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate font size based on text length
    let fontSize = 72
    ctx.font = `${fontSize}px ${font.fontFamily}, cursive`
    let textWidth = ctx.measureText(text).width

    // Scale down if text is too wide
    while (textWidth > canvas.width - 40 && fontSize > 24) {
      fontSize -= 4
      ctx.font = `${fontSize}px ${font.fontFamily}, cursive`
      textWidth = ctx.measureText(text).width
    }

    ctx.fillStyle = '#000000'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)

    return canvas.toDataURL('image/png')
  }, [])

  // Save signature based on active tab
  const handleSave = useCallback(() => {
    let dataUrl: string | null = null

    switch (activeTab) {
      case 'type':
        if (!name.trim()) return
        dataUrl = exportTypedSignature(name.trim(), selectedFont)
        break

      case 'draw':
        const canvas = fabricRef.current
        if (!canvas || !hasDrawn) return

        const tempBg = canvas.backgroundColor
        canvas.backgroundColor = 'transparent'
        canvas.renderAll()

        dataUrl = canvas.toDataURL({
          format: 'png',
          multiplier: 2,
        })

        canvas.backgroundColor = tempBg
        canvas.renderAll()
        break

      case 'upload':
        if (!uploadedImage) return
        dataUrl = uploadedImage
        break
    }

    if (dataUrl) {
      onSave(dataUrl)
    }
  }, [activeTab, name, selectedFont, hasDrawn, uploadedImage, exportTypedSignature, onSave])

  // Check if save is enabled
  const canSave =
    (activeTab === 'type' && name.trim().length > 0) ||
    (activeTab === 'draw' && hasDrawn) ||
    (activeTab === 'upload' && uploadedImage !== null)

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative editor-glass-panel rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="section-indicator">
            <span className="text-sm font-mono uppercase tracking-wider text-foreground">
              Signature
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/50">
          <button
            onClick={() => setActiveTab('type')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-mono uppercase tracking-wider transition-all editor-transition",
              activeTab === 'type'
                ? "border-b-2 border-[hsl(var(--free))] text-[hsl(var(--free))]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Type className="h-3.5 w-3.5" />
            Type
          </button>
          <button
            onClick={() => setActiveTab('draw')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-mono uppercase tracking-wider transition-all editor-transition",
              activeTab === 'draw'
                ? "border-b-2 border-[hsl(var(--free))] text-[hsl(var(--free))]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            Draw
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-mono uppercase tracking-wider transition-all editor-transition",
              activeTab === 'upload'
                ? "border-b-2 border-[hsl(var(--free))] text-[hsl(var(--free))]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 min-h-[300px]">
          {/* Type Tab */}
          {activeTab === 'type' && (
            <div className="space-y-4">
              <div>
                <label className="mono-label mb-1.5 block">Enter your name</label>
                <Input
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-lg font-mono focus:ring-[hsl(var(--free))] focus:border-[hsl(var(--free))]"
                  autoFocus
                />
              </div>

              {name.trim() && (
                <div className="space-y-2">
                  <label className="mono-label">Choose a style</label>
                  <div className="grid gap-2">
                    {SIGNATURE_FONTS.map((font) => (
                      <button
                        key={font.name}
                        onClick={() => setSelectedFont(font)}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all editor-transition text-left bg-white",
                          selectedFont.name === font.name
                            ? "border-[hsl(var(--free))] ring-2 ring-[hsl(var(--free)/0.2)] bg-[hsl(var(--free)/0.02)]"
                            : "border-muted hover:border-muted-foreground/30"
                        )}
                      >
                        <span
                          className="text-2xl text-black block truncate"
                          style={{ fontFamily: font.cssVar }}
                        >
                          {name}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1 block">
                          {font.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!name.trim() && (
                <div className="flex items-center justify-center h-44 border border-dashed border-border/50 rounded-lg bg-muted/10">
                  <p className="text-xs font-mono text-muted-foreground">
                    Type your name to see signature styles
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Draw Tab */}
          {activeTab === 'draw' && (
            <div>
              <div className="border border-border/50 rounded-lg overflow-hidden bg-white">
                <canvas ref={canvasRef} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] font-mono text-muted-foreground">
                  Draw your signature using mouse or touchpad
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearDraw}
                  disabled={!hasDrawn}
                  className="h-6 text-[10px] font-mono"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {!uploadedImage ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-44 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center gap-2
                             hover:border-[hsl(var(--free)/0.5)] hover:bg-[hsl(var(--free)/0.02)] transition-all editor-transition"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">
                    Click to upload signature image
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    PNG, JPG, or GIF
                  </span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="border border-border/50 rounded-lg p-4 bg-white flex items-center justify-center min-h-[180px]">
                    <img
                      src={uploadedImage}
                      alt="Uploaded signature"
                      className="max-h-40 max-w-full object-contain"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearUpload}
                      className="h-6 text-[10px] font-mono"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border/50 bg-muted/10">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-mono"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!canSave}
            className="bg-[hsl(var(--free))] hover:bg-[hsl(var(--free)/0.9)] text-white text-xs font-mono"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Insert Signature
          </Button>
        </div>
      </div>
    </div>
  )
}
