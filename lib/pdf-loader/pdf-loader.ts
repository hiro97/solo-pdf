import { PDFDocument } from 'pdf-lib'
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from 'pdfjs-dist'
import { pdfjsLib, configurePdfWorker } from '@/lib/pdfjs'
import type { PDFLoaderConfig, PDFLoadResult, PDFError } from './types'
import { PDFLoadError, normalizeError } from './errors'
import { createPasswordAwareLoadOptions, PasswordCancelledError } from './password-handler'

/**
 * PDF 로더 클래스
 *
 * 주요 기능:
 * - AbortController 기반 취소 메커니즘
 * - PDF.js onPassword 콜백을 통한 안정적인 암호 처리
 * - 암호화된 PDF를 이미지 기반으로 변환
 * - 적절한 에러 정규화 및 사용자 피드백
 */
export class PDFLoader {
  private abortController: AbortController | null = null
  private currentLoadingTask: PDFDocumentLoadingTask | null = null
  private config: PDFLoaderConfig

  constructor(config: PDFLoaderConfig) {
    this.config = config
  }

  /**
   * PDF 파일 로드
   *
   * @param file - 로드할 PDF 파일
   * @returns PDF 로드 결과 (pdfJs, pdfLib, isEncrypted)
   * @throws PDFError - 로드 실패 시
   */
  async load(file: File): Promise<PDFLoadResult> {
    // 이전 로드 취소
    this.cancel()

    // 새 AbortController 생성
    this.abortController = new AbortController()
    const signal = this.abortController.signal

    // PDF 워커 설정
    configurePdfWorker()

    try {
      this.config.onProgress?.('reading', 0)

      // 파일 읽기 (취소 가능)
      const arrayBuffer = await this.readFileWithAbort(file, signal)

      if (signal.aborted) {
        throw new PDFLoadError('LOADING_CANCELLED', 'Loading was cancelled')
      }

      this.config.onProgress?.('loading', 30)

      // PDF.js로 로드 (암호 콜백 포함)
      const loadOptions = createPasswordAwareLoadOptions(
        arrayBuffer,
        this.config.passwordPromptFn,
        signal
      )

      this.currentLoadingTask = pdfjsLib.getDocument(loadOptions)

      // 취소 시 로딩 태스크 파괴
      const abortHandler = () => {
        this.currentLoadingTask?.destroy()
      }
      signal.addEventListener('abort', abortHandler)

      let pdfJsDoc: PDFDocumentProxy
      try {
        pdfJsDoc = await this.currentLoadingTask.promise
      } catch (err) {
        // 암호 입력 취소 처리
        if (err instanceof PasswordCancelledError) {
          throw new PDFLoadError('LOADING_CANCELLED', 'Password entry cancelled')
        }
        throw err
      } finally {
        signal.removeEventListener('abort', abortHandler)
        this.currentLoadingTask = null
      }

      if (signal.aborted) {
        pdfJsDoc.destroy()
        throw new PDFLoadError('LOADING_CANCELLED', 'Loading was cancelled')
      }

      this.config.onProgress?.('processing', 60)

      // pdf-lib로 로드 시도
      const { pdfLib, isEncrypted } = await this.loadPdfLib(
        arrayBuffer,
        pdfJsDoc,
        signal
      )

      if (signal.aborted) {
        pdfJsDoc.destroy()
        throw new PDFLoadError('LOADING_CANCELLED', 'Loading was cancelled')
      }

      this.config.onProgress?.('complete', 100)

      return { pdfJs: pdfJsDoc, pdfLib, isEncrypted }
    } catch (err) {
      // 취소된 경우
      if (signal.aborted || (err instanceof PDFLoadError && err.code === 'LOADING_CANCELLED')) {
        throw new PDFLoadError('LOADING_CANCELLED', 'Loading was cancelled')
      }

      // 에러 정규화 및 재throw
      const pdfError = normalizeError(err)
      throw new PDFLoadError(pdfError.code, pdfError.message, err)
    }
  }

  /**
   * 현재 로드 작업 취소
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
    if (this.currentLoadingTask) {
      this.currentLoadingTask.destroy()
      this.currentLoadingTask = null
    }
  }

  /**
   * 리소스 정리
   */
  dispose(): void {
    this.cancel()
  }

  /**
   * 파일을 ArrayBuffer로 읽기 (취소 가능)
   */
  private async readFileWithAbort(file: File, signal: AbortSignal): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      const abortHandler = () => {
        reader.abort()
        reject(new PDFLoadError('LOADING_CANCELLED', 'File reading was cancelled'))
      }

      signal.addEventListener('abort', abortHandler)

      reader.onload = () => {
        signal.removeEventListener('abort', abortHandler)
        resolve(reader.result as ArrayBuffer)
      }

      reader.onerror = () => {
        signal.removeEventListener('abort', abortHandler)
        reject(new PDFLoadError('UNKNOWN', 'Failed to read file'))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * pdf-lib로 PDF 로드
   *
   * 암호화된 PDF는 pdf-lib로 직접 로드할 수 없으므로
   * 이미지 기반으로 변환하여 처리
   */
  private async loadPdfLib(
    arrayBuffer: ArrayBuffer,
    pdfJsDoc: PDFDocumentProxy,
    signal: AbortSignal
  ): Promise<{ pdfLib: PDFDocument; isEncrypted: boolean }> {
    try {
      // 먼저 직접 로드 시도 (비암호화 PDF)
      // ArrayBuffer 복사본 사용 (PDF.js가 원본을 detach할 수 있음)
      const pdfLib = await PDFDocument.load(arrayBuffer.slice(0))
      return { pdfLib, isEncrypted: false }
    } catch (err: unknown) {
      // 암호화 에러인지 확인
      if (err instanceof Error && err.message?.includes('encrypted')) {
        if (signal.aborted) {
          throw new PDFLoadError('LOADING_CANCELLED', 'Loading was cancelled')
        }

        // 암호화된 PDF를 이미지로 렌더링하여 새 PDF 생성
        const pdfLib = await this.renderPdfToImages(pdfJsDoc, signal)
        return { pdfLib, isEncrypted: true }
      }

      throw err
    }
  }

  /**
   * PDF 페이지들을 이미지로 렌더링하여 새 PDF 생성
   *
   * 이 방법은 암호화된 PDF를 편집 가능하게 만드는 유일한 클라이언트 사이드 방법
   * 단점: 텍스트 레이어 손실, 파일 크기 증가
   */
  private async renderPdfToImages(
    pdfJsDoc: PDFDocumentProxy,
    signal: AbortSignal
  ): Promise<PDFDocument> {
    const newPdfDoc = await PDFDocument.create()
    const RENDER_SCALE = 2 // 고품질 렌더링

    for (let pageNum = 1; pageNum <= pdfJsDoc.numPages; pageNum++) {
      if (signal.aborted) {
        throw new PDFLoadError('LOADING_CANCELLED', 'Rendering was cancelled')
      }

      const page = await pdfJsDoc.getPage(pageNum)
      const viewport = page.getViewport({ scale: RENDER_SCALE })

      // 오프스크린 캔버스 생성
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new PDFLoadError('UNKNOWN', 'Failed to create canvas context')
      }

      try {
        // 페이지 렌더링 (PDF.js가 암호화된 콘텐츠를 복호화)
        await page.render({ canvasContext: ctx, viewport, canvas }).promise
      } catch (err) {
        throw new PDFLoadError('DECRYPTION_FAILED', `Failed to render page ${pageNum}`)
      }

      // PNG로 변환
      const pngDataUrl = canvas.toDataURL('image/png')
      const pngBase64 = pngDataUrl.split(',')[1]
      const pngBytes = Uint8Array.from(atob(pngBase64), (c) => c.charCodeAt(0))

      // 새 PDF에 이미지 추가
      const pngImage = await newPdfDoc.embedPng(pngBytes)
      const originalViewport = page.getViewport({ scale: 1 })
      const pdfPage = newPdfDoc.addPage([originalViewport.width, originalViewport.height])
      pdfPage.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: originalViewport.width,
        height: originalViewport.height,
      })

      // 캔버스 정리 (메모리 해제)
      canvas.width = 0
      canvas.height = 0

      // 진행률 업데이트
      const progress = 60 + (pageNum / pdfJsDoc.numPages) * 35
      this.config.onProgress?.('converting', progress)
    }

    return newPdfDoc
  }
}
