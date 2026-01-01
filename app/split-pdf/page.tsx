"use client"

import { Split, FileOutput, Scissors, BookOpen, Target } from "lucide-react"
import { ToolPageLayout } from "@/components/tools/ToolPageLayout"

const steps = [
  {
    number: "1",
    title: "Select PDF",
    description: "Choose the PDF file you want to split",
  },
  {
    number: "2",
    title: "Choose Pages",
    description: "Select pages or set split points",
  },
  {
    number: "3",
    title: "Download",
    description: "Get your separated PDF files",
  },
]

const features = [
  {
    icon: Scissors,
    text: "Split a PDF into individual pages or custom page ranges like 1-5, 10-15",
  },
  {
    icon: Target,
    text: "Extract specific pages without affecting the original document",
  },
  {
    icon: FileOutput,
    text: "Download split files individually or as a convenient ZIP archive",
  },
  {
    icon: BookOpen,
    text: "Preview each page before splitting to select exactly what you need",
  },
]

export default function SplitPdfPage() {
  return (
    <ToolPageLayout
      title="Split PDF"
      subtitle="Separate pages into multiple files"
      description="Extract specific pages or split your PDF into multiple documents. Works offline, entirely in your browser."
      icon={Split}
      steps={steps}
      features={features}
    />
  )
}
