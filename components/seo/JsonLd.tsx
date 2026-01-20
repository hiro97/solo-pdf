import { siteConfig } from "@/lib/site"

interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description.en,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }

  return <JsonLd data={data} />
}

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description.en,
    logo: `${siteConfig.url}/logo.png`,
  }

  return <JsonLd data={data} />
}

export function SoftwareApplicationJsonLd({
  name = siteConfig.name,
  description = siteConfig.description.en,
  applicationCategory = "BusinessApplication",
  operatingSystem = "Web Browser",
}: {
  name?: string
  description?: string
  applicationCategory?: string
  operatingSystem?: string
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory,
    operatingSystem,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
  }

  return <JsonLd data={data} />
}

export function FAQPageJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[]
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  }

  return <JsonLd data={data} />
}

export function BlogPostingJsonLd({
  title,
  description,
  datePublished,
  url,
}: {
  title: string
  description: string
  datePublished: string
  url: string
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished,
    dateModified: datePublished,
    url,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
  }

  return <JsonLd data={data} />
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[]
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <JsonLd data={data} />
}

export function HowToJsonLd({
  name,
  description,
  steps,
  totalTime = "PT5M",
  tool = "SOLO PDF Editor",
}: {
  name: string
  description: string
  steps: { name: string; text: string; image?: string }[]
  totalTime?: string
  tool?: string
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    totalTime,
    tool: {
      "@type": "HowToTool",
      name: tool,
    },
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && {
        image: {
          "@type": "ImageObject",
          url: step.image,
        },
      }),
    })),
  }

  return <JsonLd data={data} />
}

export function ProductJsonLd({
  name = "SOLO PDF Editor",
  description = "Privacy-first local PDF editor with zero upload requirement",
  price = "0",
  ratingValue = "4.8",
  reviewCount = "150",
}: {
  name?: string
  description?: string
  price?: string
  ratingValue?: string
  reviewCount?: string
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    brand: {
      "@type": "Brand",
      name: "SOLO PDF",
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
      bestRating: "5",
      worstRating: "1",
    },
  }

  return <JsonLd data={data} />
}
