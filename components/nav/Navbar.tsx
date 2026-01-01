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
      <Button variant="ghost" size="icon" className="w-9 h-9">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9"
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
        <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">
          Tools
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px] p-2">
        <div className="grid gap-1">
          {tools.map((tool) => (
            <DropdownMenuItem key={tool.href} asChild className="p-0">
              <Link
                href={tool.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <tool.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{tool.label}</div>
                  <div className="text-xs text-muted-foreground">{tool.description}</div>
                </div>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem asChild className="p-0">
          <Link
            href="/editor"
            className="flex items-center justify-between px-3 py-2.5 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <span className="font-medium text-sm text-primary">Open Full Editor</span>
            <ArrowRight className="h-4 w-4 text-primary" />
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-serif font-medium leading-none">{siteConfig.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider hidden sm:block">
              Local Only
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <ToolsDropdown />
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive(link.href)
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-1 md:flex">
          <ThemeToggle />
          <Button asChild size="sm" className="ml-2 gap-1.5">
            <Link href="/editor">
              Open Editor
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                    <Shield className="h-3 w-3 text-primary-foreground" />
                  </div>
                  {siteConfig.name}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-8 flex flex-col gap-6">
                {/* Tools Section */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                    Tools
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tools.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <tool.icon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{tool.label.replace(' PDF', '')}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Navigation Links */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                    More
                  </h3>
                  <div className="flex flex-col gap-1">
                    {siteConfig.navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                          isActive(link.href)
                            ? "text-foreground bg-muted"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Button asChild className="w-full gap-2">
                  <Link href="/editor" onClick={() => setOpen(false)}>
                    Open Editor
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
