"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
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
  Shield
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
      <Button variant="ghost" size="icon" className="w-8 h-8">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-8 h-8 hover:bg-[hsl(var(--free)/0.1)] hover:text-[hsl(var(--free))]"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function ToolsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono uppercase tracking-wider
                           text-muted-foreground hover:text-[hsl(var(--free))] transition-colors
                           rounded-md hover:bg-[hsl(var(--free)/0.05)]">
          Tools
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px] p-2 border-border/50">
        <div className="grid gap-1">
          {tools.map((tool) => (
            <DropdownMenuItem key={tool.href} asChild className="p-0">
              <Link
                href={tool.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                           hover:bg-[hsl(var(--free)/0.05)] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg
                                bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                flex items-center justify-center shrink-0
                                group-hover:bg-[hsl(var(--free))] group-hover:border-[hsl(var(--free))]
                                transition-all duration-200">
                  <tool.icon className="h-4 w-4 text-[hsl(var(--free))] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="font-medium text-sm group-hover:text-[hsl(var(--free))] transition-colors">
                    {tool.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">{tool.description}</div>
                </div>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-2 bg-border/50" />
        <DropdownMenuItem asChild className="p-0">
          <Link
            href="/editor"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg
                       bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                       hover:bg-[hsl(var(--free))] transition-all duration-200 group"
          >
            <span className="font-mono text-xs uppercase tracking-wider text-[hsl(var(--free))]
                             group-hover:text-white transition-colors">
              Open Full Editor
            </span>
            <ArrowRight className="h-4 w-4 text-[hsl(var(--free))] group-hover:text-white transition-colors" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Navbar() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50
                       bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--free))] flex items-center justify-center
                          shadow-[0_0_12px_hsl(var(--free-glow))]
                          group-hover:shadow-[0_0_20px_hsl(var(--free-glow))] transition-shadow">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-serif font-medium leading-none">{siteConfig.name}</span>
            <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider hidden sm:block">
              Local Only
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-0.5 md:flex">
          <ToolsDropdown />
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-all duration-200",
                isActive(link.href)
                  ? "text-[hsl(var(--free))] bg-[hsl(var(--free)/0.1)]"
                  : "text-muted-foreground hover:text-[hsl(var(--free))] hover:bg-[hsl(var(--free)/0.05)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-1 md:flex">
          <ThemeToggle />
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-[hsl(var(--free)/0.1)]">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] border-border/50">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[hsl(var(--free))] flex items-center justify-center
                                  shadow-[0_0_8px_hsl(var(--free-glow))]">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-serif">{siteConfig.name}</span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-8 flex flex-col gap-6">
                {/* Tools Section */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                                    shadow-[0_0_6px_hsl(var(--free-glow))]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Tools
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {tools.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 p-3 rounded-lg border border-border/50
                                   hover:border-[hsl(var(--free)/0.3)] hover:bg-[hsl(var(--free)/0.05)]
                                   transition-all duration-200 group"
                      >
                        <div className="w-6 h-6 rounded bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                                        flex items-center justify-center
                                        group-hover:bg-[hsl(var(--free))] group-hover:border-[hsl(var(--free))]
                                        transition-all duration-200">
                          <tool.icon className="h-3 w-3 text-[hsl(var(--free))] group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-xs font-medium group-hover:text-[hsl(var(--free))] transition-colors">
                          {tool.label.replace(' PDF', '')}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Navigation Links */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                                    shadow-[0_0_6px_hsl(var(--free-glow))]" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      More
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {siteConfig.navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "px-3 py-2.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-all duration-200",
                          isActive(link.href)
                            ? "text-[hsl(var(--free))] bg-[hsl(var(--free)/0.1)]"
                            : "text-muted-foreground hover:text-[hsl(var(--free))] hover:bg-[hsl(var(--free)/0.05)]"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link href="/editor" onClick={() => setOpen(false)}>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3
                                     bg-[hsl(var(--free))] hover:bg-[hsl(var(--free)/0.9)]
                                     text-white rounded-lg font-mono text-xs uppercase tracking-wider
                                     transition-all duration-200 hover:-translate-y-0.5
                                     shadow-[0_0_20px_hsl(var(--free-glow))]">
                    Open Editor
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
