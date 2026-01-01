import { cn } from "@/lib/utils"

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
  const formatStyles = {
    auto: "min-h-[100px]",
    rectangle: "min-h-[250px] max-w-[300px]",
    horizontal: "min-h-[90px] w-full",
    vertical: "min-h-[600px] max-w-[160px]",
    infeed: "min-h-[120px] w-full",
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted/30 text-muted-foreground text-xs",
        formatStyles[format],
        responsive && "w-full",
        className
      )}
      data-ad-slot={slot}
      data-ad-format={format}
      aria-hidden="true"
    >
      {/* Ad placeholder - will be replaced by actual ad code */}
      <span className="opacity-50">Ad Space</span>
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
