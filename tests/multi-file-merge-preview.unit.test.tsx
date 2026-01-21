import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MultiFileMergePreview } from '@/components/shared/MultiFileMergePreview'
import type { PDFFileInfo } from '@/lib/pdf-merge-utils'

/**
 * Tests for MultiFileMergePreview component
 *
 * This component displays a list of PDFs ready for merging with
 * drag-drop reordering capability using native HTML5 APIs.
 */

// Helper: Create mock PDFFileInfo
function createMockFileInfo(name: string, id: string, order: number): PDFFileInfo {
  const file = new File(['content'], name, { type: 'application/pdf' })
  return { file, id, order }
}

describe('MultiFileMergePreview Component', () => {
  const mockOnReorder = vi.fn()
  const mockOnMerge = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    files: [
      createMockFileInfo('doc1.pdf', 'id-1', 0),
      createMockFileInfo('doc2.pdf', 'id-2', 1),
      createMockFileInfo('doc3.pdf', 'id-3', 2),
    ],
    isMerging: false,
    progress: 0,
    onReorder: mockOnReorder,
    onMerge: mockOnMerge,
    onCancel: mockOnCancel,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render list of files with names', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      expect(screen.getByText('doc1.pdf')).toBeInTheDocument()
      expect(screen.getByText('doc2.pdf')).toBeInTheDocument()
      expect(screen.getByText('doc3.pdf')).toBeInTheDocument()
    })

    it('should show file count in header', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      expect(screen.getByText('3 PDFs selected')).toBeInTheDocument()
    })

    it('should show info message', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      expect(screen.getByText(/Select multiple PDFs to merge them/i)).toBeInTheDocument()
    })

    it('should show file sizes', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      // File size should be displayed (files have "content" which is 7 bytes)
      const sizes = screen.getAllByText(/\d+\s*B/i)
      expect(sizes.length).toBeGreaterThan(0)
    })

    it('should render drag handles on each file', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      // GripVertical icons should be present (check by role or test-id)
      const fileItems = screen.getAllByRole('listitem')
      expect(fileItems).toHaveLength(3)
    })
  })

  describe('Drag and Drop', () => {
    it('should have draggable attribute on file items', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      const fileItems = screen.getAllByRole('listitem')
      fileItems.forEach(item => {
        expect(item).toHaveAttribute('draggable', 'true')
      })
    })

    it('should call onReorder when drag-drop occurs', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      const fileItems = screen.getAllByRole('listitem')

      // Simulate dragging first item to third position
      fireEvent.dragStart(fileItems[0])
      fireEvent.dragOver(fileItems[2])
      fireEvent.drop(fileItems[2])

      expect(mockOnReorder).toHaveBeenCalledWith(0, 2)
    })

    it('should apply visual feedback during drag', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      const fileItems = screen.getAllByRole('listitem')

      // Start dragging first item
      fireEvent.dragStart(fileItems[0])

      // Item being dragged should have reduced opacity
      expect(fileItems[0]).toHaveClass('opacity-50')
    })

    it('should highlight drop target during drag over', async () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      const fileItems = screen.getAllByRole('listitem')

      // Start dragging first item
      fireEvent.dragStart(fileItems[0])

      // Drag over second item
      fireEvent.dragOver(fileItems[1])

      // Wait for state update and check border highlight
      await waitFor(() => {
        const updatedItems = screen.getAllByRole('listitem')
        expect(updatedItems[1].className).toContain('border-blue-500')
      })
    })

    it('should clear drag state on drag end', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      const fileItems = screen.getAllByRole('listitem')

      // Start and end drag
      fireEvent.dragStart(fileItems[0])
      fireEvent.dragEnd(fileItems[0])

      // Opacity should be restored
      expect(fileItems[0]).not.toHaveClass('opacity-50')
    })
  })

  describe('Merge Button', () => {
    it('should be enabled when 2+ files present', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      const mergeButton = screen.getByRole('button', { name: /merge.*pdf/i })
      expect(mergeButton).toBeEnabled()
    })

    it('should be disabled when < 2 files', () => {
      const props = {
        ...defaultProps,
        files: [createMockFileInfo('single.pdf', 'id-1', 0)],
      }

      render(<MultiFileMergePreview {...props} />)

      const mergeButton = screen.getByRole('button', { name: /merge.*pdf/i })
      expect(mergeButton).toBeDisabled()
    })

    it('should show file count in button text', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      expect(screen.getByRole('button', { name: /merge 3 pdfs/i })).toBeInTheDocument()
    })

    it('should call onMerge when clicked', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      const mergeButton = screen.getByRole('button', { name: /merge.*pdf/i })
      fireEvent.click(mergeButton)

      expect(mockOnMerge).toHaveBeenCalledTimes(1)
    })
  })

  describe('Cancel Button', () => {
    it('should render cancel button', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
      expect(cancelButtons.length).toBeGreaterThanOrEqual(1)
    })

    it('should call onCancel when clicked', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
      // Click the main cancel button (in actions section)
      fireEvent.click(cancelButtons[cancelButtons.length - 1])

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Progress Indicator', () => {
    it('should show progress bar when merging', () => {
      const props = {
        ...defaultProps,
        isMerging: true,
        progress: 50,
      }

      render(<MultiFileMergePreview {...props} />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should not show progress bar when not merging', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    it('should display progress percentage', () => {
      const props = {
        ...defaultProps,
        isMerging: true,
        progress: 75,
      }

      render(<MultiFileMergePreview {...props} />)

      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should disable interactions during merge', () => {
      const props = {
        ...defaultProps,
        isMerging: true,
        progress: 50,
      }

      render(<MultiFileMergePreview {...props} />)

      const mergeButton = screen.getByRole('button', { name: /merge.*pdf/i })
      expect(mergeButton).toBeDisabled()

      const fileItems = screen.getAllByRole('listitem')
      fileItems.forEach(item => {
        expect(item).toHaveAttribute('draggable', 'false')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty file list', () => {
      const props = {
        ...defaultProps,
        files: [],
      }

      render(<MultiFileMergePreview {...props} />)

      expect(screen.getByText('0 PDFs selected')).toBeInTheDocument()
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })

    it('should handle single file', () => {
      const props = {
        ...defaultProps,
        files: [createMockFileInfo('single.pdf', 'id-1', 0)],
      }

      render(<MultiFileMergePreview {...props} />)

      expect(screen.getByText('1 PDF selected')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(1)
    })

    it('should handle large file names', () => {
      const longName = 'very-long-file-name-that-might-cause-layout-issues-in-the-ui-component.pdf'
      const props = {
        ...defaultProps,
        files: [createMockFileInfo(longName, 'id-1', 0)],
      }

      render(<MultiFileMergePreview {...props} />)

      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('should handle drag without drop', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      const fileItems = screen.getAllByRole('listitem')

      // Start drag but don't drop
      fireEvent.dragStart(fileItems[0])
      fireEvent.dragEnd(fileItems[0])

      // Should not call onReorder
      expect(mockOnReorder).not.toHaveBeenCalled()
    })

    it('should not call onReorder when dropping on same position', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      const fileItems = screen.getAllByRole('listitem')

      // Drag and drop on same item
      fireEvent.dragStart(fileItems[0])
      fireEvent.dragOver(fileItems[0])
      fireEvent.drop(fileItems[0])

      // Should not trigger reorder
      expect(mockOnReorder).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(3)
    })

    it('should have accessible button labels', () => {
      render(<MultiFileMergePreview {...defaultProps} />)

      expect(screen.getByRole('button', { name: /merge 3 pdfs/i })).toBeInTheDocument()
      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
      expect(cancelButtons.length).toBeGreaterThanOrEqual(1)
    })
  })
})
