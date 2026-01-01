"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface KineticTextProps {
  text: string
  className?: string
  delay?: number
  staggerDelay?: number
  as?: "h1" | "h2" | "h3" | "p" | "span"
}

const charVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    rotateX: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
  },
}

export function KineticText({
  text,
  className,
  delay = 0,
  staggerDelay = 0.03,
  as: Component = "span",
}: KineticTextProps) {
  const MotionComponent = motion.create(Component)

  return (
    <MotionComponent
      className={cn("inline-block", className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      style={{ perspective: 1000 }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block"
          variants={charVariants}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </MotionComponent>
  )
}

interface KineticLinesProps {
  lines: { text: string; className?: string }[]
  containerClassName?: string
  lineDelay?: number
}

export function KineticLines({
  lines,
  containerClassName,
  lineDelay = 0.3,
}: KineticLinesProps) {
  return (
    <div className={cn("flex flex-col", containerClassName)}>
      {lines.map((line, i) => (
        <KineticText
          key={i}
          text={line.text}
          className={line.className}
          delay={i * lineDelay}
          as="span"
        />
      ))}
    </div>
  )
}
