"use client"

import { PenTool, MousePointer, Smartphone, Stamp, Calendar } from "lucide-react"
import { ToolPageLayout } from "@/components/tools/ToolPageLayout"
import { HowToJsonLd } from "@/components/seo/JsonLd"
import { RelatedTools } from "@/components/seo/RelatedTools"

const steps = [
  {
    number: "1",
    title: "Select PDF",
    description: "Choose the document to sign",
  },
  {
    number: "2",
    title: "Draw Signature",
    description: "Sign with mouse, trackpad, or touchscreen",
  },
  {
    number: "3",
    title: "Download",
    description: "Save your signed document",
  },
]

const howToSteps = [
  {
    name: "Upload your PDF",
    text: "Click the upload button or drag and drop the PDF document you need to sign.",
  },
  {
    name: "Draw your signature",
    text: "Use your mouse, trackpad, or touchscreen to draw your signature. Position it on the document.",
  },
  {
    name: "Download signed PDF",
    text: "Resize and position your signature perfectly, then download your signed document.",
  },
]

const features = [
  {
    icon: MousePointer,
    text: "Draw your signature naturally using mouse, trackpad, or stylus",
  },
  {
    icon: Smartphone,
    text: "Works great on touch devices—sign with your finger on tablet or phone",
  },
  {
    icon: Stamp,
    text: "Position and resize your signature to fit perfectly in signature fields",
  },
  {
    icon: Calendar,
    text: "Add date stamps alongside your signature for complete documentation",
  },
]

export default function SignPdfPage() {
  return (
    <>
      <HowToJsonLd
        name="How to Sign PDF Documents Online"
        description="Learn how to add electronic signatures to PDF documents using SOLO PDF's free online signing tool."
        steps={howToSteps}
      />
      <ToolPageLayout
        title="Sign PDF"
        subtitle="Add your signature in seconds"
        description="Draw your signature, place it on the document, and download. No accounts, no cloud storage—completely private."
        icon={PenTool}
        steps={steps}
        features={features}
      >
        <RelatedTools currentPath="/sign-pdf" />
      </ToolPageLayout>
    </>
  )
}
