import { describe, it, expect } from 'vitest'
import { validatePDFFiles, reorderFiles, type PDFFileInfo } from '@/lib/pdf-merge-utils'

/**
 * Tests for PDF validation and file management utilities
 *
 * These tests verify file validation, unique ID generation,
 * and reordering logic for the multi-PDF merge feature.
 */

// Helper: Create a mock File
function createMockFile(name: string, type: string = 'application/pdf'): File {
  return new File(['content'], name, { type })
}

describe('PDF Validation Utilities', () => {
  describe('validatePDFFiles', () => {
    it('should accept array of PDF files', () => {
      const files = [
        createMockFile('doc1.pdf'),
        createMockFile('doc2.pdf'),
        createMockFile('doc3.pdf'),
      ]

      const result = validatePDFFiles(files)

      expect(result.valid).toHaveLength(3)
      expect(result.invalid).toHaveLength(0)
    })

    it('should reject non-PDF files', () => {
      const files = [
        createMockFile('doc.pdf', 'application/pdf'),
        createMockFile('image.jpg', 'image/jpeg'),
        createMockFile('document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
      ]

      const result = validatePDFFiles(files)

      expect(result.valid).toHaveLength(1)
      expect(result.invalid).toHaveLength(2)
      expect(result.invalid[0].name).toBe('image.jpg')
      expect(result.invalid[1].name).toBe('document.docx')
    })

    it('should validate file type for each file', () => {
      const files = [
        createMockFile('valid.pdf', 'application/pdf'),
        createMockFile('also-valid.PDF', 'application/pdf'),
        createMockFile('invalid.txt', 'text/plain'),
      ]

      const result = validatePDFFiles(files)

      expect(result.valid).toHaveLength(2)
      expect(result.invalid).toHaveLength(1)
    })

    it('should maintain file order', () => {
      const files = [
        createMockFile('first.pdf'),
        createMockFile('second.pdf'),
        createMockFile('third.pdf'),
      ]

      const result = validatePDFFiles(files)

      expect(result.valid[0].file.name).toBe('first.pdf')
      expect(result.valid[1].file.name).toBe('second.pdf')
      expect(result.valid[2].file.name).toBe('third.pdf')
    })

    it('should generate unique IDs for files', () => {
      const files = [
        createMockFile('doc1.pdf'),
        createMockFile('doc2.pdf'),
        createMockFile('doc3.pdf'),
      ]

      const result = validatePDFFiles(files)

      const ids = result.valid.map(f => f.id)
      const uniqueIds = new Set(ids)

      // All IDs should be unique
      expect(uniqueIds.size).toBe(3)

      // IDs should be non-empty strings
      ids.forEach(id => {
        expect(id).toBeTruthy()
        expect(typeof id).toBe('string')
      })
    })

    it('should set order field correctly', () => {
      const files = [
        createMockFile('first.pdf'),
        createMockFile('second.pdf'),
        createMockFile('third.pdf'),
      ]

      const result = validatePDFFiles(files)

      expect(result.valid[0].order).toBe(0)
      expect(result.valid[1].order).toBe(1)
      expect(result.valid[2].order).toBe(2)
    })

    it('should handle empty file list', () => {
      const result = validatePDFFiles([])

      expect(result.valid).toHaveLength(0)
      expect(result.invalid).toHaveLength(0)
    })

    it('should handle all invalid files', () => {
      const files = [
        createMockFile('image.png', 'image/png'),
        createMockFile('video.mp4', 'video/mp4'),
      ]

      const result = validatePDFFiles(files)

      expect(result.valid).toHaveLength(0)
      expect(result.invalid).toHaveLength(2)
    })

    it('should accept PDF files with case-insensitive MIME type', () => {
      const files = [
        createMockFile('doc1.pdf', 'application/pdf'),
        createMockFile('doc2.pdf', 'application/PDF'),
        createMockFile('doc3.pdf', 'Application/Pdf'),
      ]

      const result = validatePDFFiles(files)

      expect(result.valid).toHaveLength(3)
      expect(result.invalid).toHaveLength(0)
    })
  })

  describe('reorderFiles', () => {
    let testFiles: PDFFileInfo[]

    beforeEach(() => {
      testFiles = [
        { file: createMockFile('first.pdf'), id: 'id-1', order: 0 },
        { file: createMockFile('second.pdf'), id: 'id-2', order: 1 },
        { file: createMockFile('third.pdf'), id: 'id-3', order: 2 },
        { file: createMockFile('fourth.pdf'), id: 'id-4', order: 3 },
      ]
    })

    it('should reorder files from index 0 to 2', () => {
      const result = reorderFiles(testFiles, 0, 2)

      expect(result[0].file.name).toBe('second.pdf')
      expect(result[1].file.name).toBe('third.pdf')
      expect(result[2].file.name).toBe('first.pdf')
      expect(result[3].file.name).toBe('fourth.pdf')
    })

    it('should reorder files from index 3 to 0', () => {
      const result = reorderFiles(testFiles, 3, 0)

      expect(result[0].file.name).toBe('fourth.pdf')
      expect(result[1].file.name).toBe('first.pdf')
      expect(result[2].file.name).toBe('second.pdf')
      expect(result[3].file.name).toBe('third.pdf')
    })

    it('should reorder files from index 1 to 3', () => {
      const result = reorderFiles(testFiles, 1, 3)

      expect(result[0].file.name).toBe('first.pdf')
      expect(result[1].file.name).toBe('third.pdf')
      expect(result[2].file.name).toBe('fourth.pdf')
      expect(result[3].file.name).toBe('second.pdf')
    })

    it('should handle reordering to same position', () => {
      const result = reorderFiles(testFiles, 1, 1)

      expect(result[0].file.name).toBe('first.pdf')
      expect(result[1].file.name).toBe('second.pdf')
      expect(result[2].file.name).toBe('third.pdf')
      expect(result[3].file.name).toBe('fourth.pdf')
    })

    it('should update order property after reordering', () => {
      const result = reorderFiles(testFiles, 0, 2)

      expect(result[0].order).toBe(0)
      expect(result[1].order).toBe(1)
      expect(result[2].order).toBe(2)
      expect(result[3].order).toBe(3)
    })

    it('should not mutate original array', () => {
      const originalOrder = testFiles.map(f => f.file.name)

      reorderFiles(testFiles, 0, 2)

      const afterOrder = testFiles.map(f => f.file.name)
      expect(afterOrder).toEqual(originalOrder)
    })

    it('should preserve file IDs after reordering', () => {
      const originalIds = testFiles.map(f => f.id)

      const result = reorderFiles(testFiles, 1, 3)

      const resultIds = result.map(f => f.id)

      // Same IDs should exist (just in different order)
      expect(new Set(resultIds)).toEqual(new Set(originalIds))
    })

    it('should handle two-file reordering', () => {
      const twoFiles: PDFFileInfo[] = [
        { file: createMockFile('first.pdf'), id: 'id-1', order: 0 },
        { file: createMockFile('second.pdf'), id: 'id-2', order: 1 },
      ]

      const result = reorderFiles(twoFiles, 0, 1)

      expect(result[0].file.name).toBe('second.pdf')
      expect(result[1].file.name).toBe('first.pdf')
    })

    it('should throw error for invalid fromIndex', () => {
      expect(() => reorderFiles(testFiles, -1, 2)).toThrow()
      expect(() => reorderFiles(testFiles, 10, 2)).toThrow()
    })

    it('should throw error for invalid toIndex', () => {
      expect(() => reorderFiles(testFiles, 0, -1)).toThrow()
      expect(() => reorderFiles(testFiles, 0, 10)).toThrow()
    })
  })

  describe('Integration: Validate and Reorder', () => {
    it('should work together in a typical workflow', () => {
      // Step 1: User selects files (some invalid)
      const files = [
        createMockFile('doc1.pdf'),
        createMockFile('image.jpg', 'image/jpeg'),
        createMockFile('doc2.pdf'),
        createMockFile('doc3.pdf'),
      ]

      // Step 2: Validate files
      const { valid, invalid } = validatePDFFiles(files)

      expect(valid).toHaveLength(3)
      expect(invalid).toHaveLength(1)

      // Step 3: User reorders valid files (drag first to last)
      const reordered = reorderFiles(valid, 0, 2)

      expect(reordered[0].file.name).toBe('doc2.pdf')
      expect(reordered[1].file.name).toBe('doc3.pdf')
      expect(reordered[2].file.name).toBe('doc1.pdf')

      // Step 4: Order property is updated
      expect(reordered[0].order).toBe(0)
      expect(reordered[1].order).toBe(1)
      expect(reordered[2].order).toBe(2)
    })
  })
})
