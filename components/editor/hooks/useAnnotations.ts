"use client"

import { useState, useCallback, useRef } from 'react'
import type { Annotation, AnnotationStore, ToolType } from '../types'

interface UseAnnotationsReturn {
  // State
  annotations: AnnotationStore

  // Actions
  addAnnotation: (pageNumber: number, fabricJSON: string, type: ToolType) => string
  removeAnnotation: (pageNumber: number, annotationId: string) => void
  updateAnnotation: (pageNumber: number, annotationId: string, fabricJSON: string) => void
  getPageAnnotations: (pageNumber: number) => Annotation[]
  clearPageAnnotations: (pageNumber: number) => void
  clearAllAnnotations: () => void

  // Serialization
  getAllAnnotationsJSON: () => string
  loadAnnotationsFromJSON: (json: string) => void
}

// Generate unique ID for annotations
const generateId = () => `ann_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

export function useAnnotations(): UseAnnotationsReturn {
  const [annotations, setAnnotations] = useState<AnnotationStore>(new Map())

  // Add a new annotation to a page
  const addAnnotation = useCallback((
    pageNumber: number,
    fabricJSON: string,
    type: ToolType
  ): string => {
    const id = generateId()
    const annotation: Annotation = {
      id,
      type,
      pageNumber,
      fabricJSON,
      createdAt: Date.now(),
    }

    setAnnotations(prev => {
      const newMap = new Map(prev)
      const pageAnnotations = newMap.get(pageNumber) || []
      newMap.set(pageNumber, [...pageAnnotations, annotation])
      return newMap
    })

    return id
  }, [])

  // Remove an annotation from a page
  const removeAnnotation = useCallback((pageNumber: number, annotationId: string) => {
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

  // Update an existing annotation
  const updateAnnotation = useCallback((
    pageNumber: number,
    annotationId: string,
    fabricJSON: string
  ) => {
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
  }
}
