/**
 * OpenGraph Image Generator Script
 *
 * This script generates OG images for all pages.
 * Run with: npx tsx scripts/generate-og-images.tsx
 *
 * Requirements: @vercel/og, sharp
 * npm install @vercel/og sharp --save-dev
 */

import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"

// OG Image configurations for each page
const ogConfigs = [
  {
    filename: "og-image.png",
    title: "SOLO PDF",
    subtitle: "Free PDF Editor Online",
    description: "No Upload • Complete Privacy • Works Offline",
    gradient: "from-blue-600 to-purple-600",
  },
  {
    filename: "og/free-pdf-editor.png",
    title: "Free PDF Editor",
    subtitle: "Edit PDFs Free Online",
    description: "No Signup • No Upload • 100% Free",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    filename: "og/pdf-editor.png",
    title: "PDF Editor",
    subtitle: "Professional PDF Editing",
    description: "Add Text • Images • Signatures",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    filename: "og/pdf-viewer.png",
    title: "PDF Viewer",
    subtitle: "View PDFs Online Free",
    description: "Fast • Lightweight • Private",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    filename: "og/merge-pdf.png",
    title: "Merge PDF",
    subtitle: "Combine Multiple PDFs",
    description: "Drag & Drop • Instant Download",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    filename: "og/split-pdf.png",
    title: "Split PDF",
    subtitle: "Extract PDF Pages",
    description: "Select Pages • Download Separately",
    gradient: "from-orange-500 to-red-600",
  },
  {
    filename: "og/compress-pdf.png",
    title: "Compress PDF",
    subtitle: "Reduce File Size",
    description: "Smart Compression • Keep Quality",
    gradient: "from-teal-500 to-green-600",
  },
  {
    filename: "og/add-text-to-pdf.png",
    title: "Add Text to PDF",
    subtitle: "Insert Text Anywhere",
    description: "Custom Fonts • Colors • Sizes",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    filename: "og/sign-pdf.png",
    title: "Sign PDF",
    subtitle: "Add Your Signature",
    description: "Draw • Type • Position",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    filename: "og/redact-pdf.png",
    title: "Redact PDF",
    subtitle: "Hide Sensitive Info",
    description: "Permanent Removal • Secure",
    gradient: "from-slate-600 to-gray-800",
  },
]

// Generate SVG template for OG image
function generateOgSvg(config: (typeof ogConfigs)[0]): string {
  // Parse gradient colors
  const gradientColors: Record<string, [string, string]> = {
    "from-blue-600 to-purple-600": ["#2563eb", "#9333ea"],
    "from-green-500 to-emerald-600": ["#22c55e", "#059669"],
    "from-blue-500 to-indigo-600": ["#3b82f6", "#4f46e5"],
    "from-cyan-500 to-blue-600": ["#06b6d4", "#2563eb"],
    "from-purple-500 to-pink-600": ["#a855f7", "#db2777"],
    "from-orange-500 to-red-600": ["#f97316", "#dc2626"],
    "from-teal-500 to-green-600": ["#14b8a6", "#16a34a"],
    "from-amber-500 to-orange-600": ["#f59e0b", "#ea580c"],
    "from-rose-500 to-pink-600": ["#f43f5e", "#db2777"],
    "from-slate-600 to-gray-800": ["#475569", "#1f2937"],
  }

  const [startColor, endColor] = gradientColors[config.gradient] || ["#3b82f6", "#8b5cf6"]

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${startColor}"/>
      <stop offset="100%" style="stop-color:${endColor}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative elements -->
  <circle cx="1100" cy="100" r="200" fill="white" fill-opacity="0.1"/>
  <circle cx="100" cy="530" r="150" fill="white" fill-opacity="0.1"/>

  <!-- Content container -->
  <rect x="60" y="60" width="1080" height="510" rx="24" fill="white" fill-opacity="0.95" filter="url(#shadow)"/>

  <!-- Logo/Brand -->
  <text x="100" y="140" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="${startColor}">SOLO PDF</text>

  <!-- Main Title -->
  <text x="100" y="280" font-family="Georgia, serif" font-size="72" font-weight="500" fill="#1f2937">${config.title}</text>

  <!-- Subtitle -->
  <text x="100" y="360" font-family="system-ui, -apple-system, sans-serif" font-size="36" fill="#4b5563">${config.subtitle}</text>

  <!-- Description -->
  <text x="100" y="440" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#6b7280">${config.description}</text>

  <!-- Bottom bar -->
  <rect x="100" y="500" width="200" height="4" rx="2" fill="${startColor}"/>

  <!-- URL -->
  <text x="1040" y="530" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#9ca3af" text-anchor="end">solo-pdf.com</text>
</svg>`
}

// Main execution
async function main() {
  const publicDir = join(process.cwd(), "public")
  const ogDir = join(publicDir, "og")

  // Ensure og directory exists
  if (!existsSync(ogDir)) {
    mkdirSync(ogDir, { recursive: true })
  }

  console.log("Generating OpenGraph images...")

  for (const config of ogConfigs) {
    const svg = generateOgSvg(config)
    const outputPath = join(publicDir, config.filename.replace(".png", ".svg"))

    writeFileSync(outputPath, svg)
    console.log(`✓ Generated: ${config.filename.replace(".png", ".svg")}`)
  }

  console.log("\nSVG images generated successfully!")
  console.log("To convert to PNG, use a tool like Inkscape or an online converter.")
  console.log("Or install sharp and modify this script to output PNG directly.")
}

main().catch(console.error)
