"use client"

import { EyeOff, ShieldCheck, Eraser, Lock, FileWarning } from "lucide-react"
import { ToolPageLayout } from "@/components/tools/ToolPageLayout"
import { HowToJsonLd } from "@/components/seo/JsonLd"
import { RelatedTools } from "@/components/seo/RelatedTools"

const steps = [
  {
    number: "1",
    title: "Select PDF",
    description: "Choose the PDF with sensitive content",
  },
  {
    number: "2",
    title: "Mark Areas",
    description: "Select text or draw boxes over content to hide",
  },
  {
    number: "3",
    title: "Download",
    description: "Get your redacted PDF",
  },
]

const howToSteps = [
  {
    name: "Upload your PDF",
    text: "Click the upload button or drag and drop the PDF document containing sensitive information.",
  },
  {
    name: "Mark areas to redact",
    text: "Draw rectangles over text or images you want to permanently hide. Choose your redaction color.",
  },
  {
    name: "Download redacted PDF",
    text: "Preview your redactions, then download the document with sensitive content permanently removed.",
  },
]

const features = [
  {
    icon: ShieldCheck,
    text: "Redaction happens locally—sensitive documents never leave your device",
  },
  {
    icon: Eraser,
    text: "Draw rectangles over any area to permanently cover the content",
  },
  {
    icon: Lock,
    text: "Choose redaction color to match your compliance requirements",
  },
  {
    icon: FileWarning,
    text: "Preview redactions before saving to ensure nothing important is hidden",
  },
]

export default function RedactPdfPage() {
  return (
    <>
      <HowToJsonLd
        name="How to Redact PDF Documents Online"
        description="Learn how to permanently remove sensitive information from PDF documents using SOLO PDF's free online redaction tool."
        steps={howToSteps}
      />
      <ToolPageLayout
        title="Redact PDF"
        subtitle="Hide sensitive information permanently"
        description="Cover confidential data with black boxes. Perfect for legal documents, contracts, and personal information protection."
        icon={EyeOff}
        steps={steps}
        features={features}
      >
        <RelatedTools currentPath="/redact-pdf" />
      </ToolPageLayout>
    </>
  )
}
