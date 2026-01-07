"use client"

import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Undo2,
  Redo2,
  Loader2,
  Maximize,
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

interface EditorTopBarProps {
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
  // File
  onSave: () => void
  onOpenFile: () => void
  isSaving?: boolean
  // Undo/Redo
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  // File name
  fileName?: string
}

const ZOOM_OPTIONS = [
  { value: "0.5", label: "50%" },
  { value: "0.75", label: "75%" },
  { value: "1", label: "100%" },
  { value: "1.25", label: "125%" },
  { value: "1.5", label: "150%" },
  { value: "2", label: "200%" },
]

// Compact icon button
function IconButton({
  onClick,
  icon: Icon,
  tooltip,
  disabled,
  className,
}: {
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  tooltip: string
  disabled?: boolean
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "p-1.5 rounded transition-colors",
            "hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed",
            "text-muted-foreground hover:text-foreground",
            className
          )}
        >
          <Icon className="w-4 h-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  )
}

// Thin separator
function Separator() {
  return <div className="w-px h-5 bg-border/50 mx-1" />
}

export function EditorTopBar({
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
  onSave,
  onOpenFile,
  isSaving,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  fileName,
}: EditorTopBarProps) {
  const zoomPercent = Math.round(scale * 100)

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 bg-muted/30">
        {/* Left section: File operations & History */}
        <div className="flex items-center gap-0.5">
          <IconButton
            onClick={onOpenFile}
            icon={FolderOpen}
            tooltip="Open File"
          />
          <IconButton
            onClick={onSave}
            icon={isSaving ? Loader2 : Download}
            tooltip={isSaving ? "Saving..." : "Save (Ctrl+S)"}
            disabled={isSaving}
            className={isSaving ? "animate-spin" : ""}
          />

          <Separator />

          <IconButton
            onClick={onUndo}
            icon={Undo2}
            tooltip="Undo (Ctrl+Z)"
            disabled={!canUndo}
          />
          <IconButton
            onClick={onRedo}
            icon={Redo2}
            tooltip="Redo (Ctrl+Shift+Z)"
            disabled={!canRedo}
          />

          <Separator />

          {/* Page Navigation */}
          <IconButton
            onClick={onPrevPage}
            icon={ChevronLeft}
            tooltip="Previous Page"
            disabled={currentPage <= 1}
          />
          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="px-2 py-0.5 bg-muted/50 rounded text-[11px] min-w-[70px] text-center text-muted-foreground">
              {currentPage} / {pageCount}
            </span>
          </div>
          <IconButton
            onClick={onNextPage}
            icon={ChevronRight}
            tooltip="Next Page"
            disabled={currentPage >= pageCount}
          />
        </div>

        {/* Center: File name (optional) */}
        {fileName && (
          <div className="hidden md:flex items-center">
            <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
              {fileName}
            </span>
          </div>
        )}

        {/* Right section: Zoom & Page actions */}
        <div className="flex items-center gap-0.5">
          {/* Zoom Controls */}
          <IconButton
            onClick={onZoomOut}
            icon={ZoomOut}
            tooltip="Zoom Out"
          />
          <Select
            value={scale.toString()}
            onValueChange={(v) => onZoomTo(parseFloat(v))}
          >
            <SelectTrigger className="w-[60px] h-7 text-[11px] font-mono border-0 bg-muted/50 hover:bg-muted">
              <SelectValue>{zoomPercent}%</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ZOOM_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs font-mono"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <IconButton
            onClick={onZoomIn}
            icon={ZoomIn}
            tooltip="Zoom In"
          />
          <IconButton
            onClick={onFitToPage}
            icon={Maximize}
            tooltip="Fit to Page"
          />

          <Separator />

          {/* Page Actions */}
          <IconButton
            onClick={onRotate}
            icon={RotateCw}
            tooltip="Rotate Page"
          />
          <IconButton
            onClick={onDelete}
            icon={Trash2}
            tooltip="Delete Page"
            disabled={pageCount <= 1}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
