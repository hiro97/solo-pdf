"use client"

import {
  MousePointer,
  TextCursor,
  Type,
  ImagePlus,
  Pencil,
  Square,
  Circle,
  Highlighter,
  PenTool,
  EyeOff,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { ToolType } from "./types"

interface EditorVerticalToolbarProps {
  activeTool: ToolType
  onToolChange: (tool: ToolType) => void
}

// Tool configuration matching landing page design
const tools: { tool: ToolType; icon: React.ComponentType<{ className?: string }>; label: string; shortcut?: string }[] = [
  { tool: "select", icon: MousePointer, label: "Select", shortcut: "V" },
  { tool: "textSelect", icon: TextCursor, label: "Text Select", shortcut: "T" },
  { tool: "text", icon: Type, label: "Add Text", shortcut: "X" },
  { tool: "image", icon: ImagePlus, label: "Insert Image", shortcut: "I" },
  { tool: "draw", icon: Pencil, label: "Draw", shortcut: "D" },
  { tool: "rectangle", icon: Square, label: "Rectangle", shortcut: "R" },
  { tool: "circle", icon: Circle, label: "Circle", shortcut: "C" },
  { tool: "highlighter", icon: Highlighter, label: "Highlight", shortcut: "H" },
  { tool: "signature", icon: PenTool, label: "Signature", shortcut: "S" },
  { tool: "redact", icon: EyeOff, label: "Redact", shortcut: "E" },
]

export function EditorVerticalToolbar({
  activeTool,
  onToolChange,
}: EditorVerticalToolbarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-12 border-r border-border/50 bg-muted/20 py-3 flex flex-col items-center gap-1 shrink-0">
        {tools.map((item) => {
          const Icon = item.icon
          const isActive = activeTool === item.tool

          return (
            <Tooltip key={item.tool}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onToolChange(item.tool)}
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150",
                    "hover:bg-muted/80",
                    isActive && "tool-active"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-[hsl(var(--free))]" : "text-muted-foreground"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="ml-2 text-muted-foreground font-mono">
                    {item.shortcut}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          )
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Visual separator before bottom tools if needed */}
        <div className="w-6 h-px bg-border/50 my-1" />

        {/* Info label */}
        <div className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider -rotate-90 origin-center whitespace-nowrap mt-4">
          Tools
        </div>
      </div>
    </TooltipProvider>
  )
}
