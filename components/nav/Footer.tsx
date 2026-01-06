"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Shield,
  Layers,
  Split,
  FileDown,
  Type,
  EyeOff,
  PenTool,
  Cpu,
  UserX,
  WifiOff,
  Twitter,
  Github,
} from "lucide-react"
import { siteConfig } from "@/lib/site"

// Tool links data
const tools = [
  { label: "Merge", href: "/merge-pdf", icon: Layers },
  { label: "Split", href: "/split-pdf", icon: Split },
  { label: "Compress", href: "/compress-pdf", icon: FileDown },
  { label: "Add Text", href: "/add-text-to-pdf", icon: Type },
  { label: "Redact", href: "/redact-pdf", icon: EyeOff },
  { label: "Sign", href: "/sign-pdf", icon: PenTool },
]

const companyLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Support", href: "/support" },
]

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
]

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com/solopdf", icon: Twitter },
  { label: "GitHub", href: "https://github.com/solopdf", icon: Github },
]

const trustBadges = [
  { icon: Shield, label: "Zero Upload", description: "Files never leave your device" },
  { icon: Cpu, label: "Local Processing", description: "All work done in browser" },
  { icon: UserX, label: "No Account", description: "Start editing immediately" },
  { icon: WifiOff, label: "Works Offline", description: "No internet required" },
]

const statusBadges = ["FREE", "100% LOCAL", "OFFLINE"]

// Sub-components
function FooterHeader() {
  return (
    <div className="border-b border-zinc-800 px-4 py-4 sm:py-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--free))] flex items-center justify-center shadow-[0_0_12px_hsl(var(--free-glow))]">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-serif font-medium text-white leading-none">
              {siteConfig.name}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              Local Only
            </span>
          </div>
        </Link>

        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusBadges.map((badge) => (
            <span
              key={badge}
              className="text-[10px] font-mono uppercase tracking-wider px-2 py-1
                         bg-zinc-900 border border-zinc-800 rounded text-zinc-400"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function FooterLinkColumn({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="p-4">
      <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-3
                     flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))]
                         shadow-[0_0_6px_hsl(var(--free-glow))]" />
        {title}
      </h3>
      {children}
    </div>
  )
}

function FooterNavGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-zinc-800
                    divide-x divide-zinc-800">
      {/* Tools Column */}
      <FooterLinkColumn title="Tools">
        <ul className="space-y-2">
          {tools.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="text-sm text-zinc-400 hover:text-[hsl(var(--free))]
                           transition-colors flex items-center gap-2 group"
              >
                <tool.icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100
                                       transition-opacity" />
                {tool.label}
              </Link>
            </li>
          ))}
        </ul>
      </FooterLinkColumn>

      {/* Company Column */}
      <FooterLinkColumn title="Company">
        <ul className="space-y-2">
          {companyLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-zinc-400 hover:text-[hsl(var(--free))]
                           transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </FooterLinkColumn>

      {/* Legal Column */}
      <FooterLinkColumn title="Legal">
        <ul className="space-y-2">
          {legalLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-zinc-400 hover:text-[hsl(var(--free))]
                           transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </FooterLinkColumn>

      {/* Connect Column */}
      <FooterLinkColumn title="Connect">
        <div className="flex items-center gap-2">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800
                         flex items-center justify-center
                         hover:bg-[hsl(var(--free))] hover:border-[hsl(var(--free))]
                         hover:-translate-y-0.5
                         transition-all duration-200 group"
              aria-label={social.label}
            >
              <social.icon className="w-4 h-4 text-zinc-400
                                       group-hover:text-white transition-colors" />
            </a>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          Questions?{" "}
          <Link href="/support" className="text-[hsl(var(--free))] hover:underline">
            Get in touch
          </Link>
        </p>
      </FooterLinkColumn>
    </div>
  )
}

function TrustBadgesRow() {
  return (
    <div className="border-b border-zinc-800 px-4 py-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {trustBadges.map((badge, index) => (
          <motion.div
            key={badge.label}
            className="flex items-start gap-3 group"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800
                            flex items-center justify-center shrink-0
                            group-hover:border-[hsl(var(--free))]/30 transition-colors">
              <badge.icon className="w-4 h-4 text-[hsl(var(--free))]
                                      group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">{badge.label}</p>
              <p className="text-[10px] text-zinc-500">{badge.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function FooterBottom() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <p className="text-xs text-zinc-500">
        &copy; {currentYear} {siteConfig.name}. All rights reserved.
      </p>
      <p className="text-xs text-zinc-500">
        Built with privacy in mind.{" "}
        <span className="text-[hsl(var(--free))]">
          Your files never leave your device.
        </span>
      </p>
    </div>
  )
}

// Main Footer component
export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800">
      <div className="mx-auto max-w-6xl">
        <FooterHeader />
        <FooterNavGrid />
        <TrustBadgesRow />
        <FooterBottom />
      </div>
    </footer>
  )
}
