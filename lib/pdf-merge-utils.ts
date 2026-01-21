/**
 * Utilities for PDF file validation and management
 */

/**
 * Information about a PDF file for merging
 */
export interface PDFFileInfo {
  file: File
  id: string
  order: number
}

/**
 * Result of PDF file validation
 */
export interface ValidationResult {
  valid: PDFFileInfo[]
  invalid: File[]
}

/**
 * Validates an array of files and filters for valid PDF files
 *
 * @param files - Array of files to validate
 * @returns Object containing valid PDFFileInfo array and invalid File array
 */
export function validatePDFFiles(files: File[]): ValidationResult {
  const valid: PDFFileInfo[] = []
  const invalid: File[] = []

  files.forEach((file, index) => {
    // Check if file is a PDF (case-insensitive MIME type check)
    const isPDF = file.type.toLowerCase() === 'application/pdf'

    if (isPDF) {
      valid.push({
        file,
        id: generateUniqueId(),
        order: index,
      })
    } else {
      invalid.push(file)
    }
  })

  // Update order to be sequential for valid files only
  valid.forEach((item, index) => {
    item.order = index
  })

  return { valid, invalid }
}

/**
 * Reorders files by moving a file from one index to another
 *
 * @param files - Array of PDFFileInfo to reorder
 * @param fromIndex - Source index
 * @param toIndex - Destination index
 * @returns New array with reordered files (does not mutate original)
 * @throws Error if indices are out of bounds
 */
export function reorderFiles(
  files: PDFFileInfo[],
  fromIndex: number,
  toIndex: number
): PDFFileInfo[] {
  // Validate indices
  if (fromIndex < 0 || fromIndex >= files.length) {
    throw new Error(`Invalid fromIndex: ${fromIndex}. Must be between 0 and ${files.length - 1}`)
  }
  if (toIndex < 0 || toIndex >= files.length) {
    throw new Error(`Invalid toIndex: ${toIndex}. Must be between 0 and ${files.length - 1}`)
  }

  // Create a copy to avoid mutation
  const result = [...files]

  // Remove the item from the source position
  const [movedItem] = result.splice(fromIndex, 1)

  // Insert it at the destination position
  result.splice(toIndex, 0, movedItem)

  // Update order property for all items
  result.forEach((item, index) => {
    item.order = index
  })

  return result
}

/**
 * Generates a unique ID for a file
 * Uses timestamp + random number for uniqueness
 */
function generateUniqueId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
