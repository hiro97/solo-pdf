"use client"

import { useEffect, useRef, useCallback, useState } from 'react'
import { Canvas, PencilBrush } from 'fabric'
import { X, Trash2, Check, Type as TypeIcon, Pencil, Upload, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface SignatureModalProps {
  onSave: (dataUrl: string) => void
  onClose: () => void
}

type TabType = 'type' | 'draw' | 'upload'

const SIGNATURE_FONTS = [
  { name: 'Dancing Script', style: 'cursive', weight: '400' },
  { name: 'Great Vibes', style: 'cursive', weight: '400' },
  { name: 'Pacifico', style: 'cursive', weight: '400' },
]

export function SignatureModal({ onSave, onClose }: SignatureModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('type')
  const [signatureName, setSignatureName] = useState('')
  const [selectedFont, setSelectedFont] = useState(0)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const [hasDrawn, setHasDrawn] = useState(false)

  // Load Google Fonts dynamically
  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Pacifico&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  // Initialize Fabric.js canvas for signature drawing
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new Canvas(canvasRef.current, {
      width: 500,
      height: 200,
      backgroundColor: '#ffffff',
      isDrawingMode: true,
    })

    // Configure brush for signature-style drawing
    const brush = new PencilBrush(canvas)
    brush.width = 2
    brush.color = '#000000'
    canvas.freeDrawingBrush = brush

    // Track when user draws
    canvas.on('path:created', () => {
      setHasDrawn(true)
    })

    fabricRef.current = canvas

    return () => {
      canvas.dispose()
      fabricRef.current = null
    }
  }, [])

  // Clear drawing canvas
  const handleClear = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    canvas.clear()
    canvas.backgroundColor = '#ffffff'
    canvas.renderAll()
    setHasDrawn(false)
  }, [])

  // Generate signature from text
  const generateTextSignature = useCallback(() => {
    if (!signatureName.trim()) return null

    const canvas = document.createElement('canvas')
    canvas.width = 500
    canvas.height = 150
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Set font
    const font = SIGNATURE_FONTS[selectedFont]
    ctx.font = `48px "${font.name}", ${font.style}`
    ctx.fillStyle = '#000000'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'

    // Draw text
    ctx.fillText(signatureName, 250, 75)

    return canvas.toDataURL('image/png')
  }, [signatureName, selectedFont])

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  // Save signature
  const handleSave = useCallback(() => {
    let dataUrl: string | null = null

    if (activeTab === 'type') {
      dataUrl = generateTextSignature()
      if (!dataUrl) {
        alert('Please enter your name')
        return
      }
    } else if (activeTab === 'draw') {
      const canvas = fabricRef.current
      if (!canvas || !hasDrawn) {
        alert('Please draw your signature')
        return
      }

      // Export canvas as PNG with transparent background
      const tempBg = canvas.backgroundColor
      canvas.backgroundColor = 'transparent'
      canvas.renderAll()

      dataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: 2, // Higher resolution
      })

      canvas.backgroundColor = tempBg
      canvas.renderAll()
    } else if (activeTab === 'upload') {
      if (!uploadedImage) {
        alert('Please upload an image')
        return
      }
      dataUrl = uploadedImage
    }

    if (dataUrl) {
      onSave(dataUrl)
    }
  }, [activeTab, generateTextSignature, hasDrawn, uploadedImage, onSave])

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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-xl border max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Add Signature</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('type')}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              activeTab === 'type'
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TypeIcon className="h-4 w-4" />
            Type
          </button>
          <button
            onClick={() => setActiveTab('draw')}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              activeTab === 'draw'
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Pencil className="h-4 w-4" />
            Draw
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              activeTab === 'upload'
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px]">
          {/* Type Tab */}
          {activeTab === 'type' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="signature-name">Your Name</Label>
                <Input
                  id="signature-name"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1.5 text-lg"
                  autoFocus
                />
              </div>

              {signatureName.trim() && (
                <div>
                  <Label className="mb-3 block">Choose a style</Label>
                  <div className="space-y-3">
                    {SIGNATURE_FONTS.map((font, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedFont(index)}
                        className={cn(
                          "w-full p-4 border-2 rounded-lg transition-all text-center",
                          selectedFont === index
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div
                          style={{
                            fontFamily: `"${font.name}", ${font.style}`,
                            fontSize: '36px',
                            color: '#000',
                          }}
                        >
                          {signatureName}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!signatureName.trim() && (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  Enter your name to see signature styles
                </div>
              )}
            </div>
          )}

          {/* Draw Tab */}
          {activeTab === 'draw' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg overflow-hidden bg-white">
                <canvas ref={canvasRef} />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Draw your signature using your mouse, trackpad, or touch screen
              </p>
              {hasDrawn && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {!uploadedImage ? (
                <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <ImagePlus className="h-12 w-12 text-muted-foreground mb-3" />
                  <span className="text-sm font-medium">Click to upload signature image</span>
                  <span className="text-xs text-muted-foreground mt-1">PNG, JPG, or GIF</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-white flex items-center justify-center min-h-[200px]">
                    <img
                      src={uploadedImage}
                      alt="Uploaded signature"
                      className="max-h-48 max-w-full object-contain"
                    />
                  </div>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadedImage(null)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-muted/30">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
          >
            <Check className="h-4 w-4 mr-2" />
            Insert Signature
          </Button>
        </div>
      </div>
    </div>
  )
}
