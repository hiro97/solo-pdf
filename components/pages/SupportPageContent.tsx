"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Mail,
  MessageSquare,
  RefreshCw,
  FileX,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lightbulb
} from "lucide-react"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { FAQPageJsonLd } from "@/components/seo/JsonLd"
import { supportFAQItems } from "@/components/marketing/FAQ"
import { AdSlot } from "@/components/ads/AdSlot"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const troubleshootingItems = [
  {
    icon: FileX,
    title: "Page won't load",
    solution: "Clear your browser cache and refresh. Try a different browser if the issue persists.",
  },
  {
    icon: RefreshCw,
    title: "PDF won't open",
    solution: "The file may be corrupted or password-protected. Try opening it in another PDF viewer first.",
  },
  {
    icon: AlertCircle,
    title: "Processing stuck",
    solution: "Large or complex files may take longer. Refresh and try with a smaller file.",
  },
  {
    icon: Download,
    title: "Can't download",
    solution: "Check your popup blocker settings. The browser may be blocking the download.",
  },
]

const quickTips = [
  "Use Chrome or Edge for best performance",
  "Files under 100MB work best",
  "Clear cache if features misbehave",
  "Works offline after first visit",
]

// Section indicator component
function SectionIndicator({ label, icon: Icon }: { label: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="h-4 w-4 text-[hsl(var(--free))]" />}
      <span className="text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--free))]">
        {label}
      </span>
    </div>
  )
}

export function SupportPageContent() {
  return (
    <>
      <FAQPageJsonLd questions={supportFAQItems} />

      {/* Fixed Right Sidebar Ad */}
      <aside className="fixed right-0 top-16 bottom-0 w-[160px] hidden lg:flex flex-col items-center py-4 z-40">
        <div className="sticky top-20">
          <AdSlot slot="sidebar-vertical" format="vertical" />
        </div>
      </aside>

      <div className="lg:mr-[180px]">
        {/* Top Banner Ad */}
        <div className="w-full flex justify-center py-4 border-b bg-muted/20">
          <AdSlot slot="top-banner" format="horizontal" className="max-w-[728px]" />
        </div>

        {/* Hero */}
        <section className="pt-12 pb-6">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Section indicator */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-[hsl(var(--free))]" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--free))]">
                    Help Center
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-3">
                How can we help?
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Find quick answers, troubleshooting tips, and ways to get in touch.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Support", href: "/support" }]} className="mb-8" />

          {/* Quick Tips */}
          <motion.section
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-2xl p-6 md:p-8
                            border border-[hsl(var(--free)/0.3)]
                            bg-gradient-to-br from-[hsl(var(--free)/0.05)] via-[hsl(var(--free)/0.08)] to-[hsl(var(--free)/0.02)]">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--free))]" />
                <span className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--free))]">
                  Quick Tips
                </span>
              </div>
              <ul className="grid sm:grid-cols-2 gap-3">
                {quickTips.map((tip, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))] shrink-0
                                     shadow-[0_0_6px_hsl(var(--free-glow))]" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          {/* Troubleshooting */}
          <motion.section
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionIndicator label="Troubleshooting" icon={Lightbulb} />
            <h2 className="text-xl font-serif font-medium mb-5">Common Issues</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {troubleshootingItems.map((item, i) => (
                <motion.div
                  key={i}
                  className="p-5 rounded-xl border bg-card/50 backdrop-blur-sm
                             hover:shadow-md hover:border-[hsl(var(--free)/0.3)] transition-all duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-lg
                                    bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                    flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-[hsl(var(--free))]" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.solution}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* FAQ */}
          <motion.section
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionIndicator label="FAQ" icon={HelpCircle} />
            <h2 className="text-xl font-serif font-medium mb-5">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {supportFAQItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-border/50 data-[state=open]:border-[hsl(var(--free)/0.3)]"
                >
                  <AccordionTrigger
                    className="text-left hover:no-underline hover:text-[hsl(var(--free))]
                               font-medium text-sm py-4 transition-colors"
                  >
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.section>

          {/* Contact */}
          <motion.section
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionIndicator label="Contact" icon={MessageSquare} />
            <h2 className="text-xl font-serif font-medium mb-5">Get in Touch</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href="mailto:jonghyun.captureall@gmail.com"
                className="group p-5 rounded-xl border bg-card/50 backdrop-blur-sm
                           hover:shadow-md hover:-translate-y-0.5 hover:border-[hsl(var(--free)/0.3)]
                           transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-11 h-11 rounded-xl
                                  bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--free))] group-hover:border-[hsl(var(--free))]
                                  transition-all duration-300">
                    <Mail className="w-5 h-5 text-[hsl(var(--free))] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Email Support</h3>
                    <p className="text-xs text-muted-foreground">Technical help & questions</p>
                  </div>
                </div>
                <p className="text-xs font-mono text-[hsl(var(--free))] group-hover:underline">
                  jonghyun.captureall@gmail.com
                </p>
              </a>

              <a
                href="mailto:jonghyun.captureall@gmail.com"
                className="group p-5 rounded-xl border bg-card/50 backdrop-blur-sm
                           hover:shadow-md hover:-translate-y-0.5 hover:border-[hsl(var(--free)/0.3)]
                           transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-11 h-11 rounded-xl
                                  bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--free))] group-hover:border-[hsl(var(--free))]
                                  transition-all duration-300">
                    <MessageSquare className="w-5 h-5 text-[hsl(var(--free))] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Feedback</h3>
                    <p className="text-xs text-muted-foreground">Feature requests & ideas</p>
                  </div>
                </div>
                <p className="text-xs font-mono text-[hsl(var(--free))] group-hover:underline">
                  jonghyun.captureall@gmail.com
                </p>
              </a>
            </div>
          </motion.section>

          {/* Still need help */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-2xl p-8 text-center
                            border border-[hsl(var(--free)/0.3)]
                            bg-gradient-to-br from-[hsl(var(--free)/0.05)] via-[hsl(var(--free)/0.08)] to-[hsl(var(--free)/0.02)]">
              {/* Section indicator */}
              <div className="section-indicator justify-center mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Still stuck?
                </span>
              </div>

              <h2 className="text-xl font-serif font-medium mb-2">
                Still need help?
              </h2>
              <p className="text-muted-foreground mb-6">
                Drop us an email and we'll get back to you within 24 hours.
              </p>
              <a
                href="mailto:jonghyun.captureall@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3
                           bg-[hsl(var(--free))] hover:bg-[hsl(var(--free)/0.9)]
                           text-white rounded-lg font-mono text-sm uppercase tracking-wider
                           transition-all duration-200 hover:-translate-y-0.5
                           shadow-[0_0_20px_hsl(var(--free-glow))]"
              >
                Contact Support
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  )
}
