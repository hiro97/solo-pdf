"use client"

import Link from "next/link"
import { Shield, Home } from "lucide-react"
import { AdSlot } from "@/components/ads/AdSlot"
import { siteConfig } from "@/lib/site"

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Ad Banner with minimal branding */}
      <div className="w-full border-b bg-background">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Minimal Logo */}
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
              <Shield className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm font-medium">{siteConfig.name}</span>
          </Link>

          {/* Ad Banner */}
          <div className="flex-1 flex justify-center px-4">
            <AdSlot slot="editor-top-banner" format="horizontal" className="max-w-[728px] h-[60px]" />
          </div>

          {/* Home Link */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Editor Content - No Footer */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
