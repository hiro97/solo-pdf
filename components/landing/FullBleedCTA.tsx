"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"

export function FullBleedCTA() {
  return (
    <section className="relative">
      <Link href="/editor" className="block group">
        <motion.div
          className="relative w-full py-16 sm:py-24 bg-[hsl(var(--free))] overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
            <motion.div
              className="flex items-center gap-2 mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Sparkles className="w-5 h-5 text-white/80" />
              <span className="text-sm font-mono uppercase tracking-wider text-white/80">
                Start Now
              </span>
            </motion.div>

            <motion.h2
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              EDIT YOUR FIRST
              <br />
              PDF NOW
            </motion.h2>

            <motion.div
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-6 text-white/80"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-xs font-mono uppercase tracking-wider">FREE</span>
              <span className="opacity-50">•</span>
              <span className="text-xs font-mono uppercase tracking-wider">NO SIGN UP</span>
              <span className="opacity-50">•</span>
              <span className="text-xs font-mono uppercase tracking-wider">NO UPLOAD</span>
            </motion.div>

            <motion.div
              className="mt-8 flex items-center gap-2 px-6 py-3 bg-white text-[hsl(var(--free))] rounded-full font-bold uppercase tracking-wide group-hover:bg-white/90 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <span>Open Editor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </div>

          {/* Bottom edge decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </motion.div>
      </Link>
    </section>
  )
}
