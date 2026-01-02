export const siteConfig = {
  name: "SOLO PDF",
  description: "Free PDF editor online - edit, merge, split, compress, and sign PDFs directly in your browser. No upload required, 100% private.",
  url: "https://solo-pdf.com",
  email: "jonghyun.captureall@gmail.com",
  tagline: "Free PDF Editor. Zero Upload. Complete Privacy.",
  keywords: [
    "free PDF editor",
    "PDF editor",
    "PDF viewer",
    "online PDF editor",
    "edit PDF free",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "sign PDF",
    "redact PDF",
    "browser PDF editor",
    "PDF editor no upload",
    "privacy PDF editor",
    "local PDF editor",
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
