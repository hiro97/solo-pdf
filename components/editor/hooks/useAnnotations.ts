"use client"

import { useState, useCallback, useRef } from 'react'
import type { Annotation, AnnotationStore, ToolType, HistoryAction } from '../types'
import { useHistory } from './useHistory'

interface UseAnnotationsReturn {
  // State
  annotations: AnnotationStore

  // Actions
  addAnnotation: (pageNumber: number, fabricJSON: string, type: ToolType, pageRotation?: number) => string
  removeAnnotation: (pageNumber: number, annotationId: string) => void
  updateAnnotation: (pageNumber: number, annotationId: string, fabricJSON: string) => void
  getPageAnnotations: (pageNumber: number) => Annotation[]
  clearPageAnnotations: (pageNumber: number) => void
  clearAllAnnotations: () => void

  // Serialization
  getAllAnnotationsJSON: () => string
  loadAnnotationsFromJSON: (json: string) => void

  // Undo/Redo
  undoAnnotation: (pageNumber: number) => boolean
  redoAnnotation: (pageNumber: number) => boolean
  canUndo: (pageNumber: number) => boolean
  canRedo: (pageNumber: number) => boolean
}

// Generate unique ID for annotations
const generateId = () => `ann_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

export function useAnnotations(): UseAnnotationsReturn {
  const [annotations, setAnnotations] = useState<AnnotationStore>(new Map())
  const { recordAction, undo, redo, canUndo, canRedo } = useHistory()

  // Ref to access latest annotations in callbacks
  const annotationsRef = useRef<AnnotationStore>(annotations)
  annotationsRef.current = annotations

  // Helper: Get annotation by ID
  const getAnnotationById = useCallback((pageNumber: number, annotationId: string): Annotation | null => {
    const pageAnnotations = annotationsRef.current.get(pageNumber) || []
    return pageAnnotations.find(ann => ann.id === annotationId) || null
  }, [])

  // Internal: Add annotation without recording history
  const addAnnotationDirect = useCallback((annotation: Annotation) => {
    setAnnotations(prev => {
      const newMap = new Map(prev)
      const pageAnnotations = newMap.get(annotation.pageNumber) || []
      newMap.set(annotation.pageNumber, [...pageAnnotations, annotation])
      return newMap
    })
  }, [])

  // Internal: Remove annotation without recording history
  const removeAnnotationDirect = useCallback((pageNumber: number, annotationId: string) => {
    setAnnotations(prev => {
      const newMap = new Map(prev)
      const pageAnnotations = newMap.get(pageNumber) || []
      newMap.set(
        pageNumber,
        pageAnnotations.filter(ann => ann.id !== annotationId)
      )
      return newMap
    })
  }, [])

  // Internal: Update annotation without recording history
  const updateAnnotationDirect = useCallback((pageNumber: number, annotationId: string, fabricJSON: string) => {
    setAnnotations(prev => {
      const newMap = new Map(prev)
      const pageAnnotations = newMap.get(pageNumber) || []
      newMap.set(
        pageNumber,
        pageAnnotations.map(ann =>
          ann.id === annotationId
            ? { ...ann, fabricJSON }
            : ann
        )
      )
      return newMap
    })
  }, [])

  // Add a new annotation to a page (with history)
  const addAnnotation = useCallback((
    pageNumber: number,
    fabricJSON: string,
    type: ToolType,
    pageRotation: number = 0
  ): string => {
    const id = generateId()
    const annotation: Annotation = {
      id,
      type,
      pageNumber,
      fabricJSON,
      createdAt: Date.now(),
      pageRotation,
    }

    // Record for undo
    recordAction({
      type: 'add',
      annotationId: id,
      pageNumber,
      before: null,
      after: annotation,
    })

    setAnnotations(prev => {
      const newMap = new Map(prev)
      const pageAnnotations = newMap.get(pageNumber) || []
      newMap.set(pageNumber, [...pageAnnotations, annotation])
      return newMap
    })

    return id
  }, [recordAction])

  // Remove an annotation from a page (with history)
  const removeAnnotation = useCallback((pageNumber: number, annotationId: string) => {
    const existing = getAnnotationById(pageNumber, annotationId)
    if (existing) {
      // Record for undo
      recordAction({
        type: 'remove',
        annotationId,
        pageNumber,
        before: existing,
        after: null,
      })
    }

    removeAnnotationDirect(pageNumber, annotationId)
  }, [getAnnotationById, recordAction, removeAnnotationDirect])

  // Update an existing annotation (with history)
  const updateAnnotation = useCallback((
    pageNumber: number,
    annotationId: string,
    fabricJSON: string
  ) => {
    const existing = getAnnotationById(pageNumber, annotationId)
    if (existing) {
      // Record for undo
      recordAction({
        type: 'modify',
        annotationId,
        pageNumber,
        before: existing,
        after: { ...existing, fabricJSON },
      })
    }

    updateAnnotationDirect(pageNumber, annotationId, fabricJSON)
  }, [getAnnotationById, recordAction, updateAnnotationDirect])

  // Undo last annotation action
  const undoAnnotation = useCallback((pageNumber: number): boolean => {
    const action = undo(pageNumber)
    if (!action) return false

    switch (action.type) {
      case 'add':
        // Undo add = remove
        removeAnnotationDirect(pageNumber, action.annotationId)
        break
      case 'remove':
        // Undo remove = restore
        if (action.before) {
          addAnnotationDirect(action.before)
        }
        break
      case 'modify':
        // Undo modify = restore previous state
        if (action.before) {
          updateAnnotationDirect(pageNumber, action.annotationId, action.before.fabricJSON)
        }
        break
    }

    return true
  }, [undo, removeAnnotationDirect, addAnnotationDirect, updateAnnotationDirect])

  // Redo last undone action
  const redoAnnotation = useCallback((pageNumber: number): boolean => {
    const action = redo(pageNumber)
    if (!action) return false

    switch (action.type) {
      case 'add':
        // Redo add = add again
        if (action.after) {
          addAnnotationDirect(action.after)
        }
        break
      case 'remove':
        // Redo remove = remove again
        removeAnnotationDirect(pageNumber, action.annotationId)
        break
      case 'modify':
        // Redo modify = apply new state
        if (action.after) {
          updateAnnotationDirect(pageNumber, action.annotationId, action.after.fabricJSON)
        }
        break
    }

    return true
  }, [redo, addAnnotationDirect, removeAnnotationDirect, updateAnnotationDirect])

  // Get annotations for a specific page
  const getPageAnnotations = useCallback((pageNumber: number): Annotation[] => {
    return annotations.get(pageNumber) || []
  }, [annotations])

  // Clear all annotations on a page
  const clearPageAnnotations = useCallback((pageNumber: number) => {
    setAnnotations(prev => {
      const newMap = new Map(prev)
      newMap.delete(pageNumber)
      return newMap
    })
  }, [])

  // Clear all annotations
  const clearAllAnnotations = useCallback(() => {
    setAnnotations(new Map())
  }, [])

  // Serialize all annotations to JSON (for saving)
  const getAllAnnotationsJSON = useCallback((): string => {
    const serializable: Record<number, Annotation[]> = {}
    annotations.forEach((value, key) => {
      serializable[key] = value
    })
    return JSON.stringify(serializable)
  }, [annotations])

  // Load annotations from JSON
  const loadAnnotationsFromJSON = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as Record<number, Annotation[]>
      const newMap = new Map<number, Annotation[]>()
      Object.entries(parsed).forEach(([key, value]) => {
        newMap.set(Number(key), value)
      })
      setAnnotations(newMap)
    } catch (err) {
      console.error('Failed to load annotations:', err)
    }
  }, [])

  return {
    annotations,
    addAnnotation,
    removeAnnotation,
    updateAnnotation,
    getPageAnnotations,
    clearPageAnnotations,
    clearAllAnnotations,
    getAllAnnotationsJSON,
    loadAnnotationsFromJSON,
    undoAnnotation,
    redoAnnotation,
    canUndo,
    canRedo,
  }
}
