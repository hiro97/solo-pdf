export const siteConfig = {
  name: "SOLO PDF",
  description: {
    en: "Free PDF editor - edit, merge, split, sign PDFs. No upload, complete privacy.",
    ko: "무료 PDF 편집기 - PDF 파일을 편집, 병합, 분할, 서명하세요. 업로드 없음, 완벽한 프라이버시."
  },
  url: "https://solo-pdf.com",
  email: "jonghyun.captureall@gmail.com",
  tagline: {
    en: "Free PDF Editor. Zero Upload. Complete Privacy.",
    ko: "무료 PDF 편집기. 업로드 없음. 완벽한 프라이버시."
  },
  keywords: {
    en: [
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
    ko: [
      "무료 PDF 편집기",
      "PDF 편집기",
      "PDF 뷰어",
      "온라인 PDF 편집",
      "PDF 무료 편집",
      "PDF 병합",
      "PDF 분할",
      "PDF 압축",
      "PDF 서명",
      "PDF 편집",
      "브라우저 PDF 편집기",
      "업로드 없는 PDF",
      "프라이버시 PDF",
      "로컬 PDF 편집",
      "PDF 합치기",
      "PDF 나누기",
      "PDF 용량 줄이기",
      "PDF 전자서명",
    ]
  },
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
