"use client"

import type { Canvas as FabricCanvas } from 'fabric'

export interface CanvasRegistryEntry {
  canvas: FabricCanvas
  pageNumber: number
  onAnnotationUpdate: (id: string, fabricJSON: string) => void
}

// Global registry for all active Fabric canvases
const canvasRegistry = new Map<number, CanvasRegistryEntry>()

/**
 * Register a canvas for a specific page
 */
export function registerCanvas(
  pageNumber: number,
  canvas: FabricCanvas,
  onAnnotationUpdate: (id: string, fabricJSON: string) => void
): void {
  canvasRegistry.set(pageNumber, { canvas, pageNumber, onAnnotationUpdate })
  console.log('[CanvasRegistry] Registered canvas for page', pageNumber, '- total:', canvasRegistry.size)
}

/**
 * Unregister a canvas when component unmounts
 */
export function unregisterCanvas(pageNumber: number): void {
  canvasRegistry.delete(pageNumber)
  console.log('[CanvasRegistry] Unregistered canvas for page', pageNumber, '- total:', canvasRegistry.size)
}

/**
 * Sync all canvas objects to annotation store before saving
 * This ensures all current canvas states are captured
 */
export function syncAllCanvasesToAnnotations(): void {
  console.log('[CanvasRegistry] Syncing all canvases, count:', canvasRegistry.size)

  for (const [pageNumber, entry] of canvasRegistry) {
    const { canvas, onAnnotationUpdate } = entry
    const objects = canvas.getObjects()

    console.log(`[CanvasRegistry] Page ${pageNumber}: ${objects.length} objects`)

    for (const obj of objects) {
      const annotationId = (obj as unknown as { annotationId?: string }).annotationId
      if (!annotationId) {
        console.log('[CanvasRegistry] Object without annotationId, skipping')
        continue
      }

      // Determine which extra props to include based on type
      // Normalize type to lowercase for comparison (Fabric.js v7 uses PascalCase)
      const objType = (obj.type || '').toLowerCase()
      const extraProps: string[] = objType === 'i-text' ? ['styles'] :
        objType === 'image' ? ['src'] : []

      // Serialize current object state
      const json = JSON.stringify(
        (obj as unknown as { toObject: (props: string[]) => object }).toObject(extraProps)
      )

      console.log(`[CanvasRegistry] Syncing object ${annotationId}, type: ${objType}, hasExtraProps: ${extraProps.length > 0}`)

      // Update annotation store
      onAnnotationUpdate(annotationId, json)
    }
  }

  console.log('[CanvasRegistry] Sync complete')
}

/**
 * Get canvas annotations directly without triggering React state updates
 * This bypasses the setTimeout race condition by reading canvas state synchronously
 *
 * @returns Map of page number to array of annotation data
 */
export function getCanvasAnnotationsDirectly(): Map<number, Array<{ id: string; json: string }>> {
  console.log('[CanvasRegistry] Getting canvas annotations directly, canvas count:', canvasRegistry.size)

  const result = new Map<number, Array<{ id: string; json: string }>>()

  for (const [pageNumber, entry] of canvasRegistry) {
    const { canvas } = entry
    const objects = canvas.getObjects()
    const pageAnnotations: Array<{ id: string; json: string }> = []

    console.log(`[CanvasRegistry] Page ${pageNumber}: ${objects.length} objects`)

    for (const obj of objects) {
      const annotationId = (obj as unknown as { annotationId?: string }).annotationId
      if (!annotationId) {
        console.log('[CanvasRegistry] Skipping object without annotationId')
        continue
      }

      // Normalize type to lowercase for comparison (Fabric.js v7 uses PascalCase)
      const objType = (obj.type || '').toLowerCase()
      const extraProps: string[] = objType === 'i-text' ? ['styles'] :
        objType === 'image' ? ['src'] : []

      try {
        const json = JSON.stringify(
          (obj as unknown as { toObject: (props: string[]) => object }).toObject(extraProps)
        )

        console.log(`[CanvasRegistry] Captured object ${annotationId}, type: ${objType}, json length: ${json.length}`)
        pageAnnotations.push({ id: annotationId, json })
      } catch (err) {
        console.error(`[CanvasRegistry] Failed to serialize object ${annotationId}:`, err)
      }
    }

    if (pageAnnotations.length > 0) {
      result.set(pageNumber, pageAnnotations)
    }
  }

  console.log('[CanvasRegistry] Direct capture complete, pages with annotations:', result.size)
  return result
}

// Expose globally for debugging
if (typeof window !== 'undefined') {
  (window as unknown as { syncAllCanvasesToAnnotations: typeof syncAllCanvasesToAnnotations }).syncAllCanvasesToAnnotations = syncAllCanvasesToAnnotations
  ;(window as unknown as { getCanvasAnnotationsDirectly: typeof getCanvasAnnotationsDirectly }).getCanvasAnnotationsDirectly = getCanvasAnnotationsDirectly
}
