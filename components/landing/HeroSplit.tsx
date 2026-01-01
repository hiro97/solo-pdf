"use client"

import { motion } from "framer-motion"
import { FileText, Shield, Lock } from "lucide-react"
import { KineticText } from "./KineticText"
import { ScrollIndicator } from "./ScrollIndicator"
import { FileSelectModal } from "@/components/shared/FileSelectModal"

function OrbitingPDFs() {
  const pdfs = [
    { delay: 0, size: 40, orbit: 80, duration: 8 },
    { delay: 2, size: 32, orbit: 110, duration: 10 },
    { delay: 4, size: 36, orbit: 140, duration: 12 },
    { delay: 1, size: 28, orbit: 100, duration: 9 },
  ]

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Browser boundary circle */}
      <motion.div
        className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full border-2 border-dashed border-primary/20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Inner shield */}
      <motion.div
        className="absolute flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative">
          <Shield className="w-16 h-16 md:w-20 md:h-20 text-primary/10" strokeWidth={1} />
          <Lock className="absolute inset-0 m-auto w-6 h-6 md:w-8 md:h-8 text-primary/40" />
        </div>
      </motion.div>

      {/* Orbiting PDFs */}
      {pdfs.map((pdf, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 + pdf.delay * 0.2 }}
          style={{
            width: pdf.orbit * 2,
            height: pdf.orbit * 2,
          }}
        >
          <motion.div
            className="absolute"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: pdf.duration,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <motion.div
              className="absolute glass p-2 rounded-lg"
              style={{
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                boxShadow: "var(--shadow-card)",
              }}
              whileHover={{ scale: 1.1 }}
            >
              <FileText
                style={{ width: pdf.size, height: pdf.size }}
                className="text-primary"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      ))}

      {/* "Your Browser" label */}
      <motion.div
        className="absolute -bottom-4 md:bottom-0 text-xs font-mono text-muted-foreground bg-background/80 px-3 py-1 rounded-full border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        Your Browser
      </motion.div>
    </div>
  )
}


export function HeroSplit() {
  return (
    <section className="relative min-h-[calc(100vh-8rem)] flex items-center overflow-hidden pr-4 -mt-8">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.03]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center min-h-[70vh]">
          {/* Left: Typography (60%) */}
          <div className="lg:col-span-3 space-y-4 pt-8 lg:pt-0">
            <div className="space-y-2">
              <KineticText
                text="Your Files."
                className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight"
                delay={0.2}
              />
              <KineticText
                text="Your Machine."
                className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight"
                delay={0.5}
              />
              <KineticText
                text="Your Rules."
                className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight text-primary"
                delay={0.8}
              />
            </div>

            <motion.p
              className="text-base md:text-lg font-mono text-muted-foreground max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
              Zero Upload. Local Only.
            </motion.p>

            {/* File Select Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="mt-6"
            >
              <FileSelectModal variant="hero" />
            </motion.div>
          </div>

          {/* Right: Animated visualization (40%) */}
          <div className="lg:col-span-2 h-[300px] lg:h-[400px] hidden md:block overflow-hidden">
            <OrbitingPDFs />
          </div>
        </div>
      </div>

      <ScrollIndicator />
    </section>
  )
}
