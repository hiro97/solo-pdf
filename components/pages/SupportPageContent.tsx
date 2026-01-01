"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Mail,
  MessageSquare,
  RefreshCw,
  FileX,
  Smartphone,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertCircle
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
        <section className="pt-16 pb-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm font-mono text-primary mb-4 uppercase tracking-wider">
                Help Center
              </p>
              <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-4">
                How can we help?
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Find quick answers, troubleshooting tips, and ways to get in touch.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Support", href: "/support" }]} className="mb-8" />

          {/* Quick Tips */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6 md:p-8">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Quick Tips
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {quickTips.map((tip, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          {/* Troubleshooting */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-xl font-serif font-medium mb-6">Troubleshooting</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {troubleshootingItems.map((item, i) => (
                <motion.div
                  key={i}
                  className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
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
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 className="text-xl font-serif font-medium mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {supportFAQItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.section>

          {/* Contact */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h2 className="text-xl font-serif font-medium mb-6">Get in Touch</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href="mailto:support@solopdf.com"
                className="group p-6 rounded-xl border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-muted-foreground">Technical help & questions</p>
                  </div>
                </div>
                <p className="text-sm text-primary group-hover:underline">
                  support@solopdf.com
                </p>
              </a>

              <a
                href="mailto:feedback@solopdf.com"
                className="group p-6 rounded-xl border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Feedback</h3>
                    <p className="text-sm text-muted-foreground">Feature requests & ideas</p>
                  </div>
                </div>
                <p className="text-sm text-primary group-hover:underline">
                  feedback@solopdf.com
                </p>
              </a>
            </div>
          </motion.section>

          {/* Still need help */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div className="rounded-2xl border bg-muted/30 p-8 text-center">
              <h2 className="text-xl font-serif font-medium mb-2">
                Still need help?
              </h2>
              <p className="text-muted-foreground mb-6">
                Drop us an email and we'll get back to you within 24 hours.
              </p>
              <a
                href="mailto:support@solopdf.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
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
