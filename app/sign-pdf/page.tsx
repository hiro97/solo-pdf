"use client"

import { PenTool, MousePointer, Smartphone, Stamp, Calendar } from "lucide-react"
import { ToolPageLayout } from "@/components/tools/ToolPageLayout"

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
    <ToolPageLayout
      title="Sign PDF"
      subtitle="Add your signature in seconds"
      description="Draw your signature, place it on the document, and download. No accounts, no cloud storage—completely private."
      icon={PenTool}
      steps={steps}
      features={features}
    />
  )
}
