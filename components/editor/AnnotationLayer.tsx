"use client"

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { Canvas, PencilBrush, IText, Rect, Path, FabricObject, FabricImage } from 'fabric'
import type { ToolType, ToolSettings, PageDimensions, Annotation } from './types'
import { registerCanvas, unregisterCanvas } from '@/lib/canvas-registry'

interface AnnotationLayerProps {
  width: number
  height: number
  scale: number
  activeTool: ToolType
  toolSettings: ToolSettings
  pageNumber: number
  annotations: Annotation[]
  onAnnotationAdd: (fabricJSON: string, type: ToolType) => string
  onAnnotationUpdate: (id: string, fabricJSON: string) => void
  onAnnotationRemove: (id: string) => void
  onSignatureRequest?: () => void
  onStyleSync?: (styles: Partial<ToolSettings>) => void
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
  onStyleSync,
}: AnnotationLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  // Track when canvas is ready to ensure event handlers register properly
  const [canvasReady, setCanvasReady] = useState(false)

  // Track canvas dimensions to prevent unnecessary reinitialization
  const canvasDimensionsRef = useRef<{ width: number; height: number; scale: number } | null>(null)

  // Track loaded annotations to prevent unnecessary reloading
  const loadedAnnotationsRef = useRef<string>('')

  // Refs to avoid stale closures in event handlers
  const activeToolRef = useRef<ToolType>(activeTool)
  const toolSettingsRef = useRef<ToolSettings>(toolSettings)
  const onAnnotationAddRef = useRef(onAnnotationAdd)
  const onAnnotationUpdateRef = useRef(onAnnotationUpdate)
  const onAnnotationRemoveRef = useRef(onAnnotationRemove)
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
    // Update registry with latest callback if canvas exists
    if (fabricRef.current) {
      registerCanvas(pageNumber, fabricRef.current, onAnnotationUpdate)
    }
  }, [onAnnotationUpdate, pageNumber])

  useEffect(() => {
    onAnnotationRemoveRef.current = onAnnotationRemove
  }, [onAnnotationRemove])

  useEffect(() => {
    onSignatureRequestRef.current = onSignatureRequest
  }, [onSignatureRequest])

  const onStyleSyncRef = useRef(onStyleSync)
  useEffect(() => {
    onStyleSyncRef.current = onStyleSync
  }, [onStyleSync])

  // Track if we're currently syncing styles to prevent circular updates
  const isSyncingRef = useRef(false)

  // Sync toolbar state with selected text's current styles
  const syncToolbarWithText = useCallback((textObj: IText) => {
    if (!onStyleSyncRef.current) return

    // Set syncing flag to prevent circular updates
    isSyncingRef.current = true

    // Check if there's a partial text selection
    const hasPartialSelection = textObj.isEditing &&
      textObj.selectionEnd > textObj.selectionStart

    if (hasPartialSelection) {
      // Get styles of first selected character
      const styles = textObj.getSelectionStyles()
      if (styles.length > 0) {
        const style = styles[0] as Record<string, unknown>
        onStyleSyncRef.current({
          bold: style.fontWeight === 'bold',
          italic: style.fontStyle === 'italic',
          underline: style.underline === true,
          fontSize: (style.fontSize as number) || textObj.fontSize,
          fontFamily: (style.fontFamily as string) || textObj.fontFamily,
          color: (style.fill as string) || (textObj.fill as string),
        })
      }
    } else {
      // No partial selection - use object properties
      onStyleSyncRef.current({
        bold: textObj.fontWeight === 'bold',
        italic: textObj.fontStyle === 'italic',
        underline: textObj.underline === true,
        fontSize: textObj.fontSize,
        fontFamily: textObj.fontFamily,
        color: textObj.fill as string,
      })
    }

    // Reset syncing flag after a short delay to allow React state to settle
    setTimeout(() => {
      isSyncingRef.current = false
    }, 0)
  }, [])

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return

    // Calculate display dimensions
    const canvasWidth = width * scale
    const canvasHeight = height * scale

    // Check if canvas already exists with same dimensions - skip reinitialization
    const currentDims = canvasDimensionsRef.current
    if (
      fabricRef.current &&
      currentDims &&
      currentDims.width === width &&
      currentDims.height === height &&
      currentDims.scale === scale
    ) {
      console.log('[AnnotationLayer] Skipping canvas reinitialization for page', pageNumber, '- dimensions unchanged')
      return
    }

    console.log('[AnnotationLayer] Initializing canvas for page', pageNumber, ':', { width, height, scale, canvasWidth, canvasHeight })

    // Dispose existing canvas SYNCHRONOUSLY during reinitialization
    // (We MUST dispose before creating a new canvas on the same element)
    if (fabricRef.current) {
      const oldCanvas = fabricRef.current
      fabricRef.current = null
      try {
        oldCanvas.off()
        oldCanvas.clear()
        oldCanvas.dispose()
      } catch (err) {
        console.debug('[AnnotationLayer] Reinit dispose error (safe to ignore):', err)
      }
    }

    // Ensure canvas element is clean before creating new Fabric canvas
    // Fabric.js stores a reference on the element - we need to clear any leftover state
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    // Check if canvas element is wrapped by a previous Fabric instance
    // If so, unwrap it to allow fresh initialization
    const existingWrapper = canvasEl.parentElement
    if (existingWrapper && existingWrapper.classList.contains('canvas-container')) {
      // Move canvas out of wrapper
      const grandparent = existingWrapper.parentElement
      if (grandparent) {
        grandparent.insertBefore(canvasEl, existingWrapper)
        // Remove the old wrapper and its contents (upper canvas, etc.)
        existingWrapper.remove()
      }
    }

    // Create canvas with proper dimensions
    // Fabric.js v7 handles DPR internally, so we don't need manual scaling
    const canvas = new Canvas(canvasEl, {
      width: canvasWidth,
      height: canvasHeight,
      selection: activeTool === 'select',
      isDrawingMode: activeTool === 'draw',
      backgroundColor: 'transparent',
    })

    fabricRef.current = canvas
    canvasDimensionsRef.current = { width, height, scale }

    // Style the wrapper element for proper positioning over PDF
    const wrapper = canvas.wrapperEl
    if (wrapper) {
      wrapper.style.position = 'absolute'
      wrapper.style.top = '0'
      wrapper.style.left = '0'
      wrapper.style.width = `${canvasWidth}px`
      wrapper.style.height = `${canvasHeight}px`
      wrapper.style.zIndex = '20'
      wrapper.style.pointerEvents = 'auto'
    }

    // Ensure upper canvas receives pointer events and is properly positioned
    const upperCanvas = canvas.upperCanvasEl
    if (upperCanvas) {
      upperCanvas.style.pointerEvents = 'auto'
      upperCanvas.style.position = 'absolute'
      upperCanvas.style.top = '0'
      upperCanvas.style.left = '0'
    }

    // Lower canvas should not block events
    const lowerCanvas = canvas.lowerCanvasEl
    if (lowerCanvas) {
      lowerCanvas.style.position = 'absolute'
      lowerCanvas.style.top = '0'
      lowerCanvas.style.left = '0'
    }

    // Configure drawing brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = toolSettings.strokeWidth
      canvas.freeDrawingBrush.color = toolSettings.color
    }

    // Signal that canvas is fully initialized and ready for event handlers
    setCanvasReady(true)

    // Register canvas in global registry for sync before save
    registerCanvas(pageNumber, canvas, onAnnotationUpdateRef.current)

    return () => {
      // Unregister canvas before disposing
      unregisterCanvas(pageNumber)

      if (fabricRef.current) {
        const canvasToCleanup = fabricRef.current
        fabricRef.current = null

        // We MUST call dispose() to clear Fabric's internal canvas markers
        // But dispose() causes NotFoundError when React has changed the DOM
        // Solution: Install a global patched removeChild that suppresses NotFoundError
        // This is safe because the patched version is strictly a superset of the original
        if (!('__fabricRemoveChildPatched' in Node.prototype)) {
          const originalRemoveChild = Node.prototype.removeChild
          Node.prototype.removeChild = function<T extends Node>(this: Node, child: T): T {
            try {
              return originalRemoveChild.call(this, child) as T
            } catch (err) {
              if (err instanceof DOMException && err.name === 'NotFoundError') {
                // Silently ignore - element already removed (common during React reconciliation)
                return child
              }
              throw err
            }
          }
          // Mark as patched so we don't patch again
          Object.defineProperty(Node.prototype, '__fabricRemoveChildPatched', {
            value: true,
            writable: false,
            enumerable: false,
          })
        }

        try {
          canvasToCleanup.off()
          canvasToCleanup.clear()
          canvasToCleanup.dispose()
        } catch (err) {
          console.debug('[AnnotationLayer] Cleanup error (safe to ignore):', err)
        }
      }

      canvasDimensionsRef.current = null
      setCanvasReady(false)  // Reset on cleanup
    }
  }, [width, height, scale, pageNumber])

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
      textSelect: 'text',
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

  // Apply tool settings to selected text object when settings change
  useEffect(() => {
    if (!canvasReady) return
    // Prevent circular updates from style sync
    if (isSyncingRef.current) return

    const canvas = fabricRef.current
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (!activeObject || activeObject.type !== 'i-text') return

    const textObj = activeObject as IText

    // Skip for newly created text boxes (no annotation ID yet) that are empty
    // This prevents interference during initial text entry
    const annotationId = (textObj as unknown as { annotationId?: string }).annotationId
    if (!annotationId && (!textObj.text || textObj.text.length === 0)) {
      return
    }

    // Check if there's a partial text selection within the IText (rich text editing)
    const hasPartialSelection = textObj.isEditing &&
      textObj.selectionEnd > textObj.selectionStart

    // Build complete style object from toolSettings
    const styleProps: Record<string, unknown> = {
      fill: toolSettings.color,
      fontSize: toolSettings.fontSize,
      fontFamily: toolSettings.fontFamily,
      fontWeight: toolSettings.bold ? 'bold' : 'normal',
      fontStyle: toolSettings.italic ? 'italic' : 'normal',
      underline: toolSettings.underline,
    }

    if (hasPartialSelection) {
      // Apply styles only to the selected text range
      textObj.setSelectionStyles(
        styleProps,
        textObj.selectionStart,
        textObj.selectionEnd
      )
      // Force cache refresh
      ;(textObj as unknown as { _forceClearCache: boolean })._forceClearCache = true
    } else {
      // No partial selection - apply to the entire text object
      textObj.set(styleProps as Partial<IText>)
    }

    // Force text to recalculate dimensions
    textObj.initDimensions()
    textObj.setCoords()
    canvas.requestRenderAll()

    // Update the annotation store with new settings (includes styles for rich text)
    if (annotationId) {
      // Include 'styles' property for rich text serialization
      const json = JSON.stringify(
        (textObj as unknown as { toObject: (props: string[]) => object }).toObject(['styles'])
      )
      onAnnotationUpdateRef.current(annotationId, json)
    }
  }, [toolSettings, canvasReady])

  // Sync toolbar when text object is selected or selection within text changes
  useEffect(() => {
    if (!canvasReady) return
    const canvas = fabricRef.current
    if (!canvas) return

    // Handle object selection
    const handleSelectionCreated = (e: { selected?: FabricObject[] }) => {
      const selected = e.selected?.[0]
      if (selected && selected.type === 'i-text') {
        syncToolbarWithText(selected as IText)
      }
    }

    const handleSelectionUpdated = (e: { selected?: FabricObject[] }) => {
      const selected = e.selected?.[0]
      if (selected && selected.type === 'i-text') {
        syncToolbarWithText(selected as IText)
      }
    }

    canvas.on('selection:created', handleSelectionCreated)
    canvas.on('selection:updated', handleSelectionUpdated)

    return () => {
      canvas.off('selection:created', handleSelectionCreated)
      canvas.off('selection:updated', handleSelectionUpdated)
    }
  }, [canvasReady, syncToolbarWithText])

  // Handle mouse events for tools - registered ONCE, reads current tool from refs
  useEffect(() => {
    // Wait for canvas to be fully initialized before registering handlers
    if (!canvasReady) return

    const canvas = fabricRef.current
    if (!canvas) return

    console.log('[AnnotationLayer] Registering Fabric.js event handlers for page', pageNumber, ', activeTool:', activeTool)

    // Handle path created (draw tool)
    const handlePathCreated = (e: { path?: FabricObject }) => {
      const currentTool = activeToolRef.current
      if (e.path && currentTool === 'draw') {
        const json = JSON.stringify(e.path.toObject())
        const annotationId = onAnnotationAddRef.current(json, 'draw')
        ;(e.path as unknown as { annotationId: string }).annotationId = annotationId
      }
    }

    // Handle mouse down for shape tools
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMouseDown = (e: any) => {
      console.log('[AnnotationLayer] Fabric mouse:down event received:', e)
      const pointer = e.pointer || e.scenePoint || e.absolutePointer
      if (!pointer) {
        console.log('[AnnotationLayer] No pointer in event, trying viewportPoint')
        return
      }

      const { x, y } = pointer
      const clickedObject = e.target
      const currentTool = activeToolRef.current
      const settings = toolSettingsRef.current
      console.log('[AnnotationLayer] Tool:', currentTool, 'Pointer:', { x, y }, 'Target:', clickedObject?.type)

      switch (currentTool) {
        case 'text':
          // If clicking on an existing IText, select it (don't create new)
          if (clickedObject && clickedObject.type === 'i-text') {
            canvas.setActiveObject(clickedObject)
            return
          }
          // Create new text box only when clicking on empty space
          console.log('[AnnotationLayer] Creating text box at:', { x, y })
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
          ;(window as unknown as { pendingSignaturePosition?: { x: number; y: number } }).pendingSignaturePosition = { x, y }
          // Ensure THIS page's addSignatureImage is used (not another page's)
          ;(window as unknown as { addSignatureToCanvas?: (url: string) => void }).addSignatureToCanvas = (dataUrl: string) => {
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

        const json = JSON.stringify((fabricImage as unknown as { toObject: (props: string[]) => object }).toObject(['src']))
        const annotationId = onAnnotationAddRef.current(json, 'image')
        ;(fabricImage as unknown as { annotationId: string }).annotationId = annotationId
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

        const json = JSON.stringify((fabricImage as unknown as { toObject: (props: string[]) => object }).toObject(['src']))
        const annotationId = onAnnotationAddRef.current(json, 'signature')
        ;(fabricImage as unknown as { annotationId: string }).annotationId = annotationId

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
        const annotationId = onAnnotationAddRef.current(json, type)
        ;(rect as unknown as { annotationId: string }).annotationId = annotationId
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
      const annotationId = (e.target as unknown as { annotationId?: string }).annotationId
      if (annotationId) {
        // Include 'styles' for text objects (rich text), 'src' for images
        // Normalize type to lowercase for comparison (Fabric.js v7 uses PascalCase)
        const objType = (e.target.type || '').toLowerCase()
        const extraProps = objType === 'i-text' ? ['styles'] :
          objType === 'image' ? ['src'] : []
        const json = JSON.stringify(
          (e.target as unknown as { toObject: (props: string[]) => object }).toObject(extraProps)
        )
        onAnnotationUpdateRef.current(annotationId, json)
      }
    }

    // Handle delete key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObject = canvas.getActiveObject()
        if (activeObject && activeToolRef.current === 'select') {
          const annotationId = (activeObject as unknown as { annotationId?: string }).annotationId
          canvas.remove(activeObject)
          canvas.renderAll()
          // Sync with annotation state (fixes delete bug)
          if (annotationId) {
            onAnnotationRemoveRef.current(annotationId)
          }
        }
      }
    }

    // Helper: Create text box
    const createTextBox = (cvs: Canvas, x: number, y: number, settings: ToolSettings) => {
      console.log('[AnnotationLayer] createTextBox called, creating IText at:', { x, y })

      const text = new IText('', {
        left: x,
        top: y,
        fontSize: settings.fontSize,
        fontFamily: settings.fontFamily,
        fill: settings.color,
        fontWeight: settings.bold ? 'bold' : 'normal',
        fontStyle: settings.italic ? 'italic' : 'normal',
        underline: settings.underline,
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

      console.log('[AnnotationLayer] Adding IText to canvas')
      cvs.add(text)
      console.log('[AnnotationLayer] Setting active object')
      cvs.setActiveObject(text)
      console.log('[AnnotationLayer] Entering editing mode')
      text.enterEditing()
      console.log('[AnnotationLayer] IText is now in editing mode, objects on canvas:', cvs.getObjects().length)

      text.on('editing:exited', () => {
        if (!text.text || text.text.trim() === '') {
          cvs.remove(text)
          cvs.renderAll()
          return
        }

        // Include 'styles' for rich text support
        const json = JSON.stringify(
          (text as unknown as { toObject: (props: string[]) => object }).toObject(['styles'])
        )
        if (isNewTextBox) {
          const annotationId = onAnnotationAddRef.current(json, 'text')
          ;(text as unknown as { annotationId: string }).annotationId = annotationId
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
        strokeUniform: true, // Keep stroke width consistent during resize
        selectable: true,
        evented: true,
        // Explicit origin for consistent behavior
        originX: 'left',
        originY: 'top',
        // Control styling
        cornerColor: '#2563eb',
        cornerSize: 8,
        cornerStyle: 'circle',
        transparentCorners: false,
        borderColor: '#2563eb',
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

      const json = JSON.stringify((fabricImage as unknown as { toObject: (props: string[]) => object }).toObject(['src']))
      const annotationId = onAnnotationAddRef.current(json, 'signature')
      ;(fabricImage as unknown as { annotationId: string }).annotationId = annotationId
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

    // Create a key from annotations to check if they actually changed
    const annotationsKey = annotations.map(a => a.id + ':' + a.fabricJSON.length).join('|')

    // Skip if annotations haven't changed
    if (loadedAnnotationsRef.current === annotationsKey) {
      console.log('[AnnotationLayer] Skipping annotation reload - unchanged')
      return
    }

    console.log('[AnnotationLayer] Loading annotations for page', pageNumber, '- count:', annotations.length)
    loadedAnnotationsRef.current = annotationsKey

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
          // Store annotation ID for later updates
          ;(text as unknown as { annotationId: string }).annotationId = annotation.id
          canvas.add(text)
        } else if (objType === 'rect') {
          const rect = new Rect({
            ...restData,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            strokeUniform: true,
            originX: 'left',
            originY: 'top',
            cornerColor: '#2563eb',
            cornerSize: 8,
            cornerStyle: 'circle',
            transparentCorners: false,
            borderColor: '#2563eb',
          })
          ;(rect as unknown as { annotationId: string }).annotationId = annotation.id
          canvas.add(rect)
        } else if (objType === 'path') {
          // Draw tool creates Path objects
          const path = new Path(objData.path, {
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
          ;(path as unknown as { annotationId: string }).annotationId = annotation.id
          canvas.add(path)
        } else if (objType === 'image') {
          // Image annotations (signatures and inserted images)
          const img = new window.Image()
          img.crossOrigin = 'anonymous'
          const annotationIdForImage = annotation.id // Capture for closure
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
            ;(fabricImage as unknown as { annotationId: string }).annotationId = annotationIdForImage
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

  // Update wrapper pointer-events when tool changes to textSelect
  useEffect(() => {
    if (!canvasReady) return
    const canvas = fabricRef.current
    if (!canvas) return

    const wrapper = canvas.wrapperEl
    const upperCanvas = canvas.upperCanvasEl

    // Disable pointer events on annotation layer when textSelect tool is active
    // This allows the text layer underneath to receive events
    const shouldPassThrough = activeTool === 'textSelect'

    if (wrapper) {
      wrapper.style.pointerEvents = shouldPassThrough ? 'none' : 'auto'
      wrapper.style.zIndex = shouldPassThrough ? '5' : '20'
    }
    if (upperCanvas) {
      upperCanvas.style.pointerEvents = shouldPassThrough ? 'none' : 'auto'
    }
  }, [activeTool, canvasReady])

  // Calculate display dimensions
  const displayWidth = width * scale
  const displayHeight = height * scale

  return (
    <canvas
      ref={canvasRef}
      width={displayWidth}
      height={displayHeight}
      className="absolute top-0 left-0 z-10"
      style={{
        width: displayWidth,
        height: displayHeight,
        pointerEvents: activeTool === 'textSelect' ? 'none' : 'auto',
      }}
    />
  )
})
