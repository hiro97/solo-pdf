"use client"

import { useState, useCallback } from 'react'
import type { HistoryAction, HistoryStore, PageHistory } from '../types'

const MAX_HISTORY_SIZE = 50

interface UseHistoryReturn {
  // Actions
  recordAction: (action: HistoryAction) => void
  undo: (pageNumber: number) => HistoryAction | null
  redo: (pageNumber: number) => HistoryAction | null

  // State queries
  canUndo: (pageNumber: number) => boolean
  canRedo: (pageNumber: number) => boolean

  // Utilities
  clearHistory: (pageNumber?: number) => void
}

const createEmptyPageHistory = (): PageHistory => ({
  undoStack: [],
  redoStack: [],
})

export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<HistoryStore>(new Map())

  // Record a new action (clears redo stack)
  const recordAction = useCallback((action: HistoryAction) => {
    setHistory(prev => {
      const newMap = new Map(prev)
      const pageHistory = newMap.get(action.pageNumber) || createEmptyPageHistory()

      // Add to undo stack, clear redo stack
      const newUndoStack = [...pageHistory.undoStack, action]

      // Limit stack size
      if (newUndoStack.length > MAX_HISTORY_SIZE) {
        newUndoStack.shift()
      }

      newMap.set(action.pageNumber, {
        undoStack: newUndoStack,
        redoStack: [], // Clear redo on new action
      })

      return newMap
    })
  }, [])

  // Undo: pop from undo stack, push to redo stack, return action
  const undo = useCallback((pageNumber: number): HistoryAction | null => {
    let action: HistoryAction | null = null

    setHistory(prev => {
      const newMap = new Map(prev)
      const pageHistory = newMap.get(pageNumber)

      if (!pageHistory || pageHistory.undoStack.length === 0) {
        return prev
      }

      const newUndoStack = [...pageHistory.undoStack]
      action = newUndoStack.pop()!

      newMap.set(pageNumber, {
        undoStack: newUndoStack,
        redoStack: [...pageHistory.redoStack, action],
      })

      return newMap
    })

    return action
  }, [])

  // Redo: pop from redo stack, push to undo stack, return action
  const redo = useCallback((pageNumber: number): HistoryAction | null => {
    let action: HistoryAction | null = null

    setHistory(prev => {
      const newMap = new Map(prev)
      const pageHistory = newMap.get(pageNumber)

      if (!pageHistory || pageHistory.redoStack.length === 0) {
        return prev
      }

      const newRedoStack = [...pageHistory.redoStack]
      action = newRedoStack.pop()!

      newMap.set(pageNumber, {
        undoStack: [...pageHistory.undoStack, action],
        redoStack: newRedoStack,
      })

      return newMap
    })

    return action
  }, [])

  // Check if undo is available
  const canUndo = useCallback((pageNumber: number): boolean => {
    const pageHistory = history.get(pageNumber)
    return pageHistory ? pageHistory.undoStack.length > 0 : false
  }, [history])

  // Check if redo is available
  const canRedo = useCallback((pageNumber: number): boolean => {
    const pageHistory = history.get(pageNumber)
    return pageHistory ? pageHistory.redoStack.length > 0 : false
  }, [history])

  // Clear history for a page or all pages
  const clearHistory = useCallback((pageNumber?: number) => {
    setHistory(prev => {
      if (pageNumber === undefined) {
        return new Map()
      }
      const newMap = new Map(prev)
      newMap.delete(pageNumber)
      return newMap
    })
  }, [])

  return {
    recordAction,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
  }
}
