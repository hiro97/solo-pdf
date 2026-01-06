"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Your AdSense publisher ID
const ADSENSE_CLIENT = "ca-pub-5977464916036907"

interface AdSlotProps {
  slot: string
  format?: "auto" | "rectangle" | "horizontal" | "vertical" | "infeed"
  className?: string
  responsive?: boolean
}

export function AdSlot({
  slot,
  format = "auto",
  className,
  responsive = true,
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const [isVisible, setIsVisible] = useState(false)

  // Use IntersectionObserver to detect when ad slot is visible
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  // Push ad only when visible and container has width
  useEffect(() => {
    if (!isVisible || initialized.current) return

    const container = containerRef.current
    if (!container) return

    // Wait for container to have valid dimensions
    const checkAndPushAd = () => {
      const width = container.offsetWidth

      if (width > 0) {
        initialized.current = true
        try {
          if (typeof window !== "undefined" && (window as any).adsbygoogle) {
            (window as any).adsbygoogle.push({})
          }
        } catch (err) {
          // Silently handle AdSense errors in development
          if (process.env.NODE_ENV === "development") {
            console.debug("AdSense:", err)
          }
        }
      } else {
        // Retry after a short delay if width is still 0
        requestAnimationFrame(checkAndPushAd)
      }
    }

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(checkAndPushAd)
  }, [isVisible])

  const formatStyles = {
    auto: "min-h-[100px]",
    rectangle: "min-h-[250px] max-w-[300px]",
    horizontal: "min-h-[90px] w-full",
    vertical: "min-h-[600px] max-w-[160px]",
    infeed: "min-h-[120px] w-full",
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center justify-center",
        formatStyles[format],
        responsive && "w-full",
        className
      )}
    >
      {isVisible && (
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format={responsive ? "auto" : format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      )}
    </div>
  )
}

export function SidebarAdSlot({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "hidden lg:block lg:w-[300px] lg:shrink-0",
        className
      )}
    >
      <div className="sticky top-24 space-y-6">
        <AdSlot slot="sidebar-1" format="rectangle" />
        <AdSlot slot="sidebar-2" format="rectangle" />
      </div>
    </aside>
  )
}

export function InfeedAdSlot({ className }: { className?: string }) {
  return (
    <div className={cn("my-8", className)}>
      <AdSlot slot="infeed" format="infeed" />
    </div>
  )
}

export function BannerAdSlot({ className }: { className?: string }) {
  return (
    <div className={cn("my-6 flex justify-center", className)}>
      <AdSlot slot="banner" format="horizontal" className="max-w-[728px]" />
    </div>
  )
}
