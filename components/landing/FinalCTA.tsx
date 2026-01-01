"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCTA() {
  return (
    <section className="py-24 md:py-32 bg-foreground text-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif mb-8 leading-tight">
            Ready to keep your
            <br />
            PDFs to yourself?
          </h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-14 px-8 text-lg gap-3 rounded-full"
            >
              <a href="/editor">
                Open the Editor
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
          </motion.div>

          <motion.p
            className="mt-8 text-background/60 text-sm font-mono"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            No account. No upload. No kidding.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
