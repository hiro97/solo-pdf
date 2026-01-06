"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { KineticText } from "./KineticText"
import { ScrollIndicator } from "./ScrollIndicator"
import { FileSelectModal } from "@/components/shared/FileSelectModal"

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

          {/* Right: Hero Image (40%) */}
          <motion.div
            className="lg:col-span-2 hidden md:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/hero-image.png"
              alt="Free PDF Editor"
              width={500}
              height={500}
              className="w-full max-w-md"
              priority
            />
          </motion.div>
        </div>
      </div>

      <ScrollIndicator />
    </section>
  )
}
