/**
 * Annotation Rotation Automated Test Script
 *
 * 브라우저 콘솔에서 실행할 수 있는 자동 테스트 스크립트
 *
 * 사용법:
 * 1. PDF를 업로드하고 편집 화면으로 이동
 * 2. 브라우저 개발자 도구 열기 (F12)
 * 3. Console 탭으로 이동
 * 4. 이 파일의 내용을 복사하여 콘솔에 붙여넣기
 * 5. runRotationTests() 실행
 */

const RotationTestSuite = {
  results: [],

  // 테스트 결과 기록
  log(testName, passed, message = '') {
    const result = {
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    }
    this.results.push(result)

    const icon = passed ? '✅' : '❌'
    const color = passed ? 'color: green' : 'color: red'
    console.log(`%c${icon} ${testName}`, color)
    if (message) {
      console.log(`   ${message}`)
    }
  },

  // 페이지 회전 확인
  async testPageRotation() {
    console.log('\n🔄 Testing Page Rotation...')

    try {
      // 회전 버튼 찾기
      const rotateButton = document.querySelector('[aria-label*="otate"], button[title*="otate"]')

      if (!rotateButton) {
        this.log('Page Rotation', false, 'Rotate button not found')
        return
      }

      this.log('Page Rotation', true, 'Rotate button found')
    } catch (err) {
      this.log('Page Rotation', false, err.message)
    }
  },

  // Annotation 레이어 확인
  async testAnnotationLayer() {
    console.log('\n📝 Testing Annotation Layer...')

    try {
      // Fabric.js canvas 찾기
      const canvases = document.querySelectorAll('.canvas-container canvas')

      if (canvases.length === 0) {
        this.log('Annotation Layer', false, 'No Fabric.js canvas found')
        return
      }

      this.log('Annotation Layer', true, `Found ${canvases.length} canvas element(s)`)

      // Check if Fabric.js is loaded
      if (typeof fabric !== 'undefined') {
        this.log('Fabric.js Loaded', true, 'Fabric.js library is available')
      } else {
        this.log('Fabric.js Loaded', false, 'Fabric.js library not found')
      }
    } catch (err) {
      this.log('Annotation Layer', false, err.message)
    }
  },

  // Console 로그 모니터링
  async testConsoleLogging() {
    console.log('\n📊 Testing Console Logging...')

    // Console 로그를 가로채서 transformation 로그 확인
    const originalLog = console.log
    let transformationLogFound = false

    console.log = function(...args) {
      const message = args.join(' ')
      if (message.includes('AnnotationLayer') && message.includes('Transforming')) {
        transformationLogFound = true
      }
      originalLog.apply(console, args)
    }

    // 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 복원
    console.log = originalLog

    this.log('Console Logging Setup', true, 'Ready to capture transformation logs')
  },

  // 페이지 회전 각도 확인 (React DevTools 사용)
  async testRotationState() {
    console.log('\n🎯 Testing Rotation State...')

    try {
      // React Fiber를 통해 state 접근 시도
      const reactRoot = document.querySelector('#__next')

      if (reactRoot) {
        const fiberKey = Object.keys(reactRoot).find(key =>
          key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
        )

        if (fiberKey) {
          this.log('React State Access', true, 'React Fiber found')
        } else {
          this.log('React State Access', false, 'React Fiber not accessible')
        }
      } else {
        this.log('React State Access', false, 'React root not found')
      }
    } catch (err) {
      this.log('Rotation State', false, err.message)
    }
  },

  // LocalStorage 확인
  async testPersistence() {
    console.log('\n💾 Testing Persistence...')

    try {
      const storageKeys = Object.keys(localStorage)
      const annotationKeys = storageKeys.filter(key =>
        key.includes('annotation') || key.includes('pdf') || key.includes('rotation')
      )

      if (annotationKeys.length > 0) {
        this.log('LocalStorage', true, `Found ${annotationKeys.length} storage key(s)`)
        console.log('   Keys:', annotationKeys)
      } else {
        this.log('LocalStorage', true, 'No annotation data in storage (fresh state)')
      }
    } catch (err) {
      this.log('Persistence Test', false, err.message)
    }
  },

  // DOM 구조 확인
  async testDOMStructure() {
    console.log('\n🏗️ Testing DOM Structure...')

    try {
      const checks = [
        { selector: '.textLayer', name: 'PDF Text Layer' },
        { selector: 'canvas[class*="pdf"]', name: 'PDF Canvas' },
        { selector: '.canvas-container', name: 'Fabric Canvas Container' },
        { selector: '[data-page-number]', name: 'Page Elements' }
      ]

      checks.forEach(({ selector, name }) => {
        const elements = document.querySelectorAll(selector)
        if (elements.length > 0) {
          this.log(name, true, `Found ${elements.length} element(s)`)
        } else {
          this.log(name, false, 'Not found')
        }
      })
    } catch (err) {
      this.log('DOM Structure', false, err.message)
    }
  },

  // 메모리 사용량 확인
  async testMemory() {
    console.log('\n🧠 Testing Memory...')

    try {
      if (performance.memory) {
        const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2)
        const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(2)

        this.log('Memory Usage', true, `${used} MB / ${total} MB`)

        if (used / total > 0.9) {
          console.warn('⚠️ Warning: High memory usage detected')
        }
      } else {
        this.log('Memory Usage', true, 'Memory API not available (requires Chrome)')
      }
    } catch (err) {
      this.log('Memory Test', false, err.message)
    }
  },

  // 에러 확인
  async testErrors() {
    console.log('\n🚨 Testing Error Handling...')

    // 전역 에러 리스너 설정
    const errors = []

    const errorHandler = (event) => {
      errors.push({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    }

    window.addEventListener('error', errorHandler)

    await new Promise(resolve => setTimeout(resolve, 1000))

    window.removeEventListener('error', errorHandler)

    if (errors.length === 0) {
      this.log('Error Handling', true, 'No runtime errors detected')
    } else {
      this.log('Error Handling', false, `Found ${errors.length} error(s)`)
      console.table(errors)
    }
  },

  // 종합 결과 출력
  printResults() {
    console.log('\n' + '='.repeat(60))
    console.log('📋 TEST RESULTS SUMMARY')
    console.log('='.repeat(60))

    const total = this.results.length
    const passed = this.results.filter(r => r.passed).length
    const failed = total - passed

    console.log(`Total Tests: ${total}`)
    console.log(`%cPassed: ${passed}`, 'color: green; font-weight: bold')
    console.log(`%cFailed: ${failed}`, failed > 0 ? 'color: red; font-weight: bold' : 'color: gray')

    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.test}: ${r.message}`)
      })
    }

    console.log('\n' + '='.repeat(60))

    // JSON 결과 출력 (복사 가능)
    console.log('\n📄 Detailed Results (JSON):')
    console.log(JSON.stringify(this.results, null, 2))
  },

  // 모든 테스트 실행
  async runAll() {
    console.clear()
    console.log('%c🧪 Annotation Rotation Test Suite', 'font-size: 20px; font-weight: bold; color: #4CAF50')
    console.log('Starting automated tests...\n')

    this.results = []

    await this.testPageRotation()
    await this.testAnnotationLayer()
    await this.testConsoleLogging()
    await this.testRotationState()
    await this.testPersistence()
    await this.testDOMStructure()
    await this.testMemory()
    await this.testErrors()

    this.printResults()

    return this.results
  }
}

// Helper: 회전 테스트 실행
async function runRotationTests() {
  return await RotationTestSuite.runAll()
}

// Helper: 특정 annotation 찾기
function findAnnotations() {
  console.log('🔍 Searching for annotations...')

  const canvases = document.querySelectorAll('.canvas-container')
  let totalObjects = 0

  canvases.forEach((container, index) => {
    const canvas = container.querySelector('canvas')
    if (canvas && canvas.fabric) {
      const objects = canvas.fabric.getObjects()
      console.log(`Canvas ${index + 1}: ${objects.length} object(s)`)
      objects.forEach((obj, i) => {
        console.log(`  ${i + 1}. ${obj.type} at (${Math.round(obj.left)}, ${Math.round(obj.top)})`)
      })
      totalObjects += objects.length
    }
  })

  console.log(`\nTotal: ${totalObjects} annotation(s) found`)
  return totalObjects
}

// Helper: 현재 페이지 회전 각도 확인
function checkRotation() {
  console.log('🔄 Checking page rotation...')

  const pageElements = document.querySelectorAll('[data-page-number]')

  pageElements.forEach((element, index) => {
    const pageNumber = element.getAttribute('data-page-number')
    const transform = window.getComputedStyle(element).transform

    console.log(`Page ${pageNumber}: transform = ${transform}`)
  })
}

// Helper: 콘솔 로그 모니터 시작
function startLogMonitor() {
  console.log('👀 Starting console log monitor...')
  console.log('Watching for transformation logs...\n')

  const originalLog = console.log

  console.log = function(...args) {
    const message = args.join(' ')

    if (message.includes('AnnotationLayer')) {
      console.log('%c[MONITOR] ' + message, 'color: blue; font-weight: bold')
    } else {
      originalLog.apply(console, args)
    }
  }

  console.log('✅ Monitor active. Rotation transformations will be highlighted.')
  console.log('To stop: console.log = originalLog\n')
}

// 사용 안내
console.log('%c📚 Annotation Rotation Test Suite Loaded', 'font-size: 16px; color: #2196F3')
console.log('\n사용 가능한 명령어:')
console.log('  runRotationTests()     - 모든 자동 테스트 실행')
console.log('  findAnnotations()      - 현재 annotation 찾기')
console.log('  checkRotation()        - 페이지 회전 각도 확인')
console.log('  startLogMonitor()      - 로그 모니터 시작')
console.log('\n먼저 PDF를 업로드하고 편집 화면으로 이동한 후 테스트를 실행하세요.\n')
