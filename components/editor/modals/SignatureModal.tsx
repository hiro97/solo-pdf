"use client"

import { useEffect, useRef, useCallback, useState } from 'react'
import { Canvas, PencilBrush } from 'fabric'
import { X, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SignatureModalProps {
  onSave: (dataUrl: string) => void
  onClose: () => void
}

export function SignatureModal({ onSave, onClose }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const [hasDrawn, setHasDrawn] = useState(false)

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

  // Clear canvas
  const handleClear = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    canvas.clear()
    canvas.backgroundColor = '#ffffff'
    canvas.renderAll()
    setHasDrawn(false)
  }, [])

  // Save signature as data URL
  const handleSave = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || !hasDrawn) return

    // Export canvas as PNG with transparent background
    const tempBg = canvas.backgroundColor
    canvas.backgroundColor = 'transparent'
    canvas.renderAll()

    const dataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: 2, // Higher resolution
    })

    canvas.backgroundColor = tempBg
    canvas.renderAll()

    onSave(dataUrl)
  }, [hasDrawn, onSave])

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
      <div className="relative bg-background rounded-lg shadow-xl border max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Draw Your Signature</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Canvas Area */}
        <div className="p-4">
          <div className="border rounded-lg overflow-hidden bg-white">
            <canvas ref={canvasRef} />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Draw your signature above using your mouse or touchpad
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!hasDrawn}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>

          <div className="flex gap-2">
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
              disabled={!hasDrawn}
            >
              <Check className="h-4 w-4 mr-2" />
              Insert Signature
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
