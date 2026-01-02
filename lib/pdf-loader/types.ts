import type { PDFDocument } from 'pdf-lib'
import type { PDFDocumentProxy } from 'pdfjs-dist'

/**
 * PDF 에러 코드 - discriminated union으로 타입 안전성 보장
 */
export type PDFErrorCode =
  | 'PASSWORD_REQUIRED'
  | 'PASSWORD_INCORRECT'
  | 'CORRUPTED_FILE'
  | 'UNSUPPORTED_VERSION'
  | 'LOADING_CANCELLED'
  | 'NETWORK_ERROR'
  | 'DECRYPTION_FAILED'
  | 'SAVE_FAILED'
  | 'UNKNOWN'

/**
 * PDF 에러 인터페이스
 */
export interface PDFError {
  code: PDFErrorCode
  message: string
  userMessage: string
  recoverable: boolean
  originalError?: unknown
}

/**
 * 암호 에러 타입 가드
 */
export function isPasswordError(error: PDFError): boolean {
  return error.code === 'PASSWORD_REQUIRED' || error.code === 'PASSWORD_INCORRECT'
}

/**
 * 암호 입력 결과
 */
export interface PasswordResult {
  password: string | null
  cancelled: boolean
}

/**
 * 암호 입력 프롬프트 함수 타입
 */
export type PasswordPromptFn = (isRetry: boolean) => Promise<PasswordResult>

/**
 * PDF 로드 결과
 */
export interface PDFLoadResult {
  pdfJs: PDFDocumentProxy
  pdfLib: PDFDocument
  isEncrypted: boolean
}

/**
 * PDF 로더 설정
 */
export interface PDFLoaderConfig {
  passwordPromptFn: PasswordPromptFn
  onProgress?: (phase: string, progress: number) => void
}

/**
 * PDF 로딩 상태 - 명시적 상태 머신
 */
export type PDFLoadState =
  | { status: 'idle' }
  | { status: 'loading'; file: File }
  | { status: 'password_required'; file: File; isRetry: boolean }
  | { status: 'decrypting'; file: File }
  | { status: 'processing'; file: File; pdfJs: PDFDocumentProxy }
  | {
      status: 'ready'
      file: File
      pdfLib: PDFDocument
      pdfJs: PDFDocumentProxy
      isEncrypted: boolean
      pageCount: number
    }
  | { status: 'error'; error: PDFError; file?: File }

/**
 * PDF 로딩 액션 - 상태 전이를 위한 디스패치 액션
 */
export type PDFLoadAction =
  | { type: 'START_LOAD'; file: File }
  | { type: 'PASSWORD_NEEDED'; isRetry: boolean }
  | { type: 'SUBMIT_PASSWORD' }
  | { type: 'DECRYPTION_START' }
  | { type: 'PROCESSING'; pdfJs: PDFDocumentProxy }
  | {
      type: 'LOAD_COMPLETE'
      pdfLib: PDFDocument
      pdfJs: PDFDocumentProxy
      isEncrypted: boolean
      pageCount: number
    }
  | { type: 'ERROR'; error: PDFError }
  | { type: 'CANCEL' }
  | { type: 'RESET' }

/**
 * PDF.js onPassword 콜백 reason 상수
 * PDF.js 소스 코드에서 정의된 값
 */
export const PasswordResponses = {
  NEED_PASSWORD: 1,
  INCORRECT_PASSWORD: 2,
} as const

export type PasswordReason = typeof PasswordResponses[keyof typeof PasswordResponses]
