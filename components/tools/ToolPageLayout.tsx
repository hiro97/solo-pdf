"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { Shield, Zap, WifiOff, LucideIcon } from "lucide-react"
import { FileSelectModal } from "@/components/shared/FileSelectModal"
import { AdSlot } from "@/components/ads/AdSlot"

interface Step {
  number: string
  title: string
  description: string
}

interface ToolPageLayoutProps {
  title: string
  subtitle: string
  description: string
  icon: LucideIcon
  steps: Step[]
  features?: { icon: LucideIcon; text: string }[]
  children?: ReactNode
}

const trustPoints = [
  { icon: Shield, text: "100% Private" },
  { icon: Zap, text: "Instant Processing" },
  { icon: WifiOff, text: "Works Offline" },
]

export function ToolPageLayout({
  title,
  subtitle,
  description,
  icon: Icon,
  steps,
  features,
  children,
}: ToolPageLayoutProps) {
  return (
    <>
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

        {/* Hero Section - Minimal, focused */}
        <section className="pt-12 pb-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <Icon className="w-8 h-8 text-primary" />
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-3">
                {title}
              </h1>

              <p className="text-xl text-muted-foreground mb-2">
                {subtitle}
              </p>

              <p className="text-sm text-muted-foreground/70 max-w-lg">
                {description}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Action - File Select */}
        <section className="pb-12">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full flex justify-center"
            >
              <FileSelectModal variant="default" />
            </motion.div>

            {/* Trust Points */}
            <motion.div
              className="flex items-center justify-center gap-6 mt-6 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {trustPoints.map((point, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <point.icon className="w-3.5 h-3.5" />
                  <span>{point.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it Works - Horizontal Timeline */}
        <section className="py-16 bg-muted/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-sm font-mono text-muted-foreground text-center mb-12 uppercase tracking-wider"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              How it works
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8 md:gap-4">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  className="relative flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
                  )}

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background border-2 border-primary/20 text-2xl font-serif text-primary mb-4">
                      {step.number}
                    </div>
                    <h3 className="font-medium mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground max-w-[200px]">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features - If provided */}
        {features && features.length > 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="grid sm:grid-cols-2 gap-6">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/30"
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">{feature.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Additional Content */}
        {children}

        {/* Bottom CTA */}
        <section className="py-16 border-t">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <p className="text-lg font-medium mb-6">Ready to get started?</p>
              <FileSelectModal variant="compact" />
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
