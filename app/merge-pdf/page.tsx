"use client"

import { Merge, Layers, GripVertical, FileStack, Infinity } from "lucide-react"
import { ToolPageLayout } from "@/components/tools/ToolPageLayout"
import { HowToJsonLd } from "@/components/seo/JsonLd"
import { RelatedTools } from "@/components/seo/RelatedTools"

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

const howToSteps = [
  {
    name: "Select PDF files",
    text: "Click the upload button or drag and drop multiple PDF files you want to merge.",
  },
  {
    name: "Arrange the order",
    text: "Drag and drop the files to arrange them in your desired order. Preview pages to confirm.",
  },
  {
    name: "Download merged PDF",
    text: "Click the merge button and download your combined PDF file instantly.",
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
    <>
      <HowToJsonLd
        name="How to Merge PDF Files Online"
        description="Learn how to combine multiple PDF files into one document using SOLO PDF's free online merger."
        steps={howToSteps}
      />
      <ToolPageLayout
        title="Merge PDF"
        subtitle="Combine multiple files into one"
        description="Select your PDFs, arrange them in order, and download a single merged document. Everything happens locally in your browser."
        icon={Merge}
        steps={steps}
        features={features}
      >
        <RelatedTools currentPath="/merge-pdf" />
      </ToolPageLayout>
    </>
  )
}
