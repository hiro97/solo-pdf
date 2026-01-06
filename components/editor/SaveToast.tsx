'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SaveResult } from '@/lib/pdf-save'

interface SaveToastProps {
  result: SaveResult | null
  onDismiss: () => void
  autoHideDuration?: number
}

export function SaveToast({
  result,
  onDismiss,
  autoHideDuration = 3000,
}: SaveToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (result) {
      setIsVisible(true)

      // Auto-hide only for success without warnings
      if (result.success && result.warnings.length === 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(onDismiss, 300) // Wait for animation
        }, autoHideDuration)
        return () => clearTimeout(timer)
      }
    }
  }, [result, autoHideDuration, onDismiss])

  if (!result) return null

  const hasErrors = result.errors.length > 0
  const hasWarnings = result.warnings.length > 0
  const isSuccess = result.success && !hasWarnings

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300)
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border shadow-lg transition-all duration-300',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        isSuccess && 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
        hasWarnings && !hasErrors && 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
        hasErrors && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          {isSuccess && (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          )}
          {hasWarnings && !hasErrors && (
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          )}
          {hasErrors && (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              'text-sm font-medium',
              isSuccess && 'text-green-800 dark:text-green-200',
              hasWarnings && !hasErrors && 'text-yellow-800 dark:text-yellow-200',
              hasErrors && 'text-red-800 dark:text-red-200'
            )}
          >
            {isSuccess && '저장 완료'}
            {hasWarnings && !hasErrors && '경고와 함께 저장됨'}
            {hasErrors && '저장 중 오류 발생'}
          </h4>

          <p
            className={cn(
              'mt-1 text-sm',
              isSuccess && 'text-green-700 dark:text-green-300',
              hasWarnings && !hasErrors && 'text-yellow-700 dark:text-yellow-300',
              hasErrors && 'text-red-700 dark:text-red-300'
            )}
          >
            {result.savedCount}개 주석 저장됨
            {result.failedCount > 0 && `, ${result.failedCount}개 실패`}
          </p>

          {/* Error messages */}
          {hasErrors && (
            <ul className="mt-2 text-xs text-red-600 dark:text-red-400 space-y-1">
              {result.errors.slice(0, 3).map((err, i) => (
                <li key={i} className="truncate">
                  • {err.message}
                </li>
              ))}
              {result.errors.length > 3 && (
                <li className="text-red-500 dark:text-red-500">
                  ... 외 {result.errors.length - 3}개 오류
                </li>
              )}
            </ul>
          )}

          {/* Warning messages (only if no errors) */}
          {hasWarnings && !hasErrors && (
            <ul className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
              {result.warnings.slice(0, 2).map((warn, i) => (
                <li key={i} className="truncate">
                  • {warn.message}
                </li>
              ))}
              {result.warnings.length > 2 && (
                <li className="text-yellow-500 dark:text-yellow-500">
                  ... 외 {result.warnings.length - 2}개 경고
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className={cn(
            'flex-shrink-0 rounded-md p-1 transition-colors',
            isSuccess && 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900',
            hasWarnings && !hasErrors && 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900',
            hasErrors && 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900'
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">닫기</span>
        </button>
      </div>
    </div>
  )
}
