"use client"

import { EyeOff, ShieldCheck, Eraser, Lock, FileWarning } from "lucide-react"
import { ToolPageLayout } from "@/components/tools/ToolPageLayout"

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
    <ToolPageLayout
      title="Redact PDF"
      subtitle="Hide sensitive information permanently"
      description="Cover confidential data with black boxes. Perfect for legal documents, contracts, and personal information protection."
      icon={EyeOff}
      steps={steps}
      features={features}
    />
  )
}
