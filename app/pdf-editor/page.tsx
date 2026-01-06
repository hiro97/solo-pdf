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

const trustPoints = [
  { icon: Shield, text: "100% Private" },
  { icon: Zap, text: "Instant Processing" },
  { icon: WifiOff, text: "Works Offline" },
  { icon: Lock, text: "No Upload" },
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
      <section className="pt-12 pb-10 md:pt-20 md:pb-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight mb-5">
              PDF Editor
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Professional PDF editing in your browser. Add text, images, and signatures.
              No installation, no upload, complete privacy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <FileSelectModal variant="default" />
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-5 mt-8">
              {trustPoints.map((point, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                  flex items-center justify-center">
                    <point.icon className="w-3.5 h-3.5 text-[hsl(var(--free))]" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {point.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Editing Features */}
      <section className="py-12 bg-gradient-to-b from-muted/30 to-transparent">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                              shadow-[0_0_6px_hsl(var(--free-glow))]" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Features
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif mb-3">
              Powerful PDF Editing Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Everything you need to edit PDF documents professionally
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {editingFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="flex gap-4 p-5 rounded-xl bg-card/50 backdrop-blur-sm border
                           hover:border-[hsl(var(--free)/0.3)] hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="shrink-0 w-11 h-11 rounded-lg
                                bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-[hsl(var(--free))]" />
                </div>
                <div>
                  <h3 className="font-medium mb-1 text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Tools */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                              shadow-[0_0_6px_hsl(var(--free-glow))]" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Tools
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif mb-3">
              Complete PDF Toolkit
            </h2>
            <p className="text-muted-foreground text-sm">
              All the tools you need in one place
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {allTools.map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={tool.href}>
                  <div className="group flex items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border
                                  hover:border-[hsl(var(--free)/0.3)] hover:shadow-md transition-all duration-300">
                    <div className="w-8 h-8 rounded-lg bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                    flex items-center justify-center
                                    group-hover:bg-[hsl(var(--free))] group-hover:border-[hsl(var(--free))]
                                    transition-all duration-300">
                      <tool.icon className="w-4 h-4 text-[hsl(var(--free))] group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-medium text-sm group-hover:text-[hsl(var(--free))] transition-colors">
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
      <section className="py-12 bg-gradient-to-b from-muted/30 to-transparent">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                              shadow-[0_0_6px_hsl(var(--free-glow))]" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Benefits
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif">
              Why Choose Our PDF Editor
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-3">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm border
                           hover:border-[hsl(var(--free)/0.3)] transition-all duration-300"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <Check className="w-4 h-4 text-[hsl(var(--free))] shrink-0" />
                <span className="text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                              shadow-[0_0_6px_hsl(var(--free-glow))]" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                How it works
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif">
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
                transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4
                                bg-[hsl(var(--free))] text-white text-xl font-serif
                                shadow-[0_0_20px_hsl(var(--free-glow))]">
                  {i + 1}
                </div>
                <h3 className="font-medium mb-1.5 text-sm">{step.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-gradient-to-b from-muted/30 to-transparent">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                              shadow-[0_0_6px_hsl(var(--free-glow))]" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                FAQ
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif">
              PDF Editor FAQ
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="p-5 rounded-xl bg-card/50 backdrop-blur-sm border
                           hover:border-[hsl(var(--free)/0.3)] transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="font-medium mb-2 text-sm">{faq.question}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 bg-[hsl(var(--free))]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Section indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              <span className="text-[10px] font-mono text-white/70 uppercase tracking-wider">
                Get Started
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-serif text-white mb-3">
              Ready to Edit Your PDF?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto text-sm">
              Open your PDF and start editing in seconds. No signup required.
            </p>
            <Link href="/editor">
              <button className="inline-flex items-center gap-2 px-6 py-3
                                 bg-white text-[hsl(var(--free))] rounded-lg
                                 font-mono text-sm uppercase tracking-wider
                                 hover:bg-white/90 transition-all duration-200
                                 hover:-translate-y-0.5 shadow-lg">
                Open PDF Editor
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
