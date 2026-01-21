"use client"

import { useState } from 'react'
import { GripVertical, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PDFFileInfo } from '@/lib/pdf-merge-utils'

interface MultiFileMergePreviewProps {
  files: PDFFileInfo[]
  isMerging: boolean
  progress: number
  onReorder: (fromIndex: number, toIndex: number) => void
  onMerge: () => void
  onCancel: () => void
}

/**
 * Component for previewing and reordering multiple PDFs before merging
 *
 * Features:
 * - Display list of files with names and sizes
 * - Native HTML5 drag-drop for reordering (following EditorSidebar pattern)
 * - Visual feedback during drag (opacity + border highlight)
 * - Merge progress indicator
 * - Disabled state during merge operation
 */
export function MultiFileMergePreview({
  files,
  isMerging,
  progress,
  onReorder,
  onMerge,
  onCancel,
}: MultiFileMergePreviewProps) {
  // Drag state (following EditorSidebar pattern)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)

  const handleDragStart = (index: number, event: React.DragEvent) => {
    setDraggedIndex(index)
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', index.toString())
    }
  }

  const handleDragOver = (index: number, event: React.DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
    setDropTarget(index)
  }

  const handleDrop = (index: number, event: React.DragEvent) => {
    event.preventDefault()

    // Only reorder if dragging to a different position
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index)
    }

    // Clear drag state
    setDraggedIndex(null)
    setDropTarget(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDropTarget(null)
  }

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const canMerge = files.length >= 2 && !isMerging

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">
            {files.length} PDF{files.length !== 1 ? 's' : ''} selected
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isMerging}
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Select multiple PDFs to merge them
        </p>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-4">
        <ul role="list" className="space-y-2">
          {files.map((fileInfo, index) => {
            const isDragging = draggedIndex === index
            const isDropTarget = dropTarget === index

            return (
              <li
                key={fileInfo.id}
                role="listitem"
                draggable={!isMerging}
                onDragStart={(e) => handleDragStart(index, e)}
                onDragOver={(e) => handleDragOver(index, e)}
                onDrop={(e) => handleDrop(index, e)}
                onDragEnd={handleDragEnd}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                  ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}
                  ${isDropTarget ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                  ${isMerging ? 'cursor-not-allowed' : 'hover:bg-gray-50'}
                `}
              >
                {/* Drag Handle */}
                <div className="flex-shrink-0 text-gray-400">
                  <GripVertical className="h-5 w-5" />
                </div>

                {/* File Icon */}
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-red-500" />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {fileInfo.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileInfo.file.size)}
                  </p>
                </div>

                {/* Order Badge */}
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
                    {index + 1}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>

        {files.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No files selected
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      {isMerging && (
        <div className="px-4 py-3 border-t bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Merging PDFs...</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isMerging}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={onMerge}
          disabled={!canMerge}
          className="flex-1"
        >
          Merge {files.length} PDF{files.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  )
}
