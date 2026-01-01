import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { BreadcrumbJsonLd } from "./JsonLd"
import { siteConfig } from "@/lib/site"

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const allItems = [{ label: "홈", href: "/" }, ...items]
  const jsonLdItems = allItems.map((item) => ({
    name: item.label,
    url: `${siteConfig.url}${item.href}`,
  }))

  return (
    <>
      <BreadcrumbJsonLd items={jsonLdItems} />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {allItems.map((item, index) => (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-4 w-4 opacity-50" />}
              {index === 0 ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  aria-label="홈으로"
                >
                  <Home className="h-4 w-4" />
                </Link>
              ) : index === allItems.length - 1 ? (
                <span className="font-medium text-foreground">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
