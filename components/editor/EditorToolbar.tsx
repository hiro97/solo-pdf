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
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"
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
  isSaving?: boolean
  // Undo/Redo
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

const ZOOM_OPTIONS = [
  { value: "0.5", label: "50%" },
  { value: "0.75", label: "75%" },
  { value: "1", label: "100%" },
  { value: "1.25", label: "125%" },
  { value: "1.5", label: "150%" },
  { value: "2", label: "200%" },
]

// Section indicator component
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="section-indicator mr-1">
      <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

// Thin separator
function ThinSeparator() {
  return <div className="w-px h-5 bg-border/50 mx-1.5" />
}

// Tool button with green active state
function ToolButton({
  isActive,
  onClick,
  icon: Icon,
  tooltip,
  disabled,
}: {
  isActive?: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  tooltip: string
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "h-7 w-7 p-0 editor-transition",
            isActive && "tool-active"
          )}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  )
}

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
  isSaving,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: EditorToolbarProps) {
  const zoomPercent = Math.round(scale * 100)

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b editor-glass-panel overflow-x-auto">
        {/* File Section */}
        <SectionLabel label="File" />
        <div className="flex items-center gap-0.5">
          <ToolButton
            onClick={onOpenFile}
            icon={FolderOpen}
            tooltip="Open File"
          />
          <ToolButton
            onClick={onSave}
            icon={isSaving ? Loader2 : Download}
            tooltip={isSaving ? "Saving..." : "Save & Download (Ctrl+S)"}
            disabled={isSaving}
          />
        </div>

        <ThinSeparator />

        {/* History Section */}
        <SectionLabel label="History" />
        <div className="flex items-center gap-0.5">
          <ToolButton
            onClick={onUndo}
            icon={Undo2}
            tooltip="Undo (Ctrl+Z)"
            disabled={!canUndo}
          />
          <ToolButton
            onClick={onRedo}
            icon={Redo2}
            tooltip="Redo (Ctrl+Shift+Z)"
            disabled={!canRedo}
          />
        </div>

        <ThinSeparator />

        {/* Page Navigation Section */}
        <SectionLabel label="Page" />
        <div className="flex items-center gap-0.5">
          <ToolButton
            onClick={onPrevPage}
            icon={ChevronLeft}
            tooltip="Previous Page"
            disabled={currentPage <= 1}
          />

          <div className="flex items-center gap-1 text-xs">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => onPageChange(parseInt(e.target.value) || 1)}
              className="w-10 h-6 text-center font-mono border rounded bg-muted/30
                         focus:ring-1 focus:ring-[hsl(var(--free))] focus:outline-none
                         text-xs"
              min={1}
              max={pageCount}
            />
            <span className="text-muted-foreground font-mono">/ {pageCount}</span>
          </div>

          <ToolButton
            onClick={onNextPage}
            icon={ChevronRight}
            tooltip="Next Page"
            disabled={currentPage >= pageCount}
          />
        </div>

        <ThinSeparator />

        {/* Zoom Section */}
        <SectionLabel label="Zoom" />
        <div className="flex items-center gap-0.5">
          <ToolButton
            onClick={onZoomOut}
            icon={ZoomOut}
            tooltip="Zoom Out"
          />

          <Select
            value={scale.toString()}
            onValueChange={(v) => onZoomTo(parseFloat(v))}
          >
            <SelectTrigger className="w-16 h-6 text-xs font-mono border-0 bg-muted/30 hover:bg-muted/50">
              <SelectValue>{zoomPercent}%</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ZOOM_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs font-mono">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ToolButton
            onClick={onZoomIn}
            icon={ZoomIn}
            tooltip="Zoom In"
          />
          <ToolButton
            onClick={onFitToPage}
            icon={Maximize}
            tooltip="Fit to Page"
          />
        </div>

        <ThinSeparator />

        {/* Page Actions Section */}
        <SectionLabel label="Edit" />
        <div className="flex items-center gap-0.5">
          <ToolButton
            onClick={onRotate}
            icon={RotateCw}
            tooltip="Rotate Page"
          />
          <ToolButton
            onClick={onDelete}
            icon={Trash2}
            tooltip="Delete Page"
            disabled={pageCount <= 1}
          />
        </div>

        <ThinSeparator />

        {/* Tools Section */}
        <SectionLabel label="Tools" />
        <div className="flex items-center gap-0.5">
          <ToolButton
            isActive={activeTool === "select"}
            onClick={() => onToolChange("select")}
            icon={MousePointer}
            tooltip="Select Annotations"
          />
          <ToolButton
            isActive={activeTool === "textSelect"}
            onClick={() => onToolChange("textSelect")}
            icon={TextCursor}
            tooltip="Select Text (Copy)"
          />
          <ToolButton
            isActive={activeTool === "text"}
            onClick={() => onToolChange("text")}
            icon={Type}
            tooltip="Add Text"
          />
          <ToolButton
            isActive={activeTool === "draw"}
            onClick={() => onToolChange("draw")}
            icon={Pencil}
            tooltip="Draw"
          />
          <ToolButton
            isActive={activeTool === "rectangle"}
            onClick={() => onToolChange("rectangle")}
            icon={Square}
            tooltip="Rectangle"
          />
          <ToolButton
            isActive={activeTool === "signature"}
            onClick={() => onToolChange("signature")}
            icon={PenTool}
            tooltip="Signature"
          />
          <ToolButton
            isActive={activeTool === "image"}
            onClick={() => onToolChange("image")}
            icon={ImagePlus}
            tooltip="Insert Image"
          />
          <ToolButton
            isActive={activeTool === "redact"}
            onClick={() => onToolChange("redact")}
            icon={EyeOff}
            tooltip="Redact"
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
