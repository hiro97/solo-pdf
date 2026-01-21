import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePDFMerge } from '@/components/editor/hooks/usePDFMerge'
import * as fileStore from '@/lib/file-store'
import { PDFDocument, StandardFonts } from 'pdf-lib'

/**
 * Tests for usePDFMerge hook
 *
 * This hook manages the state and orchestration of multi-PDF merge operations,
 * including file validation, reordering, progress tracking, and navigation.
 */

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock file store
vi.mock('@/lib/file-store', () => ({
  storePendingFile: vi.fn(),
  getPendingFile: vi.fn(),
  clearPendingFile: vi.fn(),
}))

// Helper: Create a simple PDF for testing
async function createTestPDF(pageCount: number, text: string = 'Test'): Promise<File> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.addPage([612, 792])
    page.drawText(`${text} - Page ${i + 1}`, {
      x: 50,
      y: 750,
      size: 24,
      font,
    })
  }

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  return new File([blob], `${text.toLowerCase()}.pdf`, { type: 'application/pdf' })
}

// Helper: Create a mock non-PDF file
function createNonPDFFile(name: string, type: string): File {
  return new File(['content'], name, { type })
}

describe('usePDFMerge Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with empty file list', () => {
      const { result } = renderHook(() => usePDFMerge())

      expect(result.current.files).toEqual([])
      expect(result.current.isMerging).toBe(false)
      expect(result.current.progress).toBe(0)
      expect(result.current.error).toBeNull()
    })
  })

  describe('addFiles', () => {
    it('should add valid PDF files', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file1 = await createTestPDF(1, 'Doc1')
      const file2 = await createTestPDF(1, 'Doc2')

      act(() => {
        result.current.addFiles([file1, file2])
      })

      expect(result.current.files).toHaveLength(2)
      expect(result.current.files[0].file.name).toBe('doc1.pdf')
      expect(result.current.files[1].file.name).toBe('doc2.pdf')
    })

    it('should generate unique IDs for each file', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file1 = await createTestPDF(1, 'Doc1')
      const file2 = await createTestPDF(1, 'Doc2')

      act(() => {
        result.current.addFiles([file1, file2])
      })

      const ids = result.current.files.map(f => f.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(2)
      expect(ids[0]).toBeTruthy()
      expect(ids[1]).toBeTruthy()
      expect(ids[0]).not.toBe(ids[1])
    })

    it('should filter out non-PDF files', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const pdfFile = await createTestPDF(1, 'Valid')
      const imageFile = createNonPDFFile('image.jpg', 'image/jpeg')
      const textFile = createNonPDFFile('doc.txt', 'text/plain')

      act(() => {
        result.current.addFiles([pdfFile, imageFile, textFile])
      })

      expect(result.current.files).toHaveLength(1)
      expect(result.current.files[0].file.name).toBe('valid.pdf')
    })

    it('should set correct order for files', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')
      const file3 = await createTestPDF(1, 'Third')

      act(() => {
        result.current.addFiles([file1, file2, file3])
      })

      expect(result.current.files[0].order).toBe(0)
      expect(result.current.files[1].order).toBe(1)
      expect(result.current.files[2].order).toBe(2)
    })

    it('should append to existing files', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')

      act(() => {
        result.current.addFiles([file1])
      })

      expect(result.current.files).toHaveLength(1)

      act(() => {
        result.current.addFiles([file2])
      })

      expect(result.current.files).toHaveLength(2)
      expect(result.current.files[1].file.name).toBe('second.pdf')
    })
  })

  describe('reorderFiles', () => {
    it('should reorder files correctly', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')
      const file3 = await createTestPDF(1, 'Third')

      act(() => {
        result.current.addFiles([file1, file2, file3])
      })

      act(() => {
        result.current.reorderFiles(0, 2)
      })

      expect(result.current.files[0].file.name).toBe('second.pdf')
      expect(result.current.files[1].file.name).toBe('third.pdf')
      expect(result.current.files[2].file.name).toBe('first.pdf')
    })

    it('should update order property after reordering', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')

      act(() => {
        result.current.addFiles([file1, file2])
      })

      act(() => {
        result.current.reorderFiles(0, 1)
      })

      expect(result.current.files[0].order).toBe(0)
      expect(result.current.files[1].order).toBe(1)
    })
  })

  describe('mergePDFs', () => {
    it('should track merge progress', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')

      act(() => {
        result.current.addFiles([file1, file2])
      })

      expect(result.current.progress).toBe(0)

      act(() => {
        result.current.mergePDFs()
      })

      await waitFor(() => {
        expect(result.current.progress).toBeGreaterThan(0)
      })
    })

    it('should set isMerging state correctly', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')

      act(() => {
        result.current.addFiles([file1, file2])
      })

      expect(result.current.isMerging).toBe(false)

      let mergePromise: Promise<void>

      act(() => {
        mergePromise = result.current.mergePDFs()
      })

      expect(result.current.isMerging).toBe(true)

      await act(async () => {
        await mergePromise
      })

      expect(result.current.isMerging).toBe(false)
    })

    it('should store merged PDF in IndexedDB', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')

      act(() => {
        result.current.addFiles([file1, file2])
      })

      await act(async () => {
        await result.current.mergePDFs()
      })

      expect(fileStore.storePendingFile).toHaveBeenCalledTimes(1)
      expect(fileStore.storePendingFile).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining('merged'),
          type: 'application/pdf',
        })
      )
    })

    it('should navigate to editor after successful merge', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')

      act(() => {
        result.current.addFiles([file1, file2])
      })

      await act(async () => {
        await result.current.mergePDFs()
      })

      expect(mockPush).toHaveBeenCalledWith('/editor')
    })

    it('should handle merge errors', async () => {
      const { result } = renderHook(() => usePDFMerge())

      // Add an invalid file that will cause merge to fail
      const invalidFile = createNonPDFFile('invalid.pdf', 'application/pdf')

      act(() => {
        result.current.addFiles([invalidFile])
      })

      await act(async () => {
        await result.current.mergePDFs()
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.isMerging).toBe(false)
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should throw error when merging with no files', async () => {
      const { result } = renderHook(() => usePDFMerge())

      await act(async () => {
        await result.current.mergePDFs()
      })

      expect(result.current.error).toBeTruthy()
    })

    it('should update progress to 100 when complete', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')

      act(() => {
        result.current.addFiles([file1, file2])
      })

      await act(async () => {
        await result.current.mergePDFs()
      })

      expect(result.current.progress).toBe(100)
    })
  })

  describe('cancel', () => {
    it('should reset state on cancel', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')

      act(() => {
        result.current.addFiles([file1, file2])
      })

      expect(result.current.files).toHaveLength(2)

      act(() => {
        result.current.cancel()
      })

      expect(result.current.files).toEqual([])
      expect(result.current.progress).toBe(0)
      expect(result.current.error).toBeNull()
      expect(result.current.isMerging).toBe(false)
    })

    it('should clear error on cancel', async () => {
      const { result } = renderHook(() => usePDFMerge())

      // Trigger an error
      await act(async () => {
        await result.current.mergePDFs()
      })

      expect(result.current.error).toBeTruthy()

      act(() => {
        result.current.cancel()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('should handle single file merge', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file = await createTestPDF(2, 'Single')

      act(() => {
        result.current.addFiles([file])
      })

      await act(async () => {
        await result.current.mergePDFs()
      })

      expect(fileStore.storePendingFile).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/editor')
    })

    it('should handle empty file addition', async () => {
      const { result } = renderHook(() => usePDFMerge())

      act(() => {
        result.current.addFiles([])
      })

      expect(result.current.files).toEqual([])
    })

    it('should handle reorder to same position', async () => {
      const { result } = renderHook(() => usePDFMerge())

      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')

      act(() => {
        result.current.addFiles([file1, file2])
      })

      const beforeOrder = result.current.files.map(f => f.file.name)

      act(() => {
        result.current.reorderFiles(0, 0)
      })

      const afterOrder = result.current.files.map(f => f.file.name)

      expect(afterOrder).toEqual(beforeOrder)
    })
  })
})
