"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Eye,
  Search,
  ZoomIn,
  Bookmark,
  FileEdit,
  Merge,
  Split,
  FileDown,
  PenTool,
  EyeOff,
  Shield,
  Zap,
  WifiOff,
  ArrowRight,
  Check,
  Smartphone,
} from "lucide-react"
import { FileSelectModal } from "@/components/shared/FileSelectModal"
import {
  SoftwareApplicationJsonLd,
  FAQPageJsonLd,
  HowToJsonLd,
} from "@/components/seo/JsonLd"

const viewerFeatures = [
  {
    icon: Eye,
    title: "Crystal Clear Viewing",
    description: "High-quality PDF rendering that preserves every detail",
  },
  {
    icon: Search,
    title: "Text Search",
    description: "Find any text instantly within your PDF documents",
  },
  {
    icon: ZoomIn,
    title: "Zoom & Navigate",
    description: "Smooth zooming and easy page navigation",
  },
  {
    icon: Bookmark,
    title: "Bookmarks",
    description: "Jump to sections using document bookmarks",
  },
]

const allTools = [
  { icon: FileEdit, title: "Edit PDF", href: "/editor", desc: "Edit your PDF" },
  { icon: Merge, title: "Merge PDF", href: "/merge-pdf", desc: "Combine PDFs" },
  { icon: Split, title: "Split PDF", href: "/split-pdf", desc: "Separate pages" },
  { icon: FileDown, title: "Compress PDF", href: "/compress-pdf", desc: "Reduce size" },
  { icon: PenTool, title: "Sign PDF", href: "/sign-pdf", desc: "Add signature" },
  { icon: EyeOff, title: "Redact PDF", href: "/redact-pdf", desc: "Hide info" },
]

const benefits = [
  "View PDFs instantly in your browser",
  "No software download required",
  "Works on any device - desktop, tablet, mobile",
  "Complete privacy - files stay on your device",
  "Fast loading even for large documents",
  "Supports all PDF versions",
]

const faqs = [
  {
    question: "How do I view a PDF file online?",
    answer:
      "Simply click the 'Select PDF' button or drag and drop your PDF file into the viewer. The document will open instantly in your browser without any upload to servers.",
  },
  {
    question: "Is the PDF viewer free to use?",
    answer:
      "Yes, the PDF viewer is completely free with no limitations. You can view as many PDFs as you want without any cost.",
  },
  {
    question: "Can I view PDFs on my phone?",
    answer:
      "Absolutely! The PDF viewer works on all devices including iPhones, Android phones, and tablets. The interface adapts to your screen size for optimal viewing.",
  },
  {
    question: "Are my PDF files secure?",
    answer:
      "Yes, your files never leave your device. The PDF viewer processes everything locally in your browser, so no data is sent to any server.",
  },
  {
    question: "Can I print the PDF after viewing?",
    answer:
      "Yes, you can use your browser's print function (Ctrl+P or Cmd+P) to print any PDF you're viewing.",
  },
  {
    question: "What's the difference between viewing and editing?",
    answer:
      "Viewing lets you read and navigate the PDF. If you need to make changes like adding text, images, or signatures, you can switch to our PDF editor with one click.",
  },
]

const howToSteps = [
  {
    name: "Select your PDF",
    text: "Click 'Select PDF' or drag and drop your file. No upload required.",
  },
  {
    name: "View and navigate",
    text: "Browse pages, zoom in/out, search for text, and use bookmarks.",
  },
  {
    name: "Edit if needed",
    text: "Switch to edit mode anytime to add text, signatures, or annotations.",
  },
]

export default function PdfViewerPage() {
  return (
    <>
      {/* Structured Data */}
      <SoftwareApplicationJsonLd
        name="SOLO PDF Viewer"
        description="Free online PDF viewer. View PDF files in your browser with complete privacy. No download required."
        applicationCategory="BusinessApplication"
      />
      <FAQPageJsonLd questions={faqs} />
      <HowToJsonLd
        name="How to View PDF Files Online"
        description="Learn how to view PDF documents online using SOLO PDF's free browser-based viewer."
        steps={howToSteps}
      />

      {/* Hero Section */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge with green theme */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6
                            bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                            text-[hsl(var(--free))] text-sm font-mono uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              Fast & Private PDF Viewing
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight mb-6">
              PDF Viewer
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              View PDF files online for free. Fast, lightweight, and completely private.
              No download or installation required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <FileSelectModal variant="default" />
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-[hsl(var(--free))]" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider">100% Private</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-[hsl(var(--free))]" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider">Instant Loading</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5 text-[hsl(var(--free))]" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider">Works on All Devices</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                flex items-center justify-center">
                  <WifiOff className="w-3.5 h-3.5 text-[hsl(var(--free))]" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider">Works Offline</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Viewer Features */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Section indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                              shadow-[0_0_6px_hsl(var(--free-glow))]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Features
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              PDF Viewer Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for comfortable PDF reading
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {viewerFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="flex gap-4 p-6 rounded-xl bg-card border
                           hover:border-[hsl(var(--free)/0.3)] transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="shrink-0 w-12 h-12 rounded-lg bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-[hsl(var(--free))]" />
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

      {/* Benefits */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Section indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                              shadow-[0_0_6px_hsl(var(--free-glow))]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Benefits
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Why Use Our PDF Viewer
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-4 rounded-lg bg-card border
                           hover:border-[hsl(var(--free)/0.3)] transition-colors"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-5 h-5 rounded-full bg-[hsl(var(--free))] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Need More? */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Section indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                              shadow-[0_0_6px_hsl(var(--free-glow))]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                More Tools
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Need to Edit Your PDF?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our PDF viewer works seamlessly with our editing tools
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allTools.map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={tool.href}>
                  <div className="group p-4 rounded-xl bg-card border
                                  hover:border-[hsl(var(--free)/0.5)] hover:shadow-md transition-all text-center">
                    <div className="w-10 h-10 rounded-lg mx-auto mb-2
                                    bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                    flex items-center justify-center
                                    group-hover:bg-[hsl(var(--free))] group-hover:border-[hsl(var(--free))]
                                    transition-all duration-200">
                      <tool.icon className="w-5 h-5 text-[hsl(var(--free))] group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-medium group-hover:text-[hsl(var(--free))] transition-colors block">
                      {tool.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{tool.desc}</span>
                  </div>
                </Link>
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
            transition={{ ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Section indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                              shadow-[0_0_6px_hsl(var(--free-glow))]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                How It Works
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              How to View PDFs Online
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howToSteps.map((step, i) => (
              <motion.div
                key={i}
                className="text-center relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Connector line */}
                {i < howToSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-[hsl(var(--free)/0.2)]" />
                )}

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
                                  bg-[hsl(var(--free))] text-white text-2xl font-serif
                                  shadow-[0_0_20px_hsl(var(--free-glow))]">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold mb-2">{step.name}</h3>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </div>
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
            transition={{ ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Section indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                              shadow-[0_0_6px_hsl(var(--free-glow))]" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                FAQ
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              PDF Viewer FAQ
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-xl bg-card border hover:border-[hsl(var(--free)/0.3)] transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-[hsl(var(--free))]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Section indicator - white version */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/80">
                Get Started
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-white">
              Start Viewing PDFs Now
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Open any PDF file instantly. No download, no signup required.
            </p>
            <Link href="/editor">
              <button className="inline-flex items-center gap-2 px-6 py-3
                                 bg-white text-[hsl(var(--free))] rounded-lg
                                 font-mono text-sm uppercase tracking-wider
                                 hover:bg-white/90 transition-all duration-200
                                 hover:-translate-y-0.5 shadow-lg">
                Open PDF Viewer
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
