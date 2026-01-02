"use client"

import { Type, Palette, Move, AlignLeft, Languages } from "lucide-react"
import { ToolPageLayout } from "@/components/tools/ToolPageLayout"
import { HowToJsonLd } from "@/components/seo/JsonLd"
import { RelatedTools } from "@/components/seo/RelatedTools"

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

const howToSteps = [
  {
    name: "Open your PDF",
    text: "Click the upload button or drag and drop the PDF file you want to add text to.",
  },
  {
    name: "Add and style text",
    text: "Click anywhere on the page to add text. Customize font, size, and color as needed.",
  },
  {
    name: "Download edited PDF",
    text: "Position your text precisely, then download your edited PDF file.",
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
    <>
      <HowToJsonLd
        name="How to Add Text to PDF Online"
        description="Learn how to insert text into PDF documents using SOLO PDF's free online text editor."
        steps={howToSteps}
      />
      <ToolPageLayout
        title="Add Text to PDF"
        subtitle="Insert text anywhere on the page"
        description="Click to add text, customize the style, and position it exactly where you need it. Your document never leaves your device."
        icon={Type}
        steps={steps}
        features={features}
      >
        <RelatedTools currentPath="/add-text-to-pdf" />
      </ToolPageLayout>
    </>
  )
}
