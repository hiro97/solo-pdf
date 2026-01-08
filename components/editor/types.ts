import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { PDFDocument } from 'pdf-lib'

export type ToolType =
  | 'select'
  | 'text'
  | 'draw'
  | 'highlighter'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'textSelect'  // Select and copy text from PDF
  | 'signature'
  | 'image'
  | 'redact'

export interface PDFState {
  file: File | null
  pdfLib: PDFDocument | null
  pdfJs: PDFDocumentProxy | null
  pageCount: number
  currentPage: number
  isLoading: boolean
  error: string | null
}

export interface ZoomState {
  scale: number
  minScale: number
  maxScale: number
}

export interface PageDimensions {
  width: number
  height: number
}

export interface ThumbnailData {
  pageNumber: number
  dataUrl: string
  width: number
  height: number
}

export interface ToolSettings {
  color: string
  strokeWidth: number
  fontSize: number
  fontFamily: string
  // Text formatting
  bold: boolean
  italic: boolean
  underline: boolean
}

export const DEFAULT_TOOL_SETTINGS: ToolSettings = {
  color: '#000000',
  strokeWidth: 2,
  fontSize: 16,
  fontFamily: 'Helvetica',
  bold: false,
  italic: false,
  underline: false,
}

// Annotation types for Fabric.js objects
export interface Annotation {
  id: string
  type: ToolType
  pageNumber: number
  fabricJSON: string  // JSON serialized fabric object
  createdAt: number
  pageRotation?: number  // Rotation angle when annotation was created (0, 90, 180, 270)
}

// Per-page annotation storage
export type AnnotationStore = Map<number, Annotation[]>

// Page rotation tracking (pageIndex -> rotation angle)
export type PageRotationStore = Map<number, number>

// Canvas state for annotation layer
export interface AnnotationLayerState {
  isDrawing: boolean
  startPoint: { x: number; y: number } | null
}

// History action for undo/redo
export interface HistoryAction {
  type: 'add' | 'remove' | 'modify'
  annotationId: string
  pageNumber: number
  before: Annotation | null  // null for 'add'
  after: Annotation | null   // null for 'remove'
}

// Per-page history storage
export interface PageHistory {
  undoStack: HistoryAction[]
  redoStack: HistoryAction[]
}

export type HistoryStore = Map<number, PageHistory>
