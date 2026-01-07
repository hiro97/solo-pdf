"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  Menu,
  Moon,
  Sun,
  ChevronDown,
  Layers,
  Split,
  FileDown,
  Type,
  EyeOff,
  PenTool,
  ArrowRight,
  FileText,
  X,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { siteConfig } from "@/lib/site"
import { cn } from "@/lib/utils"

const tools = [
  { label: "Merge PDF", href: "/merge-pdf", icon: Layers, description: "Combine multiple files" },
  { label: "Split PDF", href: "/split-pdf", icon: Split, description: "Extract pages" },
  { label: "Compress PDF", href: "/compress-pdf", icon: FileDown, description: "Reduce file size" },
  { label: "Add Text", href: "/add-text-to-pdf", icon: Type, description: "Insert text anywhere" },
  { label: "Redact PDF", href: "/redact-pdf", icon: EyeOff, description: "Hide sensitive info" },
  { label: "Sign PDF", href: "/sign-pdf", icon: PenTool, description: "Add your signature" },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="w-8 h-8 rounded-full flex items-center justify-center">
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  return (
    <button
      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-foreground/5 transition-colors"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

function ToolsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 px-2 py-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
          Tools
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[260px] p-1.5 bg-background/95 backdrop-blur-xl border-border/50">
        <div className="grid gap-0.5">
          {tools.map((tool) => (
            <DropdownMenuItem key={tool.href} asChild className="p-0 focus:bg-transparent">
              <Link
                href={tool.href}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-muted/50 transition-colors group"
              >
                <div className="w-7 h-7 rounded bg-muted flex items-center justify-center shrink-0 group-hover:bg-[hsl(var(--free))]/10 transition-colors">
                  <tool.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[hsl(var(--free))] transition-colors" />
                </div>
                <div>
                  <div className="font-medium text-xs">{tool.label}</div>
                  <div className="text-[10px] text-muted-foreground">{tool.description}</div>
                </div>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-1.5" />
        <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
          <Link
            href="/editor"
            className="flex items-center justify-between px-2.5 py-2 rounded bg-[hsl(var(--free))]/10 hover:bg-[hsl(var(--free))]/20 transition-colors"
          >
            <span className="font-medium text-xs text-[hsl(var(--free))]">Open Full Editor</span>
            <ArrowRight className="h-3.5 w-3.5 text-[hsl(var(--free))]" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function FloatingNavbar() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const { scrollY } = useScroll()

  // Transform navbar based on scroll
  const navOpacity = useTransform(scrollY, [0, 100], [0.85, 0.98])
  const navScale = useTransform(scrollY, [0, 100], [1, 0.98])
  const navY = useTransform(scrollY, [0, 100], [0, 0])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <motion.header
      className="fixed top-3 left-0 right-0 z-50 w-[calc(100%-1.5rem)] max-w-3xl mx-auto"
      style={{ y: navY }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={cn(
          "flex items-center justify-center gap-4 px-4 py-1.5",
          "bg-background/80 backdrop-blur-xl border border-border/40 rounded-full",
          "shadow-lg shadow-black/5"
        )}
        style={{ opacity: navOpacity, scale: navScale }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center">
            <FileText className="h-3.5 w-3.5 text-background" />
          </div>
          <span className="text-sm font-serif font-medium hidden sm:block">SOLO</span>
        </Link>

        {/* Center Nav - Desktop */}
        <nav className="hidden md:flex items-center gap-0.5">
          <ToolsDropdown />
          <div className="w-px h-4 bg-border/50 mx-1" />
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-2 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors rounded-full",
                isActive(link.href)
                  ? "text-foreground bg-muted/50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-1.5">
          {/* Theme Toggle - Desktop */}
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* FREE Badge - Always visible */}
          <Link
            href="/editor"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
              "bg-[hsl(var(--free))] text-white",
              "text-xs font-bold uppercase tracking-wide",
              "hover:brightness-110 transition-all",
              "shadow-lg shadow-[hsl(var(--free))]/25"
            )}
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">FREE</span>
            <span className="hidden lg:inline">- No Sign Up</span>
          </Link>

          {/* Mobile Menu */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0 bg-background/95 backdrop-blur-xl">
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                        <FileText className="h-4 w-4 text-background" />
                      </div>
                      <span className="font-serif font-medium">SOLO PDF</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-6">
                  {/* Tools Section */}
                  <div>
                    <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 px-1">
                      Tools
                    </h3>
                    <div className="grid gap-0.5">
                      {tools.map((tool) => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-2 py-2 rounded hover:bg-muted/50 transition-colors"
                        >
                          <tool.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{tool.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div>
                    <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 px-1">
                      More
                    </h3>
                    <div className="grid gap-0.5">
                      {siteConfig.navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "px-2 py-2 text-sm rounded transition-colors",
                            isActive(link.href)
                              ? "text-foreground bg-muted/50"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href="/editor"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg",
                      "bg-[hsl(var(--free))] text-white",
                      "font-bold text-sm uppercase tracking-wide",
                      "hover:brightness-110 transition-all"
                    )}
                  >
                    <Sparkles className="w-4 h-4" />
                    Open Editor - FREE
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.div>
    </motion.header>
  )
}
