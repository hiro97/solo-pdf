"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Upload, Database, Cpu, DollarSign } from "lucide-react"

interface StatItemProps {
  icon: React.ElementType
  value: string
  label: string
  highlight?: boolean
  delay?: number
}

function AnimatedNumber({ value, delay = 0 }: { value: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [displayValue, setDisplayValue] = useState("0")

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setDisplayValue(value)
      }, delay * 1000)
      return () => clearTimeout(timer)
    }
  }, [isInView, value, delay])

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}
    </span>
  )
}

function StatItem({ icon: Icon, value, label, highlight, delay = 0 }: StatItemProps) {
  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <Icon className={`w-4 h-4 ${highlight ? "text-[hsl(var(--free))]" : "text-muted-foreground"}`} />
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl sm:text-3xl font-black tracking-tight ${highlight ? "text-[hsl(var(--free))]" : ""}`}>
          <AnimatedNumber value={value} delay={delay} />
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
    </motion.div>
  )
}

const stats = [
  { icon: Upload, value: "0", label: "Files Uploaded", highlight: true },
  { icon: Database, value: "0", label: "Bytes Sent", highlight: true },
  { icon: Cpu, value: "100%", label: "Local Processing", highlight: false },
  { icon: DollarSign, value: "$0", label: "Cost Forever", highlight: true },
]

export function StatsBar() {
  return (
    <section className="border-y border-border/50 bg-muted/20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border/50">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              highlight={stat.highlight}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
