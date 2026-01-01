"use client"

import { motion } from "framer-motion"
import { BentoItem } from "./BentoItem"

const features = [
  {
    title: "PDF Editor",
    description: "Add text, images, annotations. Full editing power in your browser.",
    iconName: "FileEdit",
    variant: "featured" as const,
    className: "md:col-span-2 md:row-span-2",
    href: "/editor",
  },
  {
    title: "Merge",
    description: "Combine multiple PDFs",
    iconName: "Merge",
    href: "/merge",
  },
  {
    title: "Split",
    description: "Divide into parts",
    iconName: "Split",
    href: "/split",
  },
  {
    title: "100% Local",
    description: "Your files never leave your device. No uploads, no servers, no tracking.",
    iconName: "Lock",
    variant: "inverted" as const,
    className: "md:row-span-2",
  },
  {
    title: "Compress",
    description: "Reduce file size",
    iconName: "FileDown",
    href: "/compress",
  },
  {
    title: "Redact",
    description: "Hide sensitive info",
    iconName: "EyeOff",
    href: "/redact",
  },
  {
    title: "Sign",
    description: "Add signatures",
    iconName: "PenTool",
    href: "/sign",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function BentoGrid() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">
            Everything you need
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete toolkit for PDF editing, all running locally in your browser.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={feature.className}
            >
              <BentoItem
                title={feature.title}
                description={feature.description}
                iconName={feature.iconName}
                variant={feature.variant}
                href={feature.href}
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
