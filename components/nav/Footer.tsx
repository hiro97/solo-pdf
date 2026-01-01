import Link from "next/link"
import { Shield, Layers, Split, FileDown, Type, EyeOff, PenTool, Zap, WifiOff, Lock } from "lucide-react"
import { siteConfig } from "@/lib/site"

const tools = [
  { label: "Merge", href: "/merge-pdf", icon: Layers },
  { label: "Split", href: "/split-pdf", icon: Split },
  { label: "Compress", href: "/compress-pdf", icon: FileDown },
  { label: "Add Text", href: "/add-text-to-pdf", icon: Type },
  { label: "Redact", href: "/redact-pdf", icon: EyeOff },
  { label: "Sign", href: "/sign-pdf", icon: PenTool },
]

const trustBadges = [
  { icon: Shield, label: "Zero Upload" },
  { icon: Zap, label: "Instant Processing" },
  { icon: WifiOff, label: "Works Offline" },
  { icon: Lock, label: "100% Private" },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 lg:mr-[180px]">
      {/* Trust Banner */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <badge.icon className="h-4 w-4 text-primary" />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-serif font-medium">{siteConfig.name}</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {siteConfig.description}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {siteConfig.tagline}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
              PDF Tools
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <tool.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {tool.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Made with privacy in mind. Your files never leave your device.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
