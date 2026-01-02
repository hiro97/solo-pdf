// Types
export type {
  PDFErrorCode,
  PDFError,
  PasswordResult,
  PasswordPromptFn,
  PDFLoadResult,
  PDFLoaderConfig,
  PDFLoadState,
  PDFLoadAction,
  PasswordReason,
} from './types'

export { PasswordResponses, isPasswordError } from './types'

// Errors
export { PDFLoadError, createPDFError, normalizeError } from './errors'

// Password Handler
export {
  createPasswordAwareLoadOptions,
  createSimpleLoadOptions,
  PasswordCancelledError,
  type PDFLoadOptions,
} from './password-handler'

// PDF Loader
export { PDFLoader } from './pdf-loader'

// State Machine
export {
  pdfLoadReducer,
  initialPDFLoadState,
  deriveLoadStateInfo,
} from './state-machine'
