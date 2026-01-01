export const siteConfig = {
  name: "SOLO PDF",
  description: "Privacy-first local PDF editor. Zero upload. All processing happens in your browser.",
  url: "https://solopdf.example",
  tagline: "Zero Upload. Local Only.",
  keywords: [
    "PDF editor",
    "local PDF",
    "privacy PDF",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "sign PDF",
    "redact PDF",
    "free PDF editor",
    "online PDF editor",
    "browser PDF editor",
  ],
  navLinks: [
    { label: "Blog", href: "/blog" },
    { label: "Support", href: "/support" },
  ],
  footerLinks: {
    tools: [
      { label: "Merge PDF", href: "/merge-pdf" },
      { label: "Split PDF", href: "/split-pdf" },
      { label: "Compress PDF", href: "/compress-pdf" },
      { label: "Add Text to PDF", href: "/add-text-to-pdf" },
      { label: "Redact PDF", href: "/redact-pdf" },
      { label: "Sign PDF", href: "/sign-pdf" },
    ],
    company: [
      { label: "Blog", href: "/blog" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Support", href: "/support" },
    ],
  },
  trustBadges: [
    { icon: "Shield", label: "Zero Upload" },
    { icon: "Cpu", label: "Local Processing" },
    { icon: "UserX", label: "No Account Required" },
    { icon: "WifiOff", label: "Works Offline" },
  ],
}

export type SiteConfig = typeof siteConfig
