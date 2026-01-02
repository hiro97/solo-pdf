"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  FileEdit,
  Type,
  Image,
  Highlighter,
  Merge,
  Split,
  FileDown,
  PenTool,
  EyeOff,
  Shield,
  Zap,
  WifiOff,
  Lock,
  ArrowRight,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileSelectModal } from "@/components/shared/FileSelectModal"
import {
  SoftwareApplicationJsonLd,
  FAQPageJsonLd,
  HowToJsonLd,
  ProductJsonLd,
} from "@/components/seo/JsonLd"

const editingFeatures = [
  {
    icon: Type,
    title: "Add Text",
    description: "Insert text anywhere on your PDF with custom fonts and sizes",
  },
  {
    icon: Image,
    title: "Insert Images",
    description: "Add photos, logos, or graphics to your documents",
  },
  {
    icon: Highlighter,
    title: "Annotations",
    description: "Highlight, underline, and add notes to important content",
  },
  {
    icon: PenTool,
    title: "Signatures",
    description: "Draw or type your signature directly on documents",
  },
]

const allTools = [
  { icon: FileEdit, title: "Edit PDF", href: "/editor" },
  { icon: Merge, title: "Merge PDF", href: "/merge-pdf" },
  { icon: Split, title: "Split PDF", href: "/split-pdf" },
  { icon: FileDown, title: "Compress PDF", href: "/compress-pdf" },
  { icon: PenTool, title: "Sign PDF", href: "/sign-pdf" },
  { icon: EyeOff, title: "Redact PDF", href: "/redact-pdf" },
]

const benefits = [
  "No software installation required",
  "Works on Windows, Mac, Linux, and mobile",
  "Files never leave your device",
  "No file size limits",
  "No watermarks on edited PDFs",
  "Completely free to use",
]

const faqs = [
  {
    question: "What can I edit in a PDF?",
    answer:
      "You can add text, insert images, draw annotations, add signatures, highlight content, and more. You can also merge multiple PDFs, split documents, compress file sizes, and redact sensitive information.",
  },
  {
    question: "How does the PDF editor work?",
    answer:
      "The editor runs entirely in your web browser using JavaScript and WebAssembly technology. When you open a PDF, it's processed locally on your device - no files are uploaded to any server.",
  },
  {
    question: "Can I edit scanned PDFs?",
    answer:
      "You can add annotations, text boxes, and images on top of scanned PDFs. For extracting text from scanned documents, you would need OCR software.",
  },
  {
    question: "Is the edited PDF quality the same as the original?",
    answer:
      "Yes, we preserve the original quality of your PDF. Images and text remain crisp, and the file structure is maintained during editing.",
  },
  {
    question: "Can I undo changes while editing?",
    answer:
      "Yes, the editor supports undo and redo functionality. You can also discard all changes and revert to the original document at any time.",
  },
]

const howToSteps = [
  {
    name: "Upload your PDF",
    text: "Click 'Select PDF' or drag and drop your file. The PDF loads instantly in your browser.",
  },
  {
    name: "Make your edits",
    text: "Use the toolbar to add text, images, signatures, annotations, or make any other changes you need.",
  },
  {
    name: "Save your work",
    text: "Click Download to save your edited PDF. All processing happens locally, so it's instant.",
  },
]

export default function PdfEditorPage() {
  return (
    <>
      {/* Structured Data */}
      <SoftwareApplicationJsonLd
        name="SOLO PDF Editor"
        description="Professional PDF editor in your browser. Add text, images, signatures. Merge, split, compress PDFs. Works offline, 100% private."
        applicationCategory="BusinessApplication"
      />
      <ProductJsonLd />
      <FAQPageJsonLd questions={faqs} />
      <HowToJsonLd
        name="How to Edit PDF Files Online"
        description="Learn how to edit PDF documents using SOLO PDF's browser-based editor."
        steps={howToSteps}
      />

      {/* Hero Section */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight mb-6">
              PDF Editor
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Professional PDF editing in your browser. Add text, images, and signatures.
              No installation, no upload, complete privacy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <FileSelectModal variant="default" />
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>100% Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>Instant Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-primary" />
                <span>Works Offline</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>No Upload</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Editing Features */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Powerful PDF Editing Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to edit PDF documents professionally
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {editingFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="flex gap-4 p-6 rounded-xl bg-card border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Tools */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Complete PDF Toolkit
            </h2>
            <p className="text-muted-foreground">
              All the tools you need in one place
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allTools.map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={tool.href}>
                  <div className="group flex items-center gap-3 p-4 rounded-xl bg-card border hover:border-primary/50 hover:shadow-md transition-all">
                    <tool.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {tool.title}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Why Choose Our PDF Editor
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-4 rounded-lg bg-card"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Check className="w-5 h-5 text-green-500 shrink-0" />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              How to Edit PDFs
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howToSteps.map((step, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-2">{step.name}</h3>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              PDF Editor FAQ
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl bg-card border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Ready to Edit Your PDF?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Open your PDF and start editing in seconds. No signup required.
            </p>
            <Link href="/editor">
              <Button size="lg" variant="secondary" className="gap-2">
                Open PDF Editor
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
