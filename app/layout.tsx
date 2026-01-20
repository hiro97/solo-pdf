import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif, Great_Vibes, Dancing_Script, Allura } from "next/font/google"
import { ThemeProvider } from "@/components/ThemeProvider"
import { LayoutWrapper } from "@/components/nav/LayoutWrapper"
import { Toaster } from "sonner"
import { siteConfig } from "@/lib/site"
import "@/styles/globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
})

// Signature fonts
const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
})

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  weight: "400",
  subsets: ["latin"],
})

const allura = Allura({
  variable: "--font-allura",
  weight: "400",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description.en,
  metadataBase: new URL(siteConfig.url),
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' }
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SOLO PDF'
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description.en,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: `${siteConfig.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SOLO PDF - Free Privacy-First PDF Editor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description.en,
    images: [`${siteConfig.url}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_VERIFICATION || '',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5977464916036907"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${greatVibes.variable} ${dancingScript.variable} ${allura.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-lg"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
