# SOLO PDF Editor - Technical Specification

## Overview

브라우저 기반 PDF 에디터로, 모든 처리가 클라이언트에서 이루어집니다.
서버 업로드 없이 완전한 프라이버시를 보장합니다.

---

## Tech Stack

### Core Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| **pdf-lib** | ^1.17.1 | PDF 문서 조작 (페이지 추가/삭제/회전, 텍스트/이미지 삽입) |
| **pdfjs-dist** | ^4.0.379 | PDF 렌더링 (캔버스에 페이지 그리기, 텍스트 레이어) |
| **fabric** | ^6.0.0 | 캔버스 기반 주석 도구 (그리기, 도형, 텍스트) |
| **react-zoom-pan-pinch** | ^3.3.0 | 줌/팬 제스처 처리 |

### Why These Libraries?

**pdf-lib:**
- Pure JavaScript, no native dependencies
- Works entirely in browser (no server needed)
- Can create, modify, and save PDFs
- MIT License

**pdfjs-dist (Mozilla PDF.js):**
- Industry standard for PDF rendering
- High fidelity rendering
- Text layer support for selection
- Apache 2.0 License

**fabric.js:**
- Powerful canvas manipulation
- Built-in drawing tools
- Object serialization (save/load annotations)
- Easy object manipulation (move, resize, rotate)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        EditorPage                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────────────────────────┐   │
│  │             │  │              EditorCanvas                │   │
│  │  Thumbnail  │  │  ┌─────────────────────────────────┐    │   │
│  │  Sidebar    │  │  │     PDF Layer (pdfjs-dist)      │    │   │
│  │             │  │  │     - Rendered PDF page         │    │   │
│  │  - Page 1   │  │  ├─────────────────────────────────┤    │   │
│  │  - Page 2   │  │  │   Annotation Layer (fabric.js)  │    │   │
│  │  - Page 3   │  │  │     - Text boxes                │    │   │
│  │  - ...      │  │  │     - Drawings                  │    │   │
│  │             │  │  │     - Shapes                    │    │   │
│  │             │  │  │     - Signatures                │    │   │
│  └─────────────┘  │  └─────────────────────────────────┘    │   │
│                   └─────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                         Toolbar                                  │
│  [Zoom] [Rotate] [Delete] [Text] [Draw] [Shape] [Sign] [Save]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Structure

```
/components/editor/
├── EditorPageContent.tsx      # Main editor container
├── EditorToolbar.tsx          # Top toolbar with all tools
├── EditorSidebar.tsx          # Page thumbnails sidebar
├── EditorCanvas.tsx           # PDF + Annotation canvas
├── PDFRenderer.tsx            # PDF.js rendering logic
├── AnnotationCanvas.tsx       # Fabric.js annotation layer
├── tools/
│   ├── TextTool.tsx           # Text annotation tool
│   ├── DrawTool.tsx           # Freehand drawing tool
│   ├── ShapeTool.tsx          # Rectangle, circle, arrow
│   ├── SignatureTool.tsx      # Signature pad modal
│   └── RedactTool.tsx         # Redaction box tool
├── hooks/
│   ├── usePDFDocument.ts      # PDF loading & manipulation
│   ├── useAnnotations.ts      # Annotation state management
│   ├── useEditorHistory.ts    # Undo/Redo functionality
│   └── useZoom.ts             # Zoom state management
└── types/
    └── editor.ts              # TypeScript interfaces
```

---

## Feature Implementation Details

### 1. PDF 로딩 & 렌더링

**Flow:**
```
File selected → ArrayBuffer → pdf-lib (for editing)
                           → pdfjs-dist (for rendering)
```

**Implementation:**
```typescript
// hooks/usePDFDocument.ts
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'

interface PDFState {
  pdfLib: PDFDocument | null      // For editing
  pdfJs: pdfjsLib.PDFDocumentProxy | null  // For rendering
  pageCount: number
  currentPage: number
}

export function usePDFDocument() {
  const [state, setState] = useState<PDFState>(...)

  const loadPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer()

    // Load with pdf-lib (for manipulation)
    const pdfLibDoc = await PDFDocument.load(arrayBuffer)

    // Load with PDF.js (for rendering)
    const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    setState({
      pdfLib: pdfLibDoc,
      pdfJs: pdfJsDoc,
      pageCount: pdfJsDoc.numPages,
      currentPage: 1
    })
  }

  return { ...state, loadPDF }
}
```

### 2. 페이지 렌더링

**How it works:**
1. PDF.js가 페이지를 canvas에 렌더링
2. 그 위에 투명한 Fabric.js canvas를 overlay
3. 주석은 Fabric.js canvas에서 처리

```typescript
// components/editor/PDFRenderer.tsx
interface PDFRendererProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy
  pageNumber: number
  scale: number
  onRenderComplete: (dimensions: { width: number; height: number }) => void
}

export function PDFRenderer({ pdfDoc, pageNumber, scale, onRenderComplete }: PDFRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const renderPage = async () => {
      const page = await pdfDoc.getPage(pageNumber)
      const viewport = page.getViewport({ scale })

      const canvas = canvasRef.current!
      const context = canvas.getContext('2d')!

      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: context,
        viewport
      }).promise

      onRenderComplete({ width: viewport.width, height: viewport.height })
    }

    renderPage()
  }, [pdfDoc, pageNumber, scale])

  return <canvas ref={canvasRef} className="pdf-canvas" />
}
```

### 3. 썸네일 사이드바

**Features:**
- 모든 페이지의 작은 미리보기
- 클릭하면 해당 페이지로 이동
- 드래그 앤 드롭으로 순서 변경
- 우클릭 메뉴 (회전, 삭제, 추출)

**Implementation:**
```typescript
// components/editor/EditorSidebar.tsx
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export function EditorSidebar({
  pdfDoc,
  currentPage,
  onPageSelect,
  onReorder
}: EditorSidebarProps) {
  const [thumbnails, setThumbnails] = useState<string[]>([])

  // Generate thumbnails
  useEffect(() => {
    const generateThumbnails = async () => {
      const thumbs: string[] = []
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: 0.2 })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({
          canvasContext: canvas.getContext('2d')!,
          viewport
        }).promise

        thumbs.push(canvas.toDataURL())
      }
      setThumbnails(thumbs)
    }

    generateThumbnails()
  }, [pdfDoc])

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={pageIds} strategy={verticalListSortingStrategy}>
        {thumbnails.map((thumb, index) => (
          <SortableItem key={index} id={index}>
            <ThumbnailCard
              src={thumb}
              pageNumber={index + 1}
              isActive={currentPage === index + 1}
              onClick={() => onPageSelect(index + 1)}
            />
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

### 4. 페이지 조작 (회전, 삭제, 순서변경)

**Using pdf-lib:**
```typescript
// hooks/usePDFDocument.ts

// 페이지 회전
const rotatePage = async (pageIndex: number, degrees: 0 | 90 | 180 | 270) => {
  const page = pdfLibDoc.getPage(pageIndex)
  const currentRotation = page.getRotation().angle
  page.setRotation(degrees((currentRotation + degrees) % 360))
}

// 페이지 삭제
const deletePage = async (pageIndex: number) => {
  pdfLibDoc.removePage(pageIndex)
  // Re-render PDF.js document
  await reloadPdfJs()
}

// 페이지 순서 변경
const reorderPages = async (fromIndex: number, toIndex: number) => {
  // pdf-lib doesn't have direct reorder, so we:
  // 1. Create new document
  // 2. Copy pages in new order
  const newDoc = await PDFDocument.create()
  const pageCount = pdfLibDoc.getPageCount()

  const newOrder = [...Array(pageCount).keys()]
  const [removed] = newOrder.splice(fromIndex, 1)
  newOrder.splice(toIndex, 0, removed)

  const copiedPages = await newDoc.copyPages(pdfLibDoc, newOrder)
  copiedPages.forEach(page => newDoc.addPage(page))

  setPdfLibDoc(newDoc)
}

// 페이지 추출
const extractPages = async (pageIndices: number[]) => {
  const newDoc = await PDFDocument.create()
  const copiedPages = await newDoc.copyPages(pdfLibDoc, pageIndices)
  copiedPages.forEach(page => newDoc.addPage(page))

  const pdfBytes = await newDoc.save()
  downloadPDF(pdfBytes, 'extracted-pages.pdf')
}
```

### 5. 주석 레이어 (Fabric.js)

**Setup:**
```typescript
// components/editor/AnnotationCanvas.tsx
import { fabric } from 'fabric'

interface AnnotationCanvasProps {
  width: number
  height: number
  pageNumber: number
  tool: ToolType
  onAnnotationAdd: (annotation: Annotation) => void
}

export function AnnotationCanvas({ width, height, pageNumber, tool }: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)

  useEffect(() => {
    // Initialize Fabric.js canvas
    fabricRef.current = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      isDrawingMode: tool === 'draw',
      selection: tool === 'select'
    })

    return () => {
      fabricRef.current?.dispose()
    }
  }, [width, height])

  // Configure tool
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    canvas.isDrawingMode = tool === 'draw'

    if (tool === 'draw') {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.width = 2
      canvas.freeDrawingBrush.color = '#000000'
    }
  }, [tool])

  return (
    <canvas
      ref={canvasRef}
      className="annotation-canvas absolute top-0 left-0 pointer-events-auto"
    />
  )
}
```

### 6. 텍스트 추가 도구

**How it works:**
1. 사용자가 텍스트 도구 선택
2. 캔버스 클릭 시 해당 위치에 텍스트 박스 생성
3. 텍스트 입력 후 폰트, 크기, 색상 조절
4. 저장 시 pdf-lib로 PDF에 텍스트 임베드

```typescript
// tools/TextTool.tsx
const addTextBox = (x: number, y: number) => {
  const textbox = new fabric.IText('Type here...', {
    left: x,
    top: y,
    fontSize: 16,
    fontFamily: 'Helvetica',
    fill: '#000000',
    editable: true,
    padding: 5,
    borderColor: '#2563eb',
    cornerColor: '#2563eb',
  })

  fabricCanvas.add(textbox)
  fabricCanvas.setActiveObject(textbox)
  textbox.enterEditing()
}

// PDF에 텍스트 임베드 (저장 시)
const embedTextToPDF = async (pdfDoc: PDFDocument, pageIndex: number, textObjects: fabric.IText[]) => {
  const page = pdfDoc.getPage(pageIndex)
  const { width, height } = page.getSize()

  for (const textObj of textObjects) {
    // Fabric.js 좌표를 PDF 좌표로 변환 (PDF는 좌하단이 원점)
    const pdfX = textObj.left!
    const pdfY = height - textObj.top! - textObj.fontSize!

    page.drawText(textObj.text!, {
      x: pdfX,
      y: pdfY,
      size: textObj.fontSize,
      color: rgb(...hexToRgb(textObj.fill as string)),
    })
  }
}
```

### 7. 그리기 도구

**Modes:**
- Pencil (자유 곡선)
- Highlighter (반투명 굵은 선)

```typescript
// tools/DrawTool.tsx
const configureBrush = (mode: 'pencil' | 'highlighter') => {
  const brush = new fabric.PencilBrush(canvas)

  if (mode === 'pencil') {
    brush.width = 2
    brush.color = currentColor
  } else if (mode === 'highlighter') {
    brush.width = 20
    brush.color = hexToRgba(currentColor, 0.3) // 30% opacity
  }

  canvas.freeDrawingBrush = brush
  canvas.isDrawingMode = true
}

// PDF에 그리기 임베드 (저장 시)
const embedDrawingToPDF = async (pdfDoc: PDFDocument, pageIndex: number, paths: fabric.Path[]) => {
  const page = pdfDoc.getPage(pageIndex)

  for (const path of paths) {
    // SVG path를 PDF path로 변환
    const svgPath = path.path
    // ... path conversion logic
  }
}
```

### 8. 도형 도구

**Available shapes:**
- Rectangle (사각형)
- Circle/Ellipse (원/타원)
- Line (직선)
- Arrow (화살표)

```typescript
// tools/ShapeTool.tsx
type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow'

const createShape = (type: ShapeType, startX: number, startY: number) => {
  let shape: fabric.Object

  switch (type) {
    case 'rectangle':
      shape = new fabric.Rect({
        left: startX,
        top: startY,
        width: 100,
        height: 60,
        fill: 'transparent',
        stroke: currentColor,
        strokeWidth: 2
      })
      break

    case 'circle':
      shape = new fabric.Circle({
        left: startX,
        top: startY,
        radius: 50,
        fill: 'transparent',
        stroke: currentColor,
        strokeWidth: 2
      })
      break

    case 'line':
      shape = new fabric.Line([startX, startY, startX + 100, startY], {
        stroke: currentColor,
        strokeWidth: 2
      })
      break

    case 'arrow':
      // Arrow is a group of line + triangle
      shape = createArrow(startX, startY, startX + 100, startY)
      break
  }

  canvas.add(shape)
  canvas.setActiveObject(shape)
}
```

### 9. 서명 도구

**How it works:**
1. 서명 버튼 클릭 시 모달 오픈
2. 모달 내 캔버스에서 서명 그리기
3. 완료 후 서명 이미지를 PDF 캔버스에 배치
4. 드래그로 위치 조절, 핸들로 크기 조절

```typescript
// tools/SignatureTool.tsx
export function SignatureModal({ onSave, onClose }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)

  useEffect(() => {
    fabricRef.current = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: 400,
      height: 200,
      backgroundColor: '#ffffff'
    })

    fabricRef.current.freeDrawingBrush = new fabric.PencilBrush(fabricRef.current)
    fabricRef.current.freeDrawingBrush.width = 2
    fabricRef.current.freeDrawingBrush.color = '#000000'
  }, [])

  const handleSave = () => {
    const dataUrl = fabricRef.current?.toDataURL({
      format: 'png',
      multiplier: 2 // Higher resolution
    })
    onSave(dataUrl)
  }

  const handleClear = () => {
    fabricRef.current?.clear()
    fabricRef.current?.setBackgroundColor('#ffffff', () => {})
  }

  return (
    <Dialog>
      <div className="p-4">
        <canvas ref={canvasRef} className="border rounded" />
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={handleClear}>Clear</Button>
          <Button onClick={handleSave}>Apply Signature</Button>
        </div>
      </div>
    </Dialog>
  )
}

// 서명 이미지를 캔버스에 추가
const addSignatureToCanvas = (dataUrl: string, x: number, y: number) => {
  fabric.Image.fromURL(dataUrl, (img) => {
    img.set({
      left: x,
      top: y,
      scaleX: 0.5,
      scaleY: 0.5
    })
    canvas.add(img)
    canvas.setActiveObject(img)
  })
}
```

### 10. 검열 (Redaction) 도구

**How it works:**
1. 검열 도구 선택
2. 드래그로 영역 선택
3. 검은색 또는 흰색 박스로 덮기
4. 저장 시 해당 영역에 실제 박스 그리기

```typescript
// tools/RedactTool.tsx
const createRedactionBox = (startX: number, startY: number, endX: number, endY: number) => {
  const rect = new fabric.Rect({
    left: Math.min(startX, endX),
    top: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
    fill: redactionColor, // '#000000' or '#ffffff'
    stroke: 'none',
    selectable: true,
    data: { type: 'redaction' } // Mark as redaction for special handling
  })

  canvas.add(rect)
}

// PDF에 검열 박스 임베드
const embedRedactionToPDF = async (pdfDoc: PDFDocument, pageIndex: number, rects: fabric.Rect[]) => {
  const page = pdfDoc.getPage(pageIndex)
  const { height } = page.getSize()

  for (const rect of rects) {
    page.drawRectangle({
      x: rect.left!,
      y: height - rect.top! - rect.height!,
      width: rect.width!,
      height: rect.height!,
      color: rgb(0, 0, 0), // or white
      opacity: 1
    })
  }
}
```

### 11. 줌 & 팬

```typescript
// hooks/useZoom.ts
interface ZoomState {
  scale: number
  minScale: number
  maxScale: number
}

export function useZoom() {
  const [scale, setScale] = useState(1)

  const zoomIn = () => setScale(s => Math.min(s * 1.25, 4))
  const zoomOut = () => setScale(s => Math.max(s / 1.25, 0.25))
  const zoomTo = (value: number) => setScale(value)
  const fitToWidth = (containerWidth: number, pageWidth: number) => {
    setScale(containerWidth / pageWidth)
  }
  const fitToPage = (containerSize: Size, pageSize: Size) => {
    const scaleX = containerSize.width / pageSize.width
    const scaleY = containerSize.height / pageSize.height
    setScale(Math.min(scaleX, scaleY))
  }

  return { scale, zoomIn, zoomOut, zoomTo, fitToWidth, fitToPage }
}
```

### 12. PDF 저장

**Process:**
1. 모든 주석을 수집
2. 각 페이지에 주석 임베드
3. pdf-lib로 새 PDF 생성
4. Blob으로 변환 후 다운로드

```typescript
// hooks/usePDFDocument.ts
const savePDF = async (annotations: Map<number, Annotation[]>) => {
  // Clone the document to avoid modifying original
  const savedDoc = await pdfLibDoc.copy()

  // Embed annotations for each page
  for (const [pageIndex, pageAnnotations] of annotations) {
    const page = savedDoc.getPage(pageIndex)

    for (const annotation of pageAnnotations) {
      switch (annotation.type) {
        case 'text':
          await embedText(page, annotation)
          break
        case 'drawing':
          await embedDrawing(page, annotation)
          break
        case 'shape':
          await embedShape(page, annotation)
          break
        case 'signature':
          await embedImage(page, annotation)
          break
        case 'redaction':
          await embedRedaction(page, annotation)
          break
      }
    }
  }

  // Save and download
  const pdfBytes = await savedDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${originalFileName}-edited.pdf`
  a.click()

  URL.revokeObjectURL(url)
}
```

---

## State Management

```typescript
// types/editor.ts
interface EditorState {
  // Document
  file: File | null
  pdfLibDoc: PDFDocument | null
  pdfJsDoc: PDFDocumentProxy | null
  pageCount: number
  currentPage: number

  // View
  scale: number
  rotation: number

  // Tool
  activeTool: ToolType
  toolSettings: ToolSettings

  // Annotations (per page)
  annotations: Map<number, Annotation[]>

  // History
  history: HistoryState[]
  historyIndex: number

  // UI
  sidebarOpen: boolean
  isLoading: boolean
  error: string | null
}

type ToolType =
  | 'select'
  | 'text'
  | 'draw'
  | 'highlighter'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'signature'
  | 'redact'

interface Annotation {
  id: string
  type: ToolType
  pageIndex: number
  data: fabric.Object // Serialized Fabric.js object
  createdAt: number
}
```

---

## UI Layout

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        AdSense Banner (728x90)                              │
├────────────────────────────────────────────────────────────────────────────┤
│ [SOLO PDF]                                              [Back to Home]      │
├────────────────────────────────────────────────────────────────────────────┤
│ TOOLBAR                                                                     │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐ │
│ │Zoom-│Zoom+│ Fit │Rotate│ Del │ Text│ Draw│Shape│ Sign│Redact│ Undo│Save │ │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘ │
├─────────┬──────────────────────────────────────────────────────────────────┤
│ SIDEBAR │                         CANVAS                                    │
│ ┌─────┐ │  ┌──────────────────────────────────────────────────────────┐   │
│ │ [1] │ │  │                                                          │   │
│ └─────┘ │  │                                                          │   │
│ ┌─────┐ │  │                      PDF Page                            │   │
│ │ [2] │ │  │                   + Annotations                          │   │
│ └─────┘ │  │                                                          │   │
│ ┌─────┐ │  │                                                          │   │
│ │ [3] │ │  │                                                          │   │
│ └─────┘ │  └──────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│ 120px   │                         flex-1                                    │
├─────────┴──────────────────────────────────────────────────────────────────┤
│ STATUS BAR: Page 1 of 10 │ 100% │ tool-name                                 │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure (Final)

```
/components/editor/
├── EditorPageContent.tsx      # Main container, state management
├── EditorToolbar.tsx          # Tool buttons, zoom controls
├── EditorSidebar.tsx          # Thumbnails with drag-drop
├── EditorCanvas.tsx           # Canvas container with zoom/pan
├── EditorStatusBar.tsx        # Bottom status info
│
├── layers/
│   ├── PDFLayer.tsx           # PDF.js rendering
│   └── AnnotationLayer.tsx    # Fabric.js canvas
│
├── tools/
│   ├── SelectTool.tsx
│   ├── TextTool.tsx
│   ├── DrawTool.tsx
│   ├── ShapeTool.tsx
│   ├── SignatureTool.tsx
│   └── RedactTool.tsx
│
├── modals/
│   ├── SignatureModal.tsx     # Signature drawing pad
│   └── PageActionsModal.tsx   # Delete, extract confirmation
│
├── hooks/
│   ├── usePDFDocument.ts      # PDF loading & manipulation
│   ├── useAnnotations.ts      # Annotation CRUD
│   ├── useEditorHistory.ts    # Undo/Redo
│   ├── useZoom.ts             # Zoom state
│   └── useActiveTool.ts       # Tool state
│
└── utils/
    ├── pdfUtils.ts            # PDF coordinate conversion
    ├── fabricUtils.ts         # Fabric.js helpers
    └── downloadUtils.ts       # File download helpers
```

---

## Dependencies to Install

```bash
npm install pdf-lib pdfjs-dist fabric @dnd-kit/core @dnd-kit/sortable
npm install -D @types/fabric
```

**PDF.js Worker Setup:**
```typescript
// lib/pdfjs.ts
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export { pdfjsLib }
```

---

## Implementation Priority

### Phase 1 - Core Viewer (Week 1)
1. PDF 로딩 & 렌더링
2. 페이지 네비게이션
3. 줌 컨트롤
4. 썸네일 사이드바
5. 기본 저장/다운로드

### Phase 2 - Page Operations (Week 1-2)
1. 페이지 회전
2. 페이지 삭제
3. 페이지 순서 변경

### Phase 3 - Annotations (Week 2-3)
1. 텍스트 추가
2. 그리기 도구
3. 서명

### Phase 4 - Advanced (Week 3-4)
1. 도형
2. 검열
3. Undo/Redo
4. 하이라이트
