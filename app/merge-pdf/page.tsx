"use client"

import { Merge, Layers, GripVertical, FileStack, Infinity } from "lucide-react"
import { ToolPageLayout } from "@/components/tools/ToolPageLayout"

const steps = [
  {
    number: "1",
    title: "Select PDFs",
    description: "Choose multiple PDF files from your device",
  },
  {
    number: "2",
    title: "Arrange Order",
    description: "Drag and drop to set the page sequence",
  },
  {
    number: "3",
    title: "Download",
    description: "Get your merged PDF instantly",
  },
]

const features = [
  {
    icon: Layers,
    text: "Combine unlimited PDFs into a single document with no file count restrictions",
  },
  {
    icon: GripVertical,
    text: "Intuitive drag-and-drop interface to arrange pages in any order you want",
  },
  {
    icon: FileStack,
    text: "Preview pages before merging to ensure everything is in the right place",
  },
  {
    icon: Infinity,
    text: "No watermarks, no quality loss—your merged PDF is exactly as you arranged it",
  },
]

export default function MergePdfPage() {
  return (
    <ToolPageLayout
      title="Merge PDF"
      subtitle="Combine multiple files into one"
      description="Select your PDFs, arrange them in order, and download a single merged document. Everything happens locally in your browser."
      icon={Merge}
      steps={steps}
      features={features}
    />
  )
}
