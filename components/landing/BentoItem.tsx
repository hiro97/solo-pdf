"use client"

import { useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  FileEdit,
  Merge,
  Split,
  FileDown,
  EyeOff,
  PenTool,
  Lock,
  type LucideIcon,
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  FileEdit,
  Merge,
  Split,
  FileDown,
  EyeOff,
  PenTool,
  Lock,
}

interface BentoItemProps {
  title: string
  description?: string
  iconName: string
  className?: string
  variant?: "default" | "featured" | "inverted"
  href?: string
}

export function BentoItem({
  title,
  description,
  iconName,
  className,
  variant = "default",
  href,
}: BentoItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    mouseX.set(x)
    mouseY.set(y)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  const Icon = iconMap[iconName] || FileEdit

  const content = (
    <motion.div
      ref={ref}
      className={cn(
        "relative h-full rounded-2xl p-6 transition-colors overflow-hidden",
        variant === "default" && "bg-card border hover:border-primary/20",
        variant === "featured" && "bg-card border-2 border-primary/10 hover:border-primary/30",
        variant === "inverted" && "bg-foreground text-background",
        className
      )}
      style={{
        rotateX: variant === "featured" ? rotateX : 0,
        rotateY: variant === "featured" ? rotateY : 0,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: variant === "featured" ? 1 : 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Subtle gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10 h-full flex flex-col">
        <motion.div
          animate={{
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0,
          }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Icon
            className={cn(
              "w-8 h-8 mb-4",
              variant === "inverted" ? "text-background" : "text-primary"
            )}
          />
        </motion.div>

        <h3
          className={cn(
            "font-semibold text-lg mb-2",
            variant === "inverted" && "text-background"
          )}
        >
          {title}
        </h3>

        {description && (
          <p
            className={cn(
              "text-sm",
              variant === "inverted"
                ? "text-background/70"
                : "text-muted-foreground"
            )}
          >
            {description}
          </p>
        )}
      </div>
    </motion.div>
  )

  if (href) {
    return (
      <a href={href} className="block h-full">
        {content}
      </a>
    )
  }

  return content
}
