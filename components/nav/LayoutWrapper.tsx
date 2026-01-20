"use client"

import { usePathname } from "next/navigation"
import { FloatingNavbar } from "./FloatingNavbar"
import { Footer } from "./Footer"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEditorPage = pathname === "/editor" || pathname.startsWith("/editor/")

  if (isEditorPage) {
    // Editor page has its own layout without Navbar/Footer
    return <>{children}</>
  }

  // All pages use FloatingNavbar (unified header)
  return (
    <div className="relative flex min-h-screen flex-col">
      <FloatingNavbar />
      <main id="main-content" className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  )
}
