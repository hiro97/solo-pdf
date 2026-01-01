"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "Is it really free?",
    answer:
      "Yes, completely free. No hidden fees, no premium tiers, no limits. We sustain through minimal, non-intrusive ads.",
    position: "top-0 left-[5%] md:left-[10%]",
  },
  {
    question: "Why no upload?",
    answer:
      "Your browser is powerful. Modern JavaScript and WebAssembly can handle PDF processing locally. No server needed.",
    position: "top-4 right-[5%] md:right-[15%]",
  },
  {
    question: "What browsers work?",
    answer:
      "Chrome, Firefox, Safari, Edge - any modern browser from the last 3 years. We recommend Chrome for best performance.",
    position: "top-24 left-[15%] md:left-[25%]",
  },
  {
    question: "File size limit?",
    answer:
      "Depends on your device's memory, but typically 50-100MB works smoothly. Larger files may be slower but still work.",
    position: "top-20 right-[10%] md:right-[5%]",
  },
  {
    question: "Is my data safe?",
    answer:
      "Absolutely. Your files are processed in your browser's sandboxed environment. They never touch our servers or any network.",
    position: "top-44 left-[5%] md:left-[5%]",
  },
  {
    question: "Works offline?",
    answer:
      "Yes! Once the page loads, you can go offline. All processing happens locally in your browser.",
    position: "top-40 right-[15%] md:right-[20%]",
  },
]

interface FAQPillProps {
  question: string
  answer: string
  position: string
  isActive: boolean
  onClick: () => void
}

function FAQPill({ question, answer, position, isActive, onClick }: FAQPillProps) {
  return (
    <motion.div
      className={cn("absolute", position)}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium transition-all",
          isActive
            ? "bg-primary text-primary-foreground shadow-lg"
            : "bg-card border hover:border-primary/50 hover:shadow-md"
        )}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {question}
      </motion.button>
    </motion.div>
  )
}

export function FloatingFAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handleClick = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">
            Questions?
          </h2>
          <p className="text-muted-foreground">Click any question below</p>
        </motion.div>

        {/* Floating pills container */}
        <div className="relative h-[280px] md:h-[200px] mb-8">
          {faqs.map((faq, i) => (
            <FAQPill
              key={i}
              question={faq.question}
              answer={faq.answer}
              position={faq.position}
              isActive={activeIndex === i}
              onClick={() => handleClick(i)}
            />
          ))}
        </div>

        {/* Answer card */}
        <AnimatePresence mode="wait">
          {activeIndex !== null && (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-elevated p-6 md:p-8 relative">
                <button
                  onClick={() => setActiveIndex(null)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
                <h3 className="font-semibold text-lg mb-3">
                  {faqs[activeIndex].question}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {faqs[activeIndex].answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Placeholder when no question selected */}
        {activeIndex === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground/50 py-8"
          >
            <p className="text-sm">Select a question to see the answer</p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
