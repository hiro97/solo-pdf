"use client"

import { motion } from "framer-motion"
import { Sparkles, Shield, Cpu, UserX, WifiOff, Zap } from "lucide-react"

const tickerItems = [
  { text: "FREE FOREVER", icon: Sparkles },
  { text: "NO SIGN UP", icon: UserX },
  { text: "NO UPLOAD", icon: Shield },
  { text: "100% LOCAL", icon: Cpu },
  { text: "WORKS OFFLINE", icon: WifiOff },
  { text: "INSTANT", icon: Zap },
]

export function USPTicker() {
  // Duplicate items for seamless loop
  const items = [...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems]

  return (
    <section className="w-full overflow-hidden bg-[hsl(var(--free))] py-3 relative">
      {/* Gradient overlays for fade effect */}
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[hsl(var(--free))] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[hsl(var(--free))] to-transparent z-10" />

      <div className="ticker-scroll flex whitespace-nowrap">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 mx-6 text-white"
          >
            <item.icon className="w-4 h-4 opacity-80" />
            <span className="font-bold text-sm uppercase tracking-widest">
              {item.text}
            </span>
            <span className="text-white/50 mx-4">•</span>
          </div>
        ))}
      </div>
    </section>
  )
}
