"use client"

import { useState, useCallback, useReducer, useRef, useEffect } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import { toast } from 'sonner'
import type { AnnotationStore } from '../types'
import { pdfjsLib, configurePdfWorker, type PDFDocumentProxy } from '@/lib/pdfjs'
import {
  PDFLoader,
  pdfLoadReducer,
  initialPDFLoadState,
  deriveLoadStateInfo,
  PDFLoadError,
  type PasswordResult,
} from '@/lib/pdf-loader'
import {
  PDFSaveManager,
  downloadPDF,
  type SaveResult,
  type AnnotationsByPage,
} from '@/lib/pdf-save'

// 워커 초기 설정
configurePdfWorker()

// Direct canvas data 타입 (React 상태 race condition 우회용)
type DirectCanvasData = Map<number, Array<{ id: string; json: string }>>

/**
 * 암호 프롬프트 상태
 */
interface PasswordPromptState {
  isOpen: boolean
  isRetry: boolean
  resolve: ((result: PasswordResult) => void) | null
}

/**
 * PDF 문서 관리 훅
 *
 * 주요 개선사항:
 * - useReducer 기반 상태 머신으로 명확한 상태 관리
 * - PDFLoader 클래스로 로딩 로직 분리
 * - PDF.js onPassword 콜백으로 안정적인 암호 처리
 * - AbortController로 취소 메커니즘 구현
 * - 모든 작업에 에러 처리 및 토스트 알림
 */
export function usePDFDocument() {
  // 상태 머신 (로딩 상태)
  const [loadState, dispatch] = useReducer(pdfLoadReducer, initialPDFLoadState)

  // 현재 페이지 (별도 상태로 관리)
  const [currentPage, setCurrentPage] = useState(1)

  // 문서 버전 (회전, 순서변경 등 PDF 수정 시 증가하여 캐시 무효화에 사용)
  const [documentVersion, setDocumentVersion] = useState(0)

  // 페이지 회전 상태 추적 (페이지 인덱스 → 회전 각도)
  const [pageRotations, setPageRotations] = useState<Map<number, number>>(new Map())

  // 암호 프롬프트 상태
  const [passwordPrompt, setPasswordPrompt] = useState<PasswordPromptState>({
    isOpen: false,
    isRetry: false,
    resolve: null,
  })
  const [passwordFallback, setPasswordFallback] = useState({
    isOpen: false,
    isRetry: false,
  })
  const passwordFallbackFileRef = useRef<File | null>(null)

  // PDF 로더 인스턴스 참조
  const loaderRef = useRef<PDFLoader | null>(null)

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      loaderRef.current?.dispose()
    }
  }, [])

  /**
   * 암호 입력 요청 함수 (PDFLoader에 전달)
   * Promise를 반환하고, UI에서 resolve
   */
  const promptForPassword = useCallback((isRetry: boolean): Promise<PasswordResult> => {
    return new Promise((resolve) => {
      setPasswordPrompt({
        isOpen: true,
        isRetry,
        resolve,
      })
      dispatch({ type: 'PASSWORD_NEEDED', isRetry })
    })
  }, [])

  /**
   * PDF 파일 로드
   */
  const loadPDF = useCallback(async (file: File, password?: string) => {
    // 이전 로더 정리
    loaderRef.current?.dispose()
    setPasswordFallback({ isOpen: false, isRetry: false })
    passwordFallbackFileRef.current = null

    dispatch({ type: 'START_LOAD', file })

    // 새 로더 생성
    const loader = new PDFLoader({
      passwordPromptFn: promptForPassword,
      onProgress: (_phase, _progress) => {
        // 필요시 진행률 UI 업데이트
      },
    })
    loaderRef.current = loader

    try {
      const result = await loader.load(file, password)

      dispatch({
        type: 'LOAD_COMPLETE',
        pdfLib: result.pdfLib,
        pdfJs: result.pdfJs,
        isEncrypted: result.isEncrypted,
        pageCount: result.pdfJs.numPages,
      })

      setCurrentPage(1)
      setPageRotations(new Map()) // 새 문서 로드 시 회전 상태 초기화

      // 암호화된 PDF 안내
      if (result.isEncrypted) {
        toast.warning('암호화된 PDF', {
          description: '이미지 기반으로 변환되어 텍스트 선택이 제한될 수 있습니다.',
        })
      }
    } catch (err) {
      // 취소된 경우 조용히 처리
      if (err instanceof PDFLoadError && err.code === 'LOADING_CANCELLED') {
        dispatch({ type: 'CANCEL' })
        return
      }

      // 에러 처리
      const pdfError = err instanceof PDFLoadError ? err.toPDFError() : {
        code: 'UNKNOWN' as const,
        message: String(err),
        userMessage: 'PDF를 열 수 없습니다.',
        recoverable: false,
      }

      dispatch({ type: 'ERROR', error: pdfError })
      if (pdfError.code === 'PASSWORD_REQUIRED' || pdfError.code === 'PASSWORD_INCORRECT') {
        passwordFallbackFileRef.current = file
        setPasswordFallback({
          isOpen: true,
          isRetry: pdfError.code === 'PASSWORD_INCORRECT',
        })
      }

      // 암호 에러가 아닌 경우만 토스트 표시
      if (pdfError.code !== 'PASSWORD_REQUIRED' && pdfError.code !== 'PASSWORD_INCORRECT') {
        toast.error('PDF 열기 실패', {
          description: pdfError.userMessage,
        })
      }
    }
  }, [promptForPassword])

  /**
   * 암호 제출 (UI에서 호출)
   */
  const submitPassword = useCallback((password: string) => {
    if (passwordPrompt.resolve) {
      passwordPrompt.resolve({ password, cancelled: false })
      setPasswordPrompt({ isOpen: false, isRetry: false, resolve: null })
      dispatch({ type: 'SUBMIT_PASSWORD' })
      return
    }

    if (passwordFallback.isOpen && passwordFallbackFileRef.current) {
      const retryFile = passwordFallbackFileRef.current
      setPasswordFallback({ isOpen: false, isRetry: false })
      passwordFallbackFileRef.current = null
      loadPDF(retryFile, password)
    }
  }, [passwordPrompt.resolve, passwordFallback.isOpen, loadPDF])

  /**
   * 암호 입력 취소
   */
  const cancelPasswordPrompt = useCallback(() => {
    if (passwordPrompt.resolve) {
      passwordPrompt.resolve({ password: null, cancelled: true })
      setPasswordPrompt({ isOpen: false, isRetry: false, resolve: null })
      loaderRef.current?.cancel()
      dispatch({ type: 'CANCEL' })
      return
    }
    if (passwordFallback.isOpen) {
      setPasswordFallback({ isOpen: false, isRetry: false })
      passwordFallbackFileRef.current = null
      dispatch({ type: 'RESET' })
    }
  }, [passwordPrompt.resolve, passwordFallback.isOpen])

  /**
   * 페이지 이동
   */
  const goToPage = useCallback((pageNumber: number) => {
    const derived = deriveLoadStateInfo(loadState)
    const clampedPage = Math.max(1, Math.min(pageNumber, derived.pageCount))
    setCurrentPage(clampedPage)
  }, [loadState])

  const nextPage = useCallback(() => {
    const derived = deriveLoadStateInfo(loadState)
    setCurrentPage((prev) => Math.min(prev + 1, derived.pageCount))
  }, [loadState])

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }, [])

  /**
   * 페이지 회전 (에러 처리 포함)
   */
  const rotatePage = useCallback(async (pageIndex: number, rotationDegrees: 90 | 180 | 270) => {
    const derived = deriveLoadStateInfo(loadState)
    if (!derived.pdfLib) return

    try {
      console.log('[rotatePage] Rotating page at 0-based index:', pageIndex, 'Total pages:', derived.pageCount)
      const page = derived.pdfLib.getPage(pageIndex)
      const currentRotation = page.getRotation().angle
      const newAngle = (currentRotation + rotationDegrees) % 360
      console.log('[rotatePage] Current rotation:', currentRotation, 'New rotation:', newAngle)
      page.setRotation(degrees(newAngle))

      // PDF.js 문서 다시 로드
      const pdfBytes = await derived.pdfLib.save()
      const loadingTask = pdfjsLib.getDocument({
        data: pdfBytes,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        cMapUrl: '/pdfjs/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/pdfjs/standard_fonts/',
      })
      const pdfJsDoc = await loadingTask.promise

      dispatch({
        type: 'LOAD_COMPLETE',
        pdfLib: derived.pdfLib,
        pdfJs: pdfJsDoc,
        isEncrypted: derived.isEncrypted,
        pageCount: pdfJsDoc.numPages,
      })

      // 회전 각도 추적 (어노테이션 변환에 사용)
      setPageRotations(prev => {
        const newMap = new Map(prev)
        newMap.set(pageIndex, newAngle)
        return newMap
      })

      // 버전 증가 (캐시 무효화 트리거)
      setDocumentVersion(v => v + 1)
    } catch (err) {
      console.error('Failed to rotate page:', err)
      toast.error('페이지 회전 실패')
    }
  }, [loadState])

  /**
   * 페이지 삭제 (에러 처리 포함)
   */
  const deletePage = useCallback(async (pageIndex: number) => {
    const derived = deriveLoadStateInfo(loadState)
    if (!derived.pdfLib || derived.pageCount <= 1) return

    try {
      derived.pdfLib.removePage(pageIndex)

      // PDF.js 문서 다시 로드
      const pdfBytes = await derived.pdfLib.save()
      const loadingTask = pdfjsLib.getDocument({
        data: pdfBytes,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        cMapUrl: '/pdfjs/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/pdfjs/standard_fonts/',
      })
      const pdfJsDoc = await loadingTask.promise

      dispatch({
        type: 'LOAD_COMPLETE',
        pdfLib: derived.pdfLib,
        pdfJs: pdfJsDoc,
        isEncrypted: derived.isEncrypted,
        pageCount: pdfJsDoc.numPages,
      })

      // 현재 페이지 조정
      setCurrentPage((prev) => Math.min(prev, pdfJsDoc.numPages))

      // 회전 상태 업데이트 - 삭제된 페이지 제거 및 이후 페이지 인덱스 조정
      setPageRotations(prev => {
        const newMap = new Map(prev)
        newMap.delete(pageIndex)

        // Shift indices for pages after deleted page
        for (let i = pageIndex + 1; i < derived.pageCount; i++) {
          const rotation = newMap.get(i)
          if (rotation !== undefined) {
            newMap.delete(i)
            newMap.set(i - 1, rotation)
          }
        }

        return newMap
      })

      // 버전 증가 (캐시 무효화 트리거)
      setDocumentVersion(v => v + 1)
    } catch (err) {
      console.error('Failed to delete page:', err)
      toast.error('페이지 삭제 실패')
    }
  }, [loadState])

  /**
   * 페이지 순서 변경 (에러 처리 포함)
   */
  const reorderPages = useCallback(async (fromIndex: number, toIndex: number) => {
    const derived = deriveLoadStateInfo(loadState)
    if (!derived.pdfLib || fromIndex === toIndex) return
    if (fromIndex < 0 || fromIndex >= derived.pageCount) return
    if (toIndex < 0 || toIndex >= derived.pageCount) return

    try {
      // 새 PDF 생성하여 페이지 재정렬
      const newPdf = await PDFDocument.create()
      const pageIndices = Array.from({ length: derived.pageCount }, (_, i) => i)

      // 순서 변경
      const [movedIndex] = pageIndices.splice(fromIndex, 1)
      pageIndices.splice(toIndex, 0, movedIndex)

      // 페이지 복사
      const copiedPages = await newPdf.copyPages(derived.pdfLib, pageIndices)
      copiedPages.forEach((page) => newPdf.addPage(page))

      // 문서 다시 로드
      const pdfBytes = await newPdf.save()
      const newPdfLib = await PDFDocument.load(pdfBytes)
      const loadingTask = pdfjsLib.getDocument({
        data: pdfBytes,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        cMapUrl: '/pdfjs/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/pdfjs/standard_fonts/',
      })
      const pdfJsDoc = await loadingTask.promise

      dispatch({
        type: 'LOAD_COMPLETE',
        pdfLib: newPdfLib,
        pdfJs: pdfJsDoc,
        isEncrypted: derived.isEncrypted,
        pageCount: pdfJsDoc.numPages,
      })

      // 회전 상태 업데이트 - 페이지 순서와 동일하게 재정렬
      setPageRotations(prev => {
        const newMap = new Map<number, number>()
        pageIndices.forEach((oldIndex, newIndex) => {
          const rotation = prev.get(oldIndex)
          if (rotation !== undefined) {
            newMap.set(newIndex, rotation)
          }
        })
        return newMap
      })

      // 버전 증가 (캐시 무효화 트리거)
      setDocumentVersion(v => v + 1)
    } catch (err) {
      console.error('Failed to reorder pages:', err)
      toast.error('페이지 순서 변경 실패')
    }
  }, [loadState])

  /**
   * PDF 병합 (에러 처리 포함)
   */
  const mergePDF = useCallback(async (file: File, insertAtIndex?: number) => {
    const derived = deriveLoadStateInfo(loadState)
    if (!derived.pdfLib) return

    try {
      const arrayBuffer = await file.arrayBuffer()
      const externalPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

      const insertIndex = insertAtIndex ?? derived.pageCount
      const copiedPages = await derived.pdfLib.copyPages(externalPdf, externalPdf.getPageIndices())

      // 페이지 삽입
      copiedPages.forEach((page, i) => {
        derived.pdfLib!.insertPage(insertIndex + i, page)
      })

      // PDF.js 문서 다시 로드
      const pdfBytes = await derived.pdfLib.save()
      const loadingTask = pdfjsLib.getDocument({
        data: pdfBytes,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        cMapUrl: '/pdfjs/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: '/pdfjs/standard_fonts/',
      })
      const pdfJsDoc = await loadingTask.promise

      dispatch({
        type: 'LOAD_COMPLETE',
        pdfLib: derived.pdfLib,
        pdfJs: pdfJsDoc,
        isEncrypted: derived.isEncrypted,
        pageCount: pdfJsDoc.numPages,
      })

      // 버전 증가 (캐시 무효화 트리거)
      setDocumentVersion(v => v + 1)

      toast.success('PDF 병합 완료')
    } catch (err) {
      console.error('Failed to merge PDF:', err)
      toast.error('PDF 병합 실패')
    }
  }, [loadState])

  /**
   * 페이지 추출 (에러 처리 포함)
   */
  const extractPages = useCallback(async (pageIndices: number[]) => {
    const derived = deriveLoadStateInfo(loadState)
    if (!derived.pdfLib || !derived.file || pageIndices.length === 0) return

    try {
      const newPdf = await PDFDocument.create()
      const copiedPages = await newPdf.copyPages(derived.pdfLib, pageIndices)
      copiedPages.forEach((page) => newPdf.addPage(page))

      const pdfBytes = await newPdf.save()
      const arrayBuffer = pdfBytes.buffer.slice(
        pdfBytes.byteOffset,
        pdfBytes.byteOffset + pdfBytes.byteLength
      ) as ArrayBuffer
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = derived.file.name.replace('.pdf', `-pages-${pageIndices.map((i) => i + 1).join('-')}.pdf`)
      a.click()

      URL.revokeObjectURL(url)
      toast.success('페이지 추출 완료')
    } catch (err) {
      console.error('Failed to extract pages:', err)
      toast.error('페이지 추출 실패')
    }
  }, [loadState])

  /**
   * PDF 저장 (PDFSaveManager 사용)
   */
  const savePDF = useCallback(async (
    annotations?: AnnotationStore,
    scale: number = 1,
    directCanvasData?: DirectCanvasData
  ): Promise<SaveResult | null> => {
    const derived = deriveLoadStateInfo(loadState)
    if (!derived.pdfLib || !derived.file) {
      return null
    }

    try {
      // 주석 맵 구성 (directCanvasData 우선)
      const annotationsByPage: AnnotationsByPage = new Map()

      if (directCanvasData && directCanvasData.size > 0) {
        for (const [pageNum, items] of directCanvasData) {
          annotationsByPage.set(pageNum, items)
        }
      } else if (annotations && annotations.size > 0) {
        for (const [pageNum, anns] of annotations) {
          annotationsByPage.set(
            pageNum,
            anns.map((a) => ({ id: a.id, json: a.fabricJSON }))
          )
        }
      }

      // PDFSaveManager 사용
      const saveManager = new PDFSaveManager()
      const result = await saveManager.save(derived.pdfLib, annotationsByPage, scale)

      // 다운로드
      if (result.success && result.pdfBytes) {
        const filename = derived.file.name.replace('.pdf', '-edited.pdf')
        downloadPDF(result.pdfBytes, filename)
        toast.success('PDF 저장 완료')
      } else if (!result.success) {
        toast.error('PDF 저장 실패', {
          description: result.errors[0]?.message || '알 수 없는 오류',
        })
      }

      return result
    } catch (err) {
      console.error('Failed to save PDF:', err)
      toast.error('PDF 저장 실패')
      return null
    }
  }, [loadState])

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    loaderRef.current?.dispose()
    loaderRef.current = null
    dispatch({ type: 'RESET' })
    setCurrentPage(1)
    setPageRotations(new Map())
    setPasswordPrompt({ isOpen: false, isRetry: false, resolve: null })
    setPasswordFallback({ isOpen: false, isRetry: false })
    passwordFallbackFileRef.current = null
  }, [])

  /**
   * 페이지 회전 각도 조회
   */
  const getPageRotation = useCallback((pageIndex: number): number => {
    return pageRotations.get(pageIndex) || 0
  }, [pageRotations])

  // 파생 상태 계산
  const derived = deriveLoadStateInfo(loadState)

  return {
    // 상태
    file: derived.file,
    pdfLib: derived.pdfLib,
    pdfJs: derived.pdfJs,
    pageCount: derived.pageCount,
    currentPage,
    documentVersion,
    pageRotations,
    isLoading: derived.isLoading,
    error: derived.error?.userMessage || ((passwordPrompt.isRetry || passwordFallback.isRetry) ? '암호가 올바르지 않습니다' : null),
    needsPassword: derived.needsPassword || passwordPrompt.isOpen || passwordFallback.isOpen,
    pendingFile: derived.file, // 호환성 유지

    // 액션
    loadPDF,
    submitPassword,
    cancelPasswordPrompt,
    goToPage,
    nextPage,
    prevPage,
    rotatePage,
    deletePage,
    reorderPages,
    mergePDF,
    extractPages,
    savePDF,
    reset,
    getPageRotation,
  }
}
