/**
 * Text Layer Diagnostic Utility
 *
 * Use in browser console:
 *   import('/lib/debug-text-layer.ts').then(m => m.diagnoseTextLayer())
 *
 * Or call window.diagnoseTextLayer() if loaded globally
 */

export interface TextLayerDiagnostics {
  containerExists: boolean
  containerDimensions: { width: number; height: number } | null
  containerPosition: { left: number; top: number } | null
  containerStyles: Record<string, string>
  spanCount: number
  sampleSpans: Array<{
    index: number
    text: string
    rect: DOMRect | null
    computedStyles: {
      fontSize: string
      fontFamily: string
      position: string
      left: string
      top: string
      transform: string
      color: string
    }
    inlineStyle: string
  }>
  issues: string[]
}

export function diagnoseTextLayer(pageNumber: number = 1): TextLayerDiagnostics {
  const issues: string[] = []

  // Find the text layer container
  const pageContainer = document.querySelector(`[data-page-number="${pageNumber}"]`)
  if (!pageContainer) {
    return {
      containerExists: false,
      containerDimensions: null,
      containerPosition: null,
      containerStyles: {},
      spanCount: 0,
      sampleSpans: [],
      issues: [`Page container not found for page ${pageNumber}`],
    }
  }

  const textLayer = pageContainer.querySelector('.textLayer') as HTMLElement | null
  if (!textLayer) {
    return {
      containerExists: false,
      containerDimensions: null,
      containerPosition: null,
      containerStyles: {},
      spanCount: 0,
      sampleSpans: [],
      issues: ['TextLayer container (.textLayer) not found'],
    }
  }

  // Get container info
  const containerRect = textLayer.getBoundingClientRect()
  const containerStyles = window.getComputedStyle(textLayer)

  // Check container dimensions
  if (containerRect.width === 0 || containerRect.height === 0) {
    issues.push('Container has zero dimensions')
  }

  // Get all spans
  const spans = textLayer.querySelectorAll('span')
  const spanCount = spans.length

  if (spanCount === 0) {
    issues.push('No span elements found in text layer')
  }

  // Sample first 5 spans for analysis
  const sampleSpans: TextLayerDiagnostics['sampleSpans'] = []
  const sampleCount = Math.min(5, spanCount)

  for (let i = 0; i < sampleCount; i++) {
    const span = spans[i] as HTMLElement
    const spanStyles = window.getComputedStyle(span)
    const rect = span.getBoundingClientRect()

    // Check for common issues
    if (spanStyles.fontSize === '0px' || spanStyles.fontSize === '') {
      issues.push(`Span ${i}: Missing or zero font-size`)
    }

    if (spanStyles.position !== 'absolute') {
      issues.push(`Span ${i}: Position is not absolute (${spanStyles.position})`)
    }

    // Check if span is outside container bounds
    if (rect.left < containerRect.left || rect.top < containerRect.top) {
      issues.push(`Span ${i}: Position is outside container bounds`)
    }

    sampleSpans.push({
      index: i,
      text: span.textContent?.substring(0, 30) || '',
      rect,
      computedStyles: {
        fontSize: spanStyles.fontSize,
        fontFamily: spanStyles.fontFamily,
        position: spanStyles.position,
        left: spanStyles.left,
        top: spanStyles.top,
        transform: spanStyles.transform,
        color: spanStyles.color,
      },
      inlineStyle: span.getAttribute('style') || '',
    })
  }

  // Compare text layer position with canvas
  const canvas = pageContainer.querySelector('canvas') as HTMLCanvasElement | null
  if (canvas) {
    const canvasRect = canvas.getBoundingClientRect()
    const offsetX = Math.abs(containerRect.left - canvasRect.left)
    const offsetY = Math.abs(containerRect.top - canvasRect.top)

    if (offsetX > 1) {
      issues.push(`TextLayer X offset from canvas: ${offsetX.toFixed(2)}px`)
    }
    if (offsetY > 1) {
      issues.push(`TextLayer Y offset from canvas: ${offsetY.toFixed(2)}px`)
    }

    // Check size match
    const widthDiff = Math.abs(containerRect.width - canvasRect.width)
    const heightDiff = Math.abs(containerRect.height - canvasRect.height)

    if (widthDiff > 1) {
      issues.push(`Width mismatch: textLayer=${containerRect.width.toFixed(2)}, canvas=${canvasRect.width.toFixed(2)}`)
    }
    if (heightDiff > 1) {
      issues.push(`Height mismatch: textLayer=${containerRect.height.toFixed(2)}, canvas=${canvasRect.height.toFixed(2)}`)
    }
  }

  return {
    containerExists: true,
    containerDimensions: {
      width: containerRect.width,
      height: containerRect.height,
    },
    containerPosition: {
      left: containerRect.left,
      top: containerRect.top,
    },
    containerStyles: {
      position: containerStyles.position,
      width: containerStyles.width,
      height: containerStyles.height,
      left: containerStyles.left,
      top: containerStyles.top,
      zIndex: containerStyles.zIndex,
      pointerEvents: containerStyles.pointerEvents,
      overflow: containerStyles.overflow,
    },
    spanCount,
    sampleSpans,
    issues,
  }
}

/**
 * Visualize text layer alignment issues
 * Adds colored borders to help debug
 */
export function visualizeTextLayer(pageNumber: number = 1): void {
  const pageContainer = document.querySelector(`[data-page-number="${pageNumber}"]`)
  if (!pageContainer) {
    console.error('Page container not found')
    return
  }

  const textLayer = pageContainer.querySelector('.textLayer') as HTMLElement | null
  if (!textLayer) {
    console.error('TextLayer not found')
    return
  }

  // Add debug border to text layer
  textLayer.style.border = '2px solid red'
  textLayer.style.boxSizing = 'border-box'

  // Add debug borders to spans
  const spans = textLayer.querySelectorAll('span')
  spans.forEach((span) => {
    ;(span as HTMLElement).style.backgroundColor = 'rgba(0, 255, 0, 0.2)'
    ;(span as HTMLElement).style.border = '1px solid green'
  })

  console.log(`Visualized ${spans.length} spans with green background`)
  console.log('TextLayer has red border')
}

/**
 * Remove visualization
 */
export function removeVisualization(pageNumber: number = 1): void {
  const pageContainer = document.querySelector(`[data-page-number="${pageNumber}"]`)
  if (!pageContainer) return

  const textLayer = pageContainer.querySelector('.textLayer') as HTMLElement | null
  if (!textLayer) return

  textLayer.style.border = ''
  textLayer.style.boxSizing = ''

  const spans = textLayer.querySelectorAll('span')
  spans.forEach((span) => {
    ;(span as HTMLElement).style.backgroundColor = ''
    ;(span as HTMLElement).style.border = ''
  })
}

// Make available globally for browser console debugging
if (typeof window !== 'undefined') {
  ;(window as unknown as { diagnoseTextLayer: typeof diagnoseTextLayer }).diagnoseTextLayer = diagnoseTextLayer
  ;(window as unknown as { visualizeTextLayer: typeof visualizeTextLayer }).visualizeTextLayer = visualizeTextLayer
  ;(window as unknown as { removeVisualization: typeof removeVisualization }).removeVisualization = removeVisualization
}
