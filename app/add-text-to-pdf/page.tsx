"use client"

import { Type, Palette, Move, AlignLeft, Languages } from "lucide-react"
import { ToolPageLayout } from "@/components/tools/ToolPageLayout"

const steps = [
  {
    number: "1",
    title: "Select PDF",
    description: "Choose the PDF you want to edit",
  },
  {
    number: "2",
    title: "Add Text",
    description: "Click anywhere to insert and style text",
  },
  {
    number: "3",
    title: "Download",
    description: "Save your edited PDF",
  },
]

const features = [
  {
    icon: Palette,
    text: "Customize text with different fonts, sizes, and colors to match your document",
  },
  {
    icon: Move,
    text: "Position text precisely anywhere on the page with drag-and-drop placement",
  },
  {
    icon: AlignLeft,
    text: "Add single words, sentences, or entire paragraphs with proper alignment",
  },
  {
    icon: Languages,
    text: "Full Unicode support for any language including special characters",
  },
]

export default function AddTextToPdfPage() {
  return (
    <ToolPageLayout
      title="Add Text to PDF"
      subtitle="Insert text anywhere on the page"
      description="Click to add text, customize the style, and position it exactly where you need it. Your document never leaves your device."
      icon={Type}
      steps={steps}
      features={features}
    />
  )
}
