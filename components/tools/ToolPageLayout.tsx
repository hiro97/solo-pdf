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
        <section className="pt-10 pb-6">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              {/* Hero icon with green accent */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5
                              bg-[hsl(var(--free))] shadow-[0_0_30px_hsl(var(--free-glow))]">
                <Icon className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-2">
                {title}
              </h1>

              <p className="text-lg text-muted-foreground mb-1.5">
                {subtitle}
              </p>

              <p className="text-sm text-muted-foreground/70 max-w-lg">
                {description}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Action - File Select */}
        <section className="pb-10">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex justify-center"
            >
              <FileSelectModal variant="default" />
            </motion.div>

            {/* Trust Points */}
            <motion.div
              className="flex items-center justify-center gap-6 mt-5 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {trustPoints.map((point, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                  flex items-center justify-center">
                    <point.icon className="w-3 h-3 text-[hsl(var(--free))]" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {point.text}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it Works - Horizontal Timeline */}
        <section className="py-12 bg-gradient-to-b from-muted/30 to-transparent">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <motion.div
              className="flex items-center justify-center gap-2 mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                              shadow-[0_0_6px_hsl(var(--free-glow))]" />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                How it works
              </span>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-4">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  className="relative flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Connector line - green accent */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-px bg-[hsl(var(--free)/0.2)]" />
                  )}

                  <div className="relative z-10 flex flex-col items-center">
                    {/* Step number with green background */}
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4
                                    bg-[hsl(var(--free))] text-white text-xl font-serif
                                    shadow-[0_0_20px_hsl(var(--free-glow))]">
                      {step.number}
                    </div>
                    <h3 className="font-medium mb-1.5 text-sm">{step.title}</h3>
                    <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
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
          <section className="py-12">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              {/* Section header */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                                shadow-[0_0_6px_hsl(var(--free-glow))]" />
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Features
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-xl border bg-card/50 backdrop-blur-sm
                               hover:border-[hsl(var(--free)/0.3)] hover:shadow-md transition-all duration-300"
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="shrink-0 w-10 h-10 rounded-lg
                                    bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                    flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-[hsl(var(--free))]" />
                    </div>
                    <p className="text-sm text-muted-foreground pt-2 leading-relaxed">{feature.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Additional Content */}
        {children}

        {/* Bottom CTA */}
        <section className="py-12 border-t">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              {/* Section indicator */}
              <div className="section-indicator justify-center mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Get Started
                </span>
              </div>

              <p className="text-lg font-serif font-medium mb-5">Ready to get started?</p>
              <FileSelectModal variant="compact" />
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
