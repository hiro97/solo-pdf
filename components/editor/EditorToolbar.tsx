"use client"

import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Type,
  Pencil,
  Square,
  PenTool,
  EyeOff,
  MousePointer,
  FolderOpen,
  ImagePlus,
  TextCursor,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ToolType } from "./types"

interface EditorToolbarProps {
  // Navigation
  currentPage: number
  pageCount: number
  onPageChange: (page: number) => void
  onPrevPage: () => void
  onNextPage: () => void
  // Zoom
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomTo: (scale: number) => void
  onFitToPage: () => void
  // Page actions
  onRotate: () => void
  onDelete: () => void
  // Tools
  activeTool: ToolType
  onToolChange: (tool: ToolType) => void
  // File
  onSave: () => void
  onOpenFile: () => void
}

const ZOOM_OPTIONS = [
  { value: "0.5", label: "50%" },
  { value: "0.75", label: "75%" },
  { value: "1", label: "100%" },
  { value: "1.25", label: "125%" },
  { value: "1.5", label: "150%" },
  { value: "2", label: "200%" },
]

export function EditorToolbar({
  currentPage,
  pageCount,
  onPageChange,
  onPrevPage,
  onNextPage,
  scale,
  onZoomIn,
  onZoomOut,
  onZoomTo,
  onFitToPage,
  onRotate,
  onDelete,
  activeTool,
  onToolChange,
  onSave,
  onOpenFile,
}: EditorToolbarProps) {
  const zoomPercent = Math.round(scale * 100)

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1 px-2 py-1.5 border-b bg-background overflow-x-auto">
        {/* File Actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onOpenFile}>
                <FolderOpen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open File</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onSave}>
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download PDF</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous Page</TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-1 text-sm">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => onPageChange(parseInt(e.target.value) || 1)}
              className="w-12 h-7 text-center border rounded text-sm bg-background"
              min={1}
              max={pageCount}
            />
            <span className="text-muted-foreground">/ {pageCount}</span>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNextPage}
                disabled={currentPage >= pageCount}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next Page</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          <Select
            value={scale.toString()}
            onValueChange={(v) => onZoomTo(parseFloat(v))}
          >
            <SelectTrigger className="w-20 h-7 text-sm">
              <SelectValue>{zoomPercent}%</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ZOOM_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onFitToPage}>
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit to Page</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Page Actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onRotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rotate Page</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={pageCount <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete Page</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Tools */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "select" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onToolChange("select")}
              >
                <MousePointer className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select Annotations</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "textSelect" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onToolChange("textSelect")}
              >
                <TextCursor className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select Text (Copy)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "text" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onToolChange("text")}
              >
                <Type className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Text</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "draw" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onToolChange("draw")}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Draw</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "rectangle" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onToolChange("rectangle")}
              >
                <Square className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rectangle</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "signature" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onToolChange("signature")}
              >
                <PenTool className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Signature</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "image" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onToolChange("image")}
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Image</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === "redact" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onToolChange("redact")}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redact</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
