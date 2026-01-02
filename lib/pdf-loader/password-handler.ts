import type { PasswordPromptFn, PasswordReason } from './types'
import { PasswordResponses } from './types'
import { PDFLoadError } from './errors'

/**
 * PDF.js 문서 로드 옵션 (onPassword 콜백 포함)
 * pdfjs-dist 타입 정의에 onPassword가 누락되어 있어 직접 정의
 */
export interface PDFLoadOptions {
  data: ArrayBuffer
  useWorkerFetch?: boolean
  isEvalSupported?: boolean
  useSystemFonts?: boolean
  password?: string
  cMapUrl?: string
  cMapPacked?: boolean
  standardFontDataUrl?: string
  onPassword?: (
    updatePassword: (password: string | Error) => void,
    reason: number
  ) => void
}

/**
 * 암호 입력 취소를 나타내는 에러
 */
export class PasswordCancelledError extends Error {
  constructor() {
    super('Password entry cancelled')
    this.name = 'PasswordCancelledError'
  }
}

/**
 * PDF.js 문서 옵션 생성 (암호 콜백 포함)
 *
 * 핵심 개선사항:
 * - 기존: catch 블록에서 PasswordException 에러 이름으로 판별 (minified 빌드에서 불안정)
 * - 개선: PDF.js 공식 onPassword 콜백 API 사용 (항상 안정적)
 *
 * @param data - PDF 파일의 ArrayBuffer
 * @param passwordPromptFn - 암호 입력을 요청하는 함수
 * @param signal - AbortController signal (취소용)
 */
export function createPasswordAwareLoadOptions(
  data: ArrayBuffer,
  passwordPromptFn: PasswordPromptFn,
  signal?: AbortSignal
): PDFLoadOptions {
  return {
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
    cMapUrl: '/pdfjs/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: '/pdfjs/standard_fonts/',

    /**
     * PDF.js 공식 onPassword 콜백
     *
     * 이 콜백은 PDF가 암호로 보호된 경우 호출됨
     * - reason === 1: 암호 필요 (첫 시도)
     * - reason === 2: 암호 틀림 (재시도)
     *
     * updatePassword를 호출하여 암호 제출 또는 에러 전달
     */
    onPassword: (
      updatePassword: (password: string | Error) => void,
      reason: number
    ) => {
      // 이미 취소된 경우
      if (signal?.aborted) {
        updatePassword(new PDFLoadError('LOADING_CANCELLED', 'Operation cancelled'))
        return
      }

      const isRetry = reason === PasswordResponses.INCORRECT_PASSWORD

      // 비동기로 암호 입력 요청
      passwordPromptFn(isRetry)
        .then((result) => {
          // 취소 확인
          if (signal?.aborted) {
            updatePassword(new PDFLoadError('LOADING_CANCELLED', 'Operation cancelled'))
            return
          }

          // 사용자가 취소한 경우
          if (result.cancelled) {
            updatePassword(new PasswordCancelledError())
            return
          }

          // 암호가 없는 경우
          if (!result.password) {
            updatePassword(new PDFLoadError('PASSWORD_REQUIRED', 'No password provided'))
            return
          }

          // 암호 제출
          updatePassword(result.password)
        })
        .catch((err) => {
          // Promise 에러 처리
          updatePassword(
            err instanceof Error
              ? err
              : new PDFLoadError('UNKNOWN', String(err))
          )
        })
    },
  }
}

/**
 * 간단한 암호 옵션 생성 (콜백 없이 직접 암호 전달)
 *
 * 이미 암호를 알고 있는 경우 사용
 */
export function createSimpleLoadOptions(
  data: ArrayBuffer,
  password?: string
): PDFLoadOptions {
  return {
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
    password,
    cMapUrl: '/pdfjs/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: '/pdfjs/standard_fonts/',
  }
}
