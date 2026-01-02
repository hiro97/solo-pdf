"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  FileEdit,
  Merge,
  Split,
  FileDown,
  PenTool,
  EyeOff,
  Shield,
  Zap,
  WifiOff,
  Lock,
  Check,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileSelectModal } from "@/components/shared/FileSelectModal"
import {
  SoftwareApplicationJsonLd,
  FAQPageJsonLd,
  HowToJsonLd,
} from "@/components/seo/JsonLd"

const tools = [
  {
    icon: FileEdit,
    title: "Edit PDF",
    description: "Add text, images, and annotations to any PDF",
    href: "/editor",
  },
  {
    icon: Merge,
    title: "Merge PDF",
    description: "Combine multiple PDFs into one document",
    href: "/merge-pdf",
  },
  {
    icon: Split,
    title: "Split PDF",
    description: "Separate pages or extract specific sections",
    href: "/split-pdf",
  },
  {
    icon: FileDown,
    title: "Compress PDF",
    description: "Reduce file size while maintaining quality",
    href: "/compress-pdf",
  },
  {
    icon: PenTool,
    title: "Sign PDF",
    description: "Add electronic signatures to documents",
    href: "/sign-pdf",
  },
  {
    icon: EyeOff,
    title: "Redact PDF",
    description: "Permanently remove sensitive information",
    href: "/redact-pdf",
  },
]

const features = [
  {
    icon: Shield,
    title: "100% Free",
    description: "No hidden fees, no premium tiers, no credit card required",
  },
  {
    icon: Lock,
    title: "Complete Privacy",
    description: "Files never leave your device - zero server uploads",
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description: "Edit PDFs immediately without waiting for uploads",
  },
  {
    icon: WifiOff,
    title: "Works Offline",
    description: "Once loaded, use without internet connection",
  },
]

const faqs = [
  {
    question: "Is this PDF editor really free?",
    answer:
      "Yes, SOLO PDF is completely free to use. There are no hidden costs, premium tiers, or feature limitations. We sustain our service through minimal, non-intrusive advertising. You get full access to all PDF editing features without paying anything.",
  },
  {
    question: "Do I need to create an account to edit PDFs?",
    answer:
      "No account or signup is required. You can start editing PDFs immediately without providing any personal information. Simply open your PDF file and begin editing right away.",
  },
  {
    question: "Is my PDF data secure and private?",
    answer:
      "Absolutely. Your files are processed entirely in your browser using JavaScript and WebAssembly. They never leave your device or get uploaded to any server. This is the most secure way to edit PDFs online.",
  },
  {
    question: "What PDF editing features are included for free?",
    answer:
      "All features are free: add text, insert images, draw annotations, merge multiple PDFs, split documents, compress files, add signatures, and redact sensitive information. There are no locked premium features.",
  },
  {
    question: "Does it work on mobile devices?",
    answer:
      "Yes, SOLO PDF works on any device with a modern web browser including smartphones and tablets. The interface is responsive and optimized for touch screens.",
  },
  {
    question: "Can I edit PDFs offline?",
    answer:
      "Yes! Once the page loads, you can disconnect from the internet and continue editing. All processing happens locally in your browser, so no network connection is needed after the initial page load.",
  },
]

const howToSteps = [
  {
    name: "Open your PDF",
    text: "Click the 'Select PDF' button or drag and drop your PDF file into the browser.",
  },
  {
    name: "Edit your document",
    text: "Use the toolbar to add text, images, signatures, or annotations. Merge, split, or compress as needed.",
  },
  {
    name: "Download the result",
    text: "When finished, click Download to save your edited PDF. The file is processed entirely in your browser.",
  },
]

export default function FreePdfEditorPage() {
  return (
    <>
      {/* Structured Data */}
      <SoftwareApplicationJsonLd
        name="SOLO PDF - Free PDF Editor"
        description="Free PDF editor online - edit, merge, split, compress PDFs in your browser with complete privacy"
        applicationCategory="BusinessApplication"
      />
      <FAQPageJsonLd questions={faqs} />
      <HowToJsonLd
        name="How to Edit PDFs for Free Online"
        description="Learn how to edit PDF files for free using SOLO PDF's browser-based editor with no upload required."
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium mb-6">
              <Check className="w-4 h-4" />
              100% Free - No Signup Required
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight mb-6">
              Free PDF Editor Online
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Edit PDF files for free directly in your browser. No upload, no account needed.
              Complete privacy with all processing done locally on your device.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <FileSelectModal variant="default" />
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {features.slice(0, 4).map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span>{feature.title}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              All PDF Tools, Completely Free
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to edit, convert, and manage PDF documents - no cost, no limits.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={tool.href}>
                  <div className="group p-6 rounded-xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all h-full">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <tool.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Free Section */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Why SOLO PDF is Free
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We believe everyone deserves access to powerful PDF tools without paywalls.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="flex gap-4"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
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

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              How to Edit PDFs for Free
            </h2>
            <p className="text-muted-foreground">
              Three simple steps to edit any PDF document
            </p>
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

      {/* FAQ Section */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Common questions about our free PDF editor
            </p>
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
              Start Editing PDFs for Free
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              No signup, no upload, no limits. Just open your PDF and start editing.
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
