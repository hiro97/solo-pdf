import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FileSelectModal } from '@/components/shared/FileSelectModal'
import * as fileStore from '@/lib/file-store'

/**
 * Tests for FileSelectModal multi-file support
 *
 * Tests the enhancement that allows users to select multiple PDFs
 * and shows the merge preview UI when 2+ files are selected.
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

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('FileSelectModal - Multi-file Support', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('File Input', () => {
    it('should have multiple attribute on file input', () => {
      render(<FileSelectModal />)

      const input = screen.getByLabelText(/select pdf/i, { selector: 'input' }) as HTMLInputElement
      expect(input).toHaveAttribute('multiple')
    })

    it('should accept multiple files', () => {
      render(<FileSelectModal />)

      const input = screen.getByLabelText(/select pdf/i, { selector: 'input' }) as HTMLInputElement
      expect(input.multiple).toBe(true)
    })
  })

  describe('Info Message', () => {
    it('should show merge info message', () => {
      render(<FileSelectModal />)

      expect(screen.getByText(/Select multiple PDFs to merge them/i)).toBeInTheDocument()
    })
  })

  describe('Single File Selection', () => {
    it('should navigate to editor directly when 1 file selected', async () => {
      render(<FileSelectModal />)

      const input = screen.getByLabelText(/select pdf/i, { selector: 'input' }) as HTMLInputElement

      // Create a PDF file
      const file = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' })

      // Simulate file selection
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      })
      fireEvent.change(input)

      // Should store file and navigate
      await waitFor(() => {
        expect(fileStore.storePendingFile).toHaveBeenCalledWith(file)
        expect(mockPush).toHaveBeenCalledWith('/editor')
      })
    })

    it('should not show merge preview for single file', async () => {
      render(<FileSelectModal />)

      const input = screen.getByLabelText(/select pdf/i, { selector: 'input' }) as HTMLInputElement
      const file = new File(['pdf content'], 'single.pdf', { type: 'application/pdf' })

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      })
      fireEvent.change(input)

      // Should not show merge preview components
      expect(screen.queryByText(/pdfs selected/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /merge/i })).not.toBeInTheDocument()
    })
  })

  describe('Multiple File Selection', () => {
    it('should show merge preview when 2+ files selected', async () => {
      render(<FileSelectModal />)

      const input = screen.getByLabelText(/select pdf/i, { selector: 'input' }) as HTMLInputElement

      const file1 = new File(['pdf1'], 'doc1.pdf', { type: 'application/pdf' })
      const file2 = new File(['pdf2'], 'doc2.pdf', { type: 'application/pdf' })

      Object.defineProperty(input, 'files', {
        value: [file1, file2],
        writable: false,
      })
      fireEvent.change(input)

      // Should show merge preview
      await waitFor(() => {
        expect(screen.getByText(/2.*pdfs selected/i)).toBeInTheDocument()
      })
    })

    it('should show file names in merge preview', async () => {
      render(<FileSelectModal />)

      const input = screen.getByLabelText(/select pdf/i, { selector: 'input' }) as HTMLInputElement

      const file1 = new File(['pdf1'], 'first.pdf', { type: 'application/pdf' })
      const file2 = new File(['pdf2'], 'second.pdf', { type: 'application/pdf' })

      Object.defineProperty(input, 'files', {
        value: [file1, file2],
        writable: false,
      })
      fireEvent.change(input)

      await waitFor(() => {
        expect(screen.getByText('first.pdf')).toBeInTheDocument()
        expect(screen.getByText('second.pdf')).toBeInTheDocument()
      })
    })

    it('should show merge button for multiple files', async () => {
      render(<FileSelectModal />)

      const input = screen.getByLabelText(/select pdf/i, { selector: 'input' }) as HTMLInputElement

      const file1 = new File(['pdf1'], 'doc1.pdf', { type: 'application/pdf' })
      const file2 = new File(['pdf2'], 'doc2.pdf', { type: 'application/pdf' })
      const file3 = new File(['pdf3'], 'doc3.pdf', { type: 'application/pdf' })

      Object.defineProperty(input, 'files', {
        value: [file1, file2, file3],
        writable: false,
      })
      fireEvent.change(input)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /merge 3 pdfs/i })).toBeInTheDocument()
      })
    })

    it('should not navigate to editor immediately for multiple files', async () => {
      render(<FileSelectModal />)

      const input = screen.getByLabelText(/select pdf/i, { selector: 'input' }) as HTMLInputElement

      const file1 = new File(['pdf1'], 'doc1.pdf', { type: 'application/pdf' })
      const file2 = new File(['pdf2'], 'doc2.pdf', { type: 'application/pdf' })

      Object.defineProperty(input, 'files', {
        value: [file1, file2],
        writable: false,
      })
      fireEvent.change(input)

      // Should NOT navigate immediately
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('File Validation', () => {
    it('should filter out non-PDF files and process valid PDF', async () => {
      render(<FileSelectModal />)

      const input = screen.getByLabelText(/select pdf/i, { selector: 'input' }) as HTMLInputElement

      const pdfFile = new File(['pdf'], 'valid.pdf', { type: 'application/pdf' })
      const imageFile = new File(['img'], 'image.jpg', { type: 'image/jpeg' })
      const textFile = new File(['txt'], 'doc.txt', { type: 'text/plain' })

      Object.defineProperty(input, 'files', {
        value: [pdfFile, imageFile, textFile],
        writable: false,
      })
      fireEvent.change(input)

      // Should process the single valid PDF and navigate to editor
      await waitFor(() => {
        expect(fileStore.storePendingFile).toHaveBeenCalledWith(pdfFile)
        expect(mockPush).toHaveBeenCalledWith('/editor')
      })
    })

    it('should show error for all non-PDF files', async () => {
      render(<FileSelectModal />)

      const input = screen.getByLabelText(/select pdf/i, { selector: 'input' }) as HTMLInputElement

      const imageFile = new File(['img'], 'image.jpg', { type: 'image/jpeg' })

      Object.defineProperty(input, 'files', {
        value: [imageFile],
        writable: false,
      })
      fireEvent.change(input)

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/please select.*pdf/i)).toBeInTheDocument()
      })
    })
  })

  describe('Cancel Merge', () => {
    it('should hide merge preview when cancel is clicked', async () => {
      render(<FileSelectModal />)

      const input = screen.getByLabelText(/select pdf/i, { selector: 'input' }) as HTMLInputElement

      const file1 = new File(['pdf1'], 'doc1.pdf', { type: 'application/pdf' })
      const file2 = new File(['pdf2'], 'doc2.pdf', { type: 'application/pdf' })

      Object.defineProperty(input, 'files', {
        value: [file1, file2],
        writable: false,
      })
      fireEvent.change(input)

      // Wait for merge preview to show
      await waitFor(() => {
        expect(screen.getByText(/2.*pdfs selected/i)).toBeInTheDocument()
      })

      // Click cancel
      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButtons[0])

      // Merge preview should be hidden
      await waitFor(() => {
        expect(screen.queryByText(/pdfs selected/i)).not.toBeInTheDocument()
      })
    })

    it('should show file selector again after cancel', async () => {
      render(<FileSelectModal />)

      const input = screen.getByLabelText(/select pdf/i, { selector: 'input' }) as HTMLInputElement

      const file1 = new File(['pdf1'], 'doc1.pdf', { type: 'application/pdf' })
      const file2 = new File(['pdf2'], 'doc2.pdf', { type: 'application/pdf' })

      Object.defineProperty(input, 'files', {
        value: [file1, file2],
        writable: false,
      })
      fireEvent.change(input)

      await waitFor(() => {
        expect(screen.getByText(/2.*pdfs selected/i)).toBeInTheDocument()
      })

      // Click cancel
      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButtons[0])

      // File selector should be visible again
      await waitFor(() => {
        expect(screen.getByText(/select pdf or drag here/i)).toBeInTheDocument()
      })
    })
  })

  describe('Drag and Drop Multiple Files', () => {
    it('should handle drag-drop of multiple PDF files', async () => {
      render(<FileSelectModal />)

      const dropZone = screen.getByText(/select pdf or drag here/i).closest('label')!

      const file1 = new File(['pdf1'], 'drag1.pdf', { type: 'application/pdf' })
      const file2 = new File(['pdf2'], 'drag2.pdf', { type: 'application/pdf' })

      const dataTransfer = {
        files: [file1, file2],
        types: ['Files'],
      }

      fireEvent.drop(dropZone, { dataTransfer })

      // Should show merge preview
      await waitFor(() => {
        expect(screen.getByText(/2.*pdfs selected/i)).toBeInTheDocument()
      })
    })
  })
})
