"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEditorPage = pathname === "/editor" || pathname.startsWith("/editor/")

  if (isEditorPage) {
    // Editor page has its own layout without Navbar/Footer
    return <>{children}</>
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
