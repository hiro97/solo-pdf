import type { PDFLoadState, PDFLoadAction } from './types'

/**
 * PDF 로딩 초기 상태
 */
export const initialPDFLoadState: PDFLoadState = { status: 'idle' }

/**
 * PDF 로딩 상태 리듀서
 *
 * 명시적 상태 머신 패턴으로 구현:
 * - 각 상태에서 허용되는 전이만 처리
 * - 예상치 못한 액션은 현재 상태 유지
 * - 타입 안전성 보장
 */
export function pdfLoadReducer(
  state: PDFLoadState,
  action: PDFLoadAction
): PDFLoadState {
  switch (action.type) {
    case 'START_LOAD':
      // 모든 상태에서 새 로드 시작 가능
      return {
        status: 'loading',
        file: action.file,
      }

    case 'PASSWORD_NEEDED':
      // loading 상태에서만 암호 요청 가능
      if (state.status !== 'loading' && state.status !== 'decrypting') {
        return state
      }
      return {
        status: 'password_required',
        file: state.file,
        isRetry: action.isRetry,
      }

    case 'SUBMIT_PASSWORD':
      // password_required 상태에서만 암호 제출 가능
      if (state.status !== 'password_required') {
        return state
      }
      return {
        status: 'decrypting',
        file: state.file,
      }

    case 'DECRYPTION_START':
      // password_required 상태에서 복호화 시작
      if (state.status !== 'password_required') {
        return state
      }
      return {
        status: 'decrypting',
        file: state.file,
      }

    case 'PROCESSING':
      // loading 또는 decrypting 상태에서 처리 단계로 전환
      if (state.status !== 'loading' && state.status !== 'decrypting') {
        return state
      }
      return {
        status: 'processing',
        file: state.file,
        pdfJs: action.pdfJs,
      }

    case 'LOAD_COMPLETE':
      // 로딩 관련 상태 또는 ready 상태(문서 재로드: 회전, 페이지 삭제 등)에서 완료 가능
      if (
        state.status !== 'loading' &&
        state.status !== 'decrypting' &&
        state.status !== 'processing' &&
        state.status !== 'ready'
      ) {
        return state
      }
      return {
        status: 'ready',
        file: state.file,
        pdfLib: action.pdfLib,
        pdfJs: action.pdfJs,
        isEncrypted: action.isEncrypted,
        pageCount: action.pageCount,
      }

    case 'ERROR':
      // PASSWORD_INCORRECT 에러는 password_required 상태로 전환
      if (action.error.code === 'PASSWORD_INCORRECT') {
        if ('file' in state && state.file) {
          return {
            status: 'password_required',
            file: state.file,
            isRetry: true,
          }
        }
      }

      // 그 외 에러는 에러 상태로 전환
      return {
        status: 'error',
        error: action.error,
        file: 'file' in state ? state.file : undefined,
      }

    case 'CANCEL':
      // 로딩 중인 상태에서만 취소 가능
      if (
        state.status !== 'loading' &&
        state.status !== 'decrypting' &&
        state.status !== 'password_required'
      ) {
        return state
      }
      return { status: 'idle' }

    case 'RESET':
      // 모든 상태에서 초기화 가능
      return { status: 'idle' }

    default:
      // 알 수 없는 액션은 현재 상태 유지
      return state
  }
}

/**
 * 상태에서 파생된 값들을 계산하는 헬퍼
 */
export function deriveLoadStateInfo(state: PDFLoadState) {
  return {
    isLoading:
      state.status === 'loading' ||
      state.status === 'decrypting' ||
      state.status === 'processing',
    needsPassword: state.status === 'password_required',
    isPasswordRetry: state.status === 'password_required' && state.isRetry,
    isReady: state.status === 'ready',
    hasError: state.status === 'error',
    file: 'file' in state ? state.file : null,
    pdfLib: state.status === 'ready' ? state.pdfLib : null,
    pdfJs: state.status === 'ready' || state.status === 'processing' ? state.pdfJs : null,
    pageCount: state.status === 'ready' ? state.pageCount : 0,
    isEncrypted: state.status === 'ready' ? state.isEncrypted : false,
    error: state.status === 'error' ? state.error : null,
  }
}
