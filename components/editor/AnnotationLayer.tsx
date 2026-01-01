"use client"

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { Canvas, PencilBrush, IText, Rect, Path, FabricObject, FabricImage } from 'fabric'
import type { ToolType, ToolSettings, PageDimensions, Annotation } from './types'

interface AnnotationLayerProps {
  width: number
  height: number
  scale: number
  activeTool: ToolType
  toolSettings: ToolSettings
  pageNumber: number
  annotations: Annotation[]
  onAnnotationAdd: (fabricJSON: string, type: ToolType) => void
  onAnnotationUpdate: (id: string, fabricJSON: string) => void
  onAnnotationRemove: (id: string) => void
  onSignatureRequest?: () => void
}

export const AnnotationLayer = React.memo(function AnnotationLayer({
  width,
  height,
  scale,
  activeTool,
  toolSettings,
  pageNumber,
  annotations,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationRemove,
  onSignatureRequest,
}: AnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  // Track when canvas is ready to ensure event handlers register properly
  const [canvasReady, setCanvasReady] = useState(false)

  // Get devicePixelRatio for crisp rendering on high-DPI displays
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

  // Refs to avoid stale closures in event handlers
  const activeToolRef = useRef<ToolType>(activeTool)
  const toolSettingsRef = useRef<ToolSettings>(toolSettings)
  const onAnnotationAddRef = useRef(onAnnotationAdd)
  const onAnnotationUpdateRef = useRef(onAnnotationUpdate)
  const onSignatureRequestRef = useRef(onSignatureRequest)

  // For shape drawing (rectangle, redact)
  const isDrawingRef = useRef(false)
  const startPointRef = useRef<{ x: number; y: number } | null>(null)
  const activeShapeRef = useRef<Rect | null>(null)

  // Keep refs in sync with props
  useEffect(() => {
    activeToolRef.current = activeTool
  }, [activeTool])

  useEffect(() => {
    toolSettingsRef.current = toolSettings
  }, [toolSettings])

  useEffect(() => {
    onAnnotationAddRef.current = onAnnotationAdd
  }, [onAnnotationAdd])

  useEffect(() => {
    onAnnotationUpdateRef.current = onAnnotationUpdate
  }, [onAnnotationUpdate])

  useEffect(() => {
    onSignatureRequestRef.current = onSignatureRequest
  }, [onSignatureRequest])

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return

    // Calculate DPR-scaled dimensions for crisp rendering
    const canvasWidth = width * scale
    const canvasHeight = height * scale

    const canvas = new Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      selection: activeTool === 'select',
      isDrawingMode: activeTool === 'draw',
      backgroundColor: 'transparent',
    })

    fabricRef.current = canvas

    // Apply DPR scaling for high-DPI displays
    // This ensures crisp rendering on Retina screens
    const upperCanvas = canvas.upperCanvasEl
    const lowerCanvas = canvas.lowerCanvasEl

    if (upperCanvas && lowerCanvas) {
      // Set internal resolution to DPR-scaled dimensions
      upperCanvas.width = canvasWidth * dpr
      upperCanvas.height = canvasHeight * dpr
      lowerCanvas.width = canvasWidth * dpr
      lowerCanvas.height = canvasHeight * dpr

      // Keep CSS size at original dimensions
      upperCanvas.style.width = `${canvasWidth}px`
      upperCanvas.style.height = `${canvasHeight}px`
      lowerCanvas.style.width = `${canvasWidth}px`
      lowerCanvas.style.height = `${canvasHeight}px`

      // Scale the canvas contexts
      const upperCtx = upperCanvas.getContext('2d')
      const lowerCtx = lowerCanvas.getContext('2d')
      if (upperCtx) upperCtx.scale(dpr, dpr)
      if (lowerCtx) lowerCtx.scale(dpr, dpr)
    }

    // Configure drawing brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = toolSettings.strokeWidth
      canvas.freeDrawingBrush.color = toolSettings.color
    }

    // Signal that canvas is fully initialized and ready for event handlers
    setCanvasReady(true)

    return () => {
      canvas.dispose()
      fabricRef.current = null
      setCanvasReady(false)  // Reset on cleanup
    }
  }, [width, height, scale, dpr])

  // Update canvas mode when tool changes
  useEffect(() => {
    if (!canvasReady) return

    const canvas = fabricRef.current
    if (!canvas) return

    // Clear any in-progress drawing state when switching tools
    if (activeShapeRef.current) {
      canvas.remove(activeShapeRef.current)
      activeShapeRef.current = null
    }
    isDrawingRef.current = false
    startPointRef.current = null

    // Reset modes
    canvas.isDrawingMode = activeTool === 'draw'
    // Allow selection in select mode AND text mode (for re-editing)
    canvas.selection = activeTool === 'select' || activeTool === 'text'

    // Configure brush for draw mode
    if (activeTool === 'draw') {
      const brush = new PencilBrush(canvas)
      brush.width = toolSettings.strokeWidth
      brush.color = toolSettings.color
      canvas.freeDrawingBrush = brush
    }

    // Update cursor based on tool
    const cursorMap: Record<ToolType, string> = {
      select: 'default',
      text: 'text',
      draw: 'crosshair',
      highlighter: 'crosshair',
      rectangle: 'crosshair',
      circle: 'crosshair',
      line: 'crosshair',
      arrow: 'crosshair',
      signature: 'pointer',
      image: 'crosshair',
      redact: 'crosshair',
    }
    canvas.defaultCursor = cursorMap[activeTool] || 'default'
    canvas.hoverCursor = activeTool === 'text' ? 'text' : (cursorMap[activeTool] || 'move')

    canvas.renderAll()
  }, [activeTool, toolSettings, canvasReady])

  // Update brush settings when tool settings change
  useEffect(() => {
    if (!canvasReady) return

    const canvas = fabricRef.current
    if (!canvas || !canvas.freeDrawingBrush) return

    canvas.freeDrawingBrush.width = toolSettings.strokeWidth
    canvas.freeDrawingBrush.color = toolSettings.color
  }, [toolSettings, canvasReady])

  // Handle mouse events for tools - registered ONCE, reads current tool from refs
  useEffect(() => {
    // Wait for canvas to be fully initialized before registering handlers
    if (!canvasReady) return

    const canvas = fabricRef.current
    if (!canvas) return

    // Handle path created (draw tool)
    const handlePathCreated = (e: { path?: FabricObject }) => {
      const currentTool = activeToolRef.current
      if (e.path && currentTool === 'draw') {
        const json = JSON.stringify(e.path.toObject())
        onAnnotationAddRef.current(json, 'draw')
      }
    }

    // Handle mouse down for shape tools
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMouseDown = (e: any) => {
      const pointer = e.pointer || e.scenePoint || e.absolutePointer
      if (!pointer) return

      const { x, y } = pointer
      const clickedObject = e.target
      const currentTool = activeToolRef.current
      const settings = toolSettingsRef.current

      switch (currentTool) {
        case 'text':
          // If clicking on an existing IText, select it (don't create new)
          if (clickedObject && clickedObject.type === 'i-text') {
            canvas.setActiveObject(clickedObject)
            return
          }
          // Create new text box only when clicking on empty space
          createTextBox(canvas, x, y, settings)
          break

        case 'rectangle':
          if (clickedObject) return
          createRectangle(canvas, x, y, false, settings)
          break

        case 'redact':
          if (clickedObject) return
          createRectangle(canvas, x, y, true, settings)
          break

        case 'signature':
          // Store click position for signature placement
          (window as unknown as { pendingSignaturePosition?: { x: number; y: number } }).pendingSignaturePosition = { x, y }
          // Ensure THIS page's addSignatureImage is used (not another page's)
          (window as unknown as { addSignatureToCanvas?: (url: string) => void }).addSignatureToCanvas = (dataUrl: string) => {
            const pos = (window as unknown as { pendingSignaturePosition?: { x: number; y: number } }).pendingSignaturePosition
            insertSignatureImage(canvas, dataUrl, pos?.x ?? x, pos?.y ?? y)
          }
          onSignatureRequestRef.current?.()
          break

        case 'image':
          if (clickedObject) return
          // Create file input and trigger click
          const fileInput = document.createElement('input')
          fileInput.type = 'file'
          fileInput.accept = 'image/*'
          fileInput.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (e) => {
                const dataUrl = e.target?.result as string
                if (dataUrl) {
                  insertImage(canvas, dataUrl, x, y)
                }
              }
              reader.readAsDataURL(file)
            }
          }
          fileInput.click()
          break
      }
    }

    // Helper: Insert image at position
    const insertImage = (cvs: Canvas, dataUrl: string, x: number, y: number) => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // Keep original resolution, but scale display size to fit canvas if too large
        const canvasWidth = cvs.getWidth()
        const canvasHeight = cvs.getHeight()
        const maxDisplayWidth = canvasWidth * 0.8
        const maxDisplayHeight = canvasHeight * 0.8

        // Calculate scale to fit within canvas while maintaining aspect ratio
        let displayScale = 1
        if (img.width > maxDisplayWidth || img.height > maxDisplayHeight) {
          displayScale = Math.min(
            maxDisplayWidth / img.width,
            maxDisplayHeight / img.height
          )
        }

        const fabricImage = new FabricImage(img, {
          left: x,
          top: y,
          scaleX: displayScale,
          scaleY: displayScale,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerColor: '#2563eb',
          cornerSize: 8,
          cornerStyle: 'circle',
          transparentCorners: false,
          borderColor: '#2563eb',
        })

        cvs.add(fabricImage)
        cvs.setActiveObject(fabricImage)
        cvs.renderAll()

        const json = JSON.stringify(fabricImage.toObject(['src']))
        onAnnotationAddRef.current(json, 'image')
      }
      img.src = dataUrl
    }

    // Helper: Insert signature image at position
    const insertSignatureImage = (cvs: Canvas, dataUrl: string, x: number, y: number) => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // Scale signature to reasonable size
        const maxSize = 200
        let signatureScale = 1
        if (img.width > maxSize || img.height > maxSize) {
          signatureScale = maxSize / Math.max(img.width, img.height)
        }

        const fabricImage = new FabricImage(img, {
          left: x,
          top: y,
          scaleX: signatureScale,
          scaleY: signatureScale,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerColor: '#2563eb',
          cornerSize: 8,
          cornerStyle: 'circle',
          transparentCorners: false,
          borderColor: '#2563eb',
        })

        cvs.add(fabricImage)
        cvs.setActiveObject(fabricImage)
        cvs.renderAll()

        const json = JSON.stringify(fabricImage.toObject(['src']))
        onAnnotationAddRef.current(json, 'signature')

        // Clear pending position
        delete (window as unknown as { pendingSignaturePosition?: { x: number; y: number } }).pendingSignaturePosition
      }
      img.src = dataUrl
    }

    // Handle double click for text editing
    const handleDoubleClick = (e: { target?: FabricObject | null }) => {
      const clickedObject = e.target

      if (clickedObject && clickedObject.type === 'i-text') {
        const textObj = clickedObject as IText
        canvas.setActiveObject(textObj)
        textObj.enterEditing()
        textObj.selectAll()
      }
    }

    // Handle mouse move for shape drawing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMouseMove = (e: any) => {
      if (!isDrawingRef.current || !startPointRef.current || !activeShapeRef.current) return
      const pointer = e.pointer || e.scenePoint || e.absolutePointer
      if (!pointer) return

      const { x, y } = pointer
      const startX = startPointRef.current.x
      const startY = startPointRef.current.y

      const left = Math.min(startX, x)
      const top = Math.min(startY, y)
      const rectWidth = Math.abs(x - startX)
      const rectHeight = Math.abs(y - startY)

      activeShapeRef.current.set({ left, top, width: rectWidth, height: rectHeight })
      canvas.renderAll()
    }

    // Handle mouse up for shape drawing
    const handleMouseUp = () => {
      if (!isDrawingRef.current || !activeShapeRef.current) return

      const rect = activeShapeRef.current

      if (rect.width && rect.height && rect.width > 5 && rect.height > 5) {
        const json = JSON.stringify(rect.toObject())
        const type = rect.fill === '#000000' ? 'redact' : 'rectangle'
        onAnnotationAddRef.current(json, type)
      } else {
        canvas.remove(rect)
      }

      isDrawingRef.current = false
      startPointRef.current = null
      activeShapeRef.current = null
    }

    // Handle object modification - save changes to annotation
    const handleObjectModified = (e: { target?: FabricObject }) => {
      if (!e.target) return
      // For now, just log - full update would need annotation ID tracking
      const json = JSON.stringify(e.target.toObject())
      console.log('Object modified:', json)
    }

    // Handle delete key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObject = canvas.getActiveObject()
        if (activeObject && activeToolRef.current === 'select') {
          canvas.remove(activeObject)
          canvas.renderAll()
        }
      }
    }

    // Helper: Create text box
    const createTextBox = (cvs: Canvas, x: number, y: number, settings: ToolSettings) => {
      const text = new IText('', {
        left: x,
        top: y,
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
        fill: settings.color,
        editable: true,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockUniScaling: false,
        padding: 5,
        borderColor: '#2563eb',
        cornerColor: '#2563eb',
        cornerSize: 8,
        cornerStyle: 'circle',
        transparentCorners: false,
        borderScaleFactor: 1.5,
      })

      let isNewTextBox = true

      cvs.add(text)
      cvs.setActiveObject(text)
      text.enterEditing()

      text.on('editing:exited', () => {
        if (!text.text || text.text.trim() === '') {
          cvs.remove(text)
          cvs.renderAll()
          return
        }

        const json = JSON.stringify(text.toObject())
        if (isNewTextBox) {
          onAnnotationAddRef.current(json, 'text')
          isNewTextBox = false
        }
        cvs.renderAll()
      })
    }

    // Helper: Create rectangle
    const createRectangle = (cvs: Canvas, x: number, y: number, isRedact: boolean, settings: ToolSettings) => {
      isDrawingRef.current = true
      startPointRef.current = { x, y }

      const rect = new Rect({
        left: x,
        top: y,
        width: 0,
        height: 0,
        fill: isRedact ? '#000000' : 'transparent',
        stroke: isRedact ? '#000000' : settings.color,
        strokeWidth: isRedact ? 0 : settings.strokeWidth,
        selectable: true,
        evented: true,
      })

      cvs.add(rect)
      activeShapeRef.current = rect
    }

    // Register event listeners
    canvas.on('path:created', handlePathCreated)
    canvas.on('mouse:down', handleMouseDown)
    canvas.on('mouse:dblclick', handleDoubleClick)
    canvas.on('mouse:move', handleMouseMove)
    canvas.on('mouse:up', handleMouseUp)
    canvas.on('object:modified', handleObjectModified)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      canvas.off('path:created', handlePathCreated)
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('mouse:dblclick', handleDoubleClick)
      canvas.off('mouse:move', handleMouseMove)
      canvas.off('mouse:up', handleMouseUp)
      canvas.off('object:modified', handleObjectModified)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [width, height, scale, activeTool, canvasReady]) // Re-register when tool changes or canvas becomes ready

  // Add signature image to canvas (called from parent)
  const addSignatureImage = useCallback((dataUrl: string, x?: number, y?: number) => {
    const canvas = fabricRef.current
    if (!canvas) return

    // Get stored click position if not provided
    const pendingPos = (window as unknown as { pendingSignaturePosition?: { x: number; y: number } }).pendingSignaturePosition
    const posX = x ?? pendingPos?.x ?? (width * scale) / 2 - 100
    const posY = y ?? pendingPos?.y ?? (height * scale) / 2 - 50

    // Clear pending position
    delete (window as unknown as { pendingSignaturePosition?: { x: number; y: number } }).pendingSignaturePosition

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Scale signature to reasonable size
      const maxSize = 200
      let signatureScale = 1
      if (img.width > maxSize || img.height > maxSize) {
        signatureScale = maxSize / Math.max(img.width, img.height)
      }

      const fabricImage = new FabricImage(img, {
        left: posX,
        top: posY,
        scaleX: signatureScale,
        scaleY: signatureScale,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        cornerColor: '#2563eb',
        cornerSize: 8,
        cornerStyle: 'circle',
        transparentCorners: false,
        borderColor: '#2563eb',
      })

      canvas.add(fabricImage)
      canvas.setActiveObject(fabricImage)
      canvas.renderAll()

      const json = JSON.stringify(fabricImage.toObject(['src']))
      onAnnotationAddRef.current(json, 'signature')
    }
    img.src = dataUrl
  }, [width, height, scale])

  // Expose addSignatureImage method via ref or callback
  useEffect(() => {
    // Attach method to window for parent access (temporary solution)
    // In production, use ref forwarding or context
    (window as unknown as { addSignatureToCanvas?: typeof addSignatureImage }).addSignatureToCanvas = addSignatureImage
  }, [addSignatureImage])

  // Load annotations when page changes
  useEffect(() => {
    if (!canvasReady) return

    const canvas = fabricRef.current
    if (!canvas) return

    // Clear existing objects
    canvas.clear()

    // Load annotations for this page
    annotations.forEach(annotation => {
      try {
        const objData = JSON.parse(annotation.fabricJSON)

        // Fabric.js v7 uses PascalCase type names (IText, Rect, Path)
        // Also handle legacy lowercase types for backwards compatibility
        const objType = objData.type?.toLowerCase()

        // Fabric.js v7: 'type' is a read-only getter, must exclude from spread
        const { type: _, ...restData } = objData

        if (objType === 'i-text' || objType === 'itext') {
          const text = new IText(objData.text || '', {
            ...restData,
            // Ensure text is editable and selectable
            editable: true,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            lockUniScaling: false,
            // Visual styling for controls
            borderColor: '#2563eb',
            cornerColor: '#2563eb',
            cornerSize: 8,
            cornerStyle: 'circle',
            transparentCorners: false,
          })
          canvas.add(text)
        } else if (objType === 'rect') {
          const rect = new Rect({
            ...restData,
            selectable: true,
            hasControls: true,
            hasBorders: true,
          })
          canvas.add(rect)
        } else if (objType === 'path') {
          // Draw tool creates Path objects
          const path = new Path(objData.path, {
            ...restData,
            selectable: true,
            hasControls: true,
            hasBorders: true,
          })
          canvas.add(path)
        } else if (objType === 'image') {
          // Image annotations (signatures and inserted images)
          const img = new window.Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            const fabricImage = new FabricImage(img, {
              ...restData,
              selectable: true,
              hasControls: true,
              hasBorders: true,
              cornerColor: '#2563eb',
              cornerSize: 8,
              cornerStyle: 'circle',
              transparentCorners: false,
              borderColor: '#2563eb',
            })
            canvas.add(fabricImage)
            canvas.renderAll()
          }
          img.src = objData.src
        }
      } catch (err) {
        console.error('Failed to load annotation:', err)
      }
    })

    canvas.renderAll()
  }, [pageNumber, annotations, canvasReady])

  // Calculate display dimensions
  const displayWidth = width * scale
  const displayHeight = height * scale

  return (
    <canvas
      ref={canvasRef}
      width={displayWidth * dpr}
      height={displayHeight * dpr}
      className="absolute top-0 left-0 z-10"
      style={{
        width: displayWidth,
        height: displayHeight,
        pointerEvents: 'auto',
      }}
    />
  )
})
