"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { mergePDFs as mergePDFsUtil, type MergeProgress } from '@/lib/pdf-merge'
import { validatePDFFiles, reorderFiles as reorderFilesUtil, type PDFFileInfo } from '@/lib/pdf-merge-utils'
import { storePendingFile } from '@/lib/file-store'

/**
 * Hook for managing multi-PDF merge operations
 *
 * Orchestrates:
 * - File validation and state management
 * - Drag-drop reordering
 * - Merge progress tracking
 * - IndexedDB storage
 * - Navigation to editor
 */
export function usePDFMerge() {
  const router = useRouter()

  // State
  const [files, setFiles] = useState<PDFFileInfo[]>([])
  const [isMerging, setIsMerging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  /**
   * Add files to the merge queue
   * Automatically validates and filters non-PDF files
   */
  const addFiles = useCallback((newFiles: File[]) => {
    const { valid } = validatePDFFiles(newFiles)

    setFiles(prevFiles => {
      // Combine with existing files and update order
      const combined = [...prevFiles, ...valid]
      return combined.map((file, index) => ({
        ...file,
        order: index,
      }))
    })
  }, [])

  /**
   * Reorder files via drag-drop
   * Updates the order of files in the list
   */
  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles(prevFiles => {
      try {
        return reorderFilesUtil(prevFiles, fromIndex, toIndex)
      } catch (err) {
        console.error('Failed to reorder files:', err)
        return prevFiles
      }
    })
  }, [])

  /**
   * Merge all PDFs and navigate to editor
   */
  const mergePDFs = useCallback(async () => {
    if (files.length === 0) {
      setError('No files to merge')
      return
    }

    setIsMerging(true)
    setError(null)
    setProgress(0)

    try {
      // Extract File objects in order
      const fileList = files.map(f => f.file)

      // Merge with progress tracking
      const onProgress = (progressInfo: MergeProgress) => {
        setProgress(progressInfo.percentage)
      }

      const mergedArrayBuffer = await mergePDFsUtil(fileList, onProgress)

      // Create a File object with merged PDF
      const timestamp = Date.now()
      const mergedFile = new File(
        [mergedArrayBuffer],
        `merged-${timestamp}.pdf`,
        { type: 'application/pdf' }
      )

      // Store in IndexedDB
      await storePendingFile(mergedFile)

      // Navigate to editor
      router.push('/editor')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to merge PDFs'
      setError(errorMessage)
      console.error('Merge error:', err)
    } finally {
      setIsMerging(false)
    }
  }, [files, router])

  /**
   * Cancel and reset state
   */
  const cancel = useCallback(() => {
    setFiles([])
    setProgress(0)
    setError(null)
    setIsMerging(false)
  }, [])

  return {
    files,
    isMerging,
    progress,
    error,
    addFiles,
    reorderFiles,
    mergePDFs,
    cancel,
  }
}
