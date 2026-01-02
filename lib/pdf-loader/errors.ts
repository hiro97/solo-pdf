import type { PDFError, PDFErrorCode } from './types'

/**
 * 에러 코드별 기본 메시지 및 설정
 */
const ERROR_TEMPLATES: Record<
  PDFErrorCode,
  { message: string; userMessage: string; recoverable: boolean }
> = {
  PASSWORD_REQUIRED: {
    message: 'Password required to open PDF',
    userMessage: '이 PDF는 암호로 보호되어 있습니다. 암호를 입력해 주세요.',
    recoverable: true,
  },
  PASSWORD_INCORRECT: {
    message: 'Incorrect password',
    userMessage: '입력한 암호가 올바르지 않습니다. 다시 시도해 주세요.',
    recoverable: true,
  },
  CORRUPTED_FILE: {
    message: 'PDF file is corrupted',
    userMessage: 'PDF 파일이 손상되어 열 수 없습니다.',
    recoverable: false,
  },
  UNSUPPORTED_VERSION: {
    message: 'Unsupported PDF version',
    userMessage: '지원하지 않는 PDF 버전입니다.',
    recoverable: false,
  },
  LOADING_CANCELLED: {
    message: 'Loading was cancelled',
    userMessage: 'PDF 로딩이 취소되었습니다.',
    recoverable: true,
  },
  NETWORK_ERROR: {
    message: 'Network error while loading PDF',
    userMessage: '네트워크 오류가 발생했습니다. 연결을 확인해 주세요.',
    recoverable: true,
  },
  DECRYPTION_FAILED: {
    message: 'Failed to decrypt PDF',
    userMessage: 'PDF 복호화에 실패했습니다. 파일이 손상되었을 수 있습니다.',
    recoverable: false,
  },
  SAVE_FAILED: {
    message: 'Failed to save PDF',
    userMessage: 'PDF 저장에 실패했습니다.',
    recoverable: true,
  },
  UNKNOWN: {
    message: 'Unknown error',
    userMessage: 'PDF를 처리하는 중 오류가 발생했습니다.',
    recoverable: false,
  },
}

/**
 * PDFError 객체 생성 유틸리티
 */
export function createPDFError(
  code: PDFErrorCode,
  overrideMessage?: string,
  originalError?: unknown
): PDFError {
  const template = ERROR_TEMPLATES[code]
  return {
    code,
    message: overrideMessage || template.message,
    userMessage: template.userMessage,
    recoverable: template.recoverable,
    originalError,
  }
}

/**
 * PDF 로딩 에러 클래스
 * 에러를 PDFError 인터페이스로 변환할 수 있음
 */
export class PDFLoadError extends Error {
  public readonly code: PDFErrorCode
  public readonly originalError?: unknown

  constructor(code: PDFErrorCode, message?: string, originalError?: unknown) {
    const template = ERROR_TEMPLATES[code]
    super(message || template.message)
    this.name = 'PDFLoadError'
    this.code = code
    this.originalError = originalError
  }

  /**
   * PDFError 인터페이스로 변환
   */
  toPDFError(): PDFError {
    return createPDFError(this.code, this.message, this.originalError)
  }
}

/**
 * 알 수 없는 에러를 PDFError로 정규화
 */
export function normalizeError(err: unknown): PDFError {
  // 이미 PDFLoadError인 경우
  if (err instanceof PDFLoadError) {
    return err.toPDFError()
  }

  // 일반 Error인 경우
  if (err instanceof Error) {
    // 암호 관련 메시지 감지 (fallback)
    const message = err.message.toLowerCase()
    if (message.includes('password')) {
      return createPDFError('PASSWORD_REQUIRED', err.message, err)
    }
    if (message.includes('encrypted')) {
      return createPDFError('DECRYPTION_FAILED', err.message, err)
    }
    if (message.includes('corrupt') || message.includes('invalid')) {
      return createPDFError('CORRUPTED_FILE', err.message, err)
    }

    return createPDFError('UNKNOWN', err.message, err)
  }

  // 그 외의 경우
  return createPDFError('UNKNOWN', String(err), err)
}
