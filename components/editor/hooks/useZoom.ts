"use client"

import { useState, useCallback } from 'react'
import type { ZoomState, PageDimensions } from '../types'

const ZOOM_STEP = 1.25
const MIN_SCALE = 0.25
const MAX_SCALE = 4

const initialState: ZoomState = {
  scale: 1,
  minScale: MIN_SCALE,
  maxScale: MAX_SCALE,
}

export function useZoom() {
  const [state, setState] = useState<ZoomState>(initialState)

  const zoomIn = useCallback(() => {
    setState(prev => ({
      ...prev,
      scale: Math.min(prev.scale * ZOOM_STEP, MAX_SCALE),
    }))
  }, [])

  const zoomOut = useCallback(() => {
    setState(prev => ({
      ...prev,
      scale: Math.max(prev.scale / ZOOM_STEP, MIN_SCALE),
    }))
  }, [])

  const zoomTo = useCallback((scale: number) => {
    setState(prev => ({
      ...prev,
      scale: Math.max(MIN_SCALE, Math.min(scale, MAX_SCALE)),
    }))
  }, [])

  const fitToWidth = useCallback((containerWidth: number, pageWidth: number) => {
    const newScale = (containerWidth - 48) / pageWidth // 48px for padding
    setState(prev => ({
      ...prev,
      scale: Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE)),
    }))
  }, [])

  const fitToPage = useCallback(
    (containerSize: { width: number; height: number }, pageSize: PageDimensions) => {
      const scaleX = (containerSize.width - 48) / pageSize.width
      const scaleY = (containerSize.height - 48) / pageSize.height
      const newScale = Math.min(scaleX, scaleY)
      setState(prev => ({
        ...prev,
        scale: Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE)),
      }))
    },
    []
  )

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    ...state,
    zoomIn,
    zoomOut,
    zoomTo,
    fitToWidth,
    fitToPage,
    reset,
  }
}
