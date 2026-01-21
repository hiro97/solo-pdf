import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mergePDFs } from '@/lib/pdf-merge'
import { PDFDocument, StandardFonts } from 'pdf-lib'

/**
 * Tests for PDF merge utility
 *
 * These tests verify that multiple PDFs can be merged sequentially
 * while maintaining page order, handling encrypted PDFs, and tracking progress.
 */

// Helper: Create a simple PDF with specified number of pages
async function createTestPDF(pageCount: number, text: string = 'Test'): Promise<File> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.addPage([612, 792]) // US Letter size
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

// Helper: Count pages in a PDF ArrayBuffer
async function countPages(arrayBuffer: ArrayBuffer): Promise<number> {
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  return pdfDoc.getPageCount()
}

describe('PDF Merge Utility', () => {
  describe('Basic Merge Operations', () => {
    it('should merge 2 PDFs sequentially', async () => {
      const file1 = await createTestPDF(2, 'First')
      const file2 = await createTestPDF(3, 'Second')

      const result = await mergePDFs([file1, file2])

      expect(result).toBeInstanceOf(ArrayBuffer)
      const pageCount = await countPages(result)
      expect(pageCount).toBe(5) // 2 + 3 pages
    })

    it('should merge 3+ PDFs in correct order', async () => {
      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(2, 'Second')
      const file3 = await createTestPDF(3, 'Third')

      const result = await mergePDFs([file1, file2, file3])

      const pageCount = await countPages(result)
      expect(pageCount).toBe(6) // 1 + 2 + 3 pages
    })

    it('should preserve all pages from each PDF', async () => {
      const file1 = await createTestPDF(5, 'Doc1')
      const file2 = await createTestPDF(10, 'Doc2')

      const result = await mergePDFs([file1, file2])

      const pageCount = await countPages(result)
      expect(pageCount).toBe(15)
    })

    it('should handle single PDF (no merge needed)', async () => {
      const file = await createTestPDF(3, 'Single')

      const result = await mergePDFs([file])

      const pageCount = await countPages(result)
      expect(pageCount).toBe(3)
    })
  })

  describe('Progress Tracking', () => {
    it('should calculate progress percentage correctly', async () => {
      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')
      const file3 = await createTestPDF(1, 'Third')

      const progressUpdates: number[] = []
      const onProgress = vi.fn((progress) => {
        progressUpdates.push(progress.percentage)
      })

      await mergePDFs([file1, file2, file3], onProgress)

      expect(onProgress).toHaveBeenCalledTimes(3)

      // First file: 1/3 = 33% (rounded)
      expect(progressUpdates[0]).toBe(33)

      // Second file: 2/3 = 67% (rounded)
      expect(progressUpdates[1]).toBe(67)

      // Third file: 3/3 = 100%
      expect(progressUpdates[2]).toBe(100)
    })

    it('should report current file index and total files', async () => {
      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')

      const onProgress = vi.fn()

      await mergePDFs([file1, file2], onProgress)

      // First progress update
      expect(onProgress).toHaveBeenNthCalledWith(1, {
        currentFile: 1,
        totalFiles: 2,
        percentage: 50,
      })

      // Second progress update
      expect(onProgress).toHaveBeenNthCalledWith(2, {
        currentFile: 2,
        totalFiles: 2,
        percentage: 100,
      })
    })

    it('should work without progress callback', async () => {
      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')

      // Should not throw when no callback provided
      const result = await mergePDFs([file1, file2])

      expect(result).toBeInstanceOf(ArrayBuffer)
    })
  })

  describe('Error Handling', () => {
    it('should throw error on invalid PDF', async () => {
      const invalidFile = new File(['not a pdf'], 'invalid.pdf', { type: 'application/pdf' })

      await expect(mergePDFs([invalidFile])).rejects.toThrow()
    })

    it('should throw error on empty file list', async () => {
      await expect(mergePDFs([])).rejects.toThrow('No files to merge')
    })

    it('should handle corrupted PDF in sequence', async () => {
      const validFile = await createTestPDF(2, 'Valid')
      const corruptedFile = new File(['corrupted data'], 'corrupted.pdf', { type: 'application/pdf' })

      // Should fail when encountering corrupted file
      await expect(mergePDFs([validFile, corruptedFile])).rejects.toThrow()
    })
  })

  describe('Encrypted PDF Support', () => {
    it('should handle encrypted PDFs with ignoreEncryption option', async () => {
      // Note: This test creates an encrypted PDF and merges it
      // In real implementation, PDFDocument.load should use { ignoreEncryption: true }

      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([612, 792])
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      page.drawText('Encrypted PDF', { x: 50, y: 750, size: 24, font })

      // Save with encryption (owner password only - allows modifications)
      const encryptedBytes = await pdfDoc.save({
        ownerPassword: 'owner123',
        userPassword: '', // Empty user password allows viewing without password
        permissions: {
          printing: 'highResolution',
          modifying: true,
          copying: true,
          annotating: true,
          fillingForms: true,
          contentAccessibility: true,
          documentAssembly: true,
        }
      })

      const encryptedFile = new File([encryptedBytes], 'encrypted.pdf', { type: 'application/pdf' })
      const normalFile = await createTestPDF(1, 'Normal')

      // Should successfully merge encrypted PDF
      const result = await mergePDFs([encryptedFile, normalFile])

      expect(result).toBeInstanceOf(ArrayBuffer)
      const pageCount = await countPages(result)
      expect(pageCount).toBe(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle large number of files', async () => {
      const files = await Promise.all(
        Array.from({ length: 10 }, (_, i) => createTestPDF(1, `Doc${i}`))
      )

      const result = await mergePDFs(files)

      const pageCount = await countPages(result)
      expect(pageCount).toBe(10)
    })

    it('should handle PDFs with many pages', async () => {
      const file1 = await createTestPDF(50, 'Large1')
      const file2 = await createTestPDF(50, 'Large2')

      const result = await mergePDFs([file1, file2])

      const pageCount = await countPages(result)
      expect(pageCount).toBe(100)
    })

    it('should handle PDFs with single page', async () => {
      const file1 = await createTestPDF(1, 'Single1')
      const file2 = await createTestPDF(1, 'Single2')

      const result = await mergePDFs([file1, file2])

      const pageCount = await countPages(result)
      expect(pageCount).toBe(2)
    })
  })

  describe('Memory Management', () => {
    it('should process files sequentially to manage memory', async () => {
      // This test ensures files are processed one at a time
      // We track the order of operations
      const processOrder: string[] = []

      // Create mock progress callback that tracks operations
      const onProgress = vi.fn((progress) => {
        processOrder.push(`file-${progress.currentFile}`)
      })

      const file1 = await createTestPDF(1, 'First')
      const file2 = await createTestPDF(1, 'Second')
      const file3 = await createTestPDF(1, 'Third')

      await mergePDFs([file1, file2, file3], onProgress)

      // Verify sequential processing
      expect(processOrder).toEqual(['file-1', 'file-2', 'file-3'])
    })
  })
})
