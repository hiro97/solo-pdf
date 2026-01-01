"use client"

import { FileDown, Gauge, ImageDown, Mail, HardDrive } from "lucide-react"
import { ToolPageLayout } from "@/components/tools/ToolPageLayout"

const steps = [
  {
    number: "1",
    title: "Select PDF",
    description: "Choose the PDF you want to compress",
  },
  {
    number: "2",
    title: "Choose Quality",
    description: "Select compression level (low, medium, high)",
  },
  {
    number: "3",
    title: "Download",
    description: "Get your smaller PDF file",
  },
]

const features = [
  {
    icon: Gauge,
    text: "Multiple compression levels to balance file size and visual quality",
  },
  {
    icon: ImageDown,
    text: "Smart image optimization that reduces size while keeping text sharp",
  },
  {
    icon: Mail,
    text: "Perfect for email attachments—compress to fit under size limits",
  },
  {
    icon: HardDrive,
    text: "Reduce storage space without losing important document content",
  },
]

export default function CompressPdfPage() {
  return (
    <ToolPageLayout
      title="Compress PDF"
      subtitle="Reduce file size, keep the quality"
      description="Shrink your PDF for easy sharing via email or messaging. Processing happens locally—your files stay private."
      icon={FileDown}
      steps={steps}
      features={features}
    />
  )
}
