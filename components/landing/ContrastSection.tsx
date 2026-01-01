"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  Upload,
  Server,
  HelpCircle,
  ArrowRight,
  Cpu,
  Check,
  Shield,
} from "lucide-react"

const cloudPoints = [
  { icon: Upload, text: "Upload your files", subtext: "To unknown servers" },
  { icon: Server, text: "Wait for processing", subtext: "Server dependent" },
  { icon: HelpCircle, text: "Hope nothing goes wrong", subtext: "Trust required" },
]

const localPoints = [
  { icon: ArrowRight, text: "Files stay local", subtext: "Never uploaded" },
  { icon: Cpu, text: "Your CPU processes", subtext: "Instant results" },
  { icon: Shield, text: "Complete privacy", subtext: "Always with you" },
]

export function ContrastSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const leftX = useTransform(scrollYProgress, [0, 0.5], [-50, 0])
  const rightX = useTransform(scrollYProgress, [0, 0.5], [50, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])

  return (
    <section ref={containerRef} className="py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          style={{ opacity }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">
            The difference is clear
          </h2>
          <p className="text-muted-foreground text-lg">
            Cloud services require trust. We require nothing.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-0">
          {/* Cloud Way - Left */}
          <motion.div
            className="relative p-8 md:p-12 bg-muted/50 rounded-2xl md:rounded-r-none"
            style={{ x: leftX, opacity }}
          >
            <div className="absolute top-6 left-6 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              The Cloud Way
            </div>

            <div className="mt-8 space-y-8">
              {cloudPoints.map((point, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <point.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      {point.text}
                    </p>
                    <p className="text-sm text-muted-foreground/60">
                      {point.subtext}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desaturated overlay */}
            <div className="absolute inset-0 bg-background/30 rounded-2xl md:rounded-r-none pointer-events-none" />
          </motion.div>

          {/* Solo Way - Right */}
          <motion.div
            className="relative p-8 md:p-12 bg-primary/5 border-2 border-primary/10 rounded-2xl md:rounded-l-none"
            style={{ x: rightX, opacity }}
          >
            <div className="absolute top-6 left-6 text-xs font-mono text-primary uppercase tracking-wider flex items-center gap-2">
              The Solo Way
              <Check className="w-4 h-4" />
            </div>

            <div className="mt-8 space-y-8">
              {localPoints.map((point, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <point.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{point.text}</p>
                    <p className="text-sm text-muted-foreground">
                      {point.subtext}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
