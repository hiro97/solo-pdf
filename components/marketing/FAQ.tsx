"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { MotionInView } from "./MotionInView"

export interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  title?: string
  subtitle?: string
  items: FAQItem[]
  className?: string
}

export function FAQ({
  title = "Frequently Asked Questions",
  subtitle,
  items,
  className,
}: FAQProps) {
  return (
    <section className={className}>
      <MotionInView className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{subtitle}</p>
        )}
      </MotionInView>

      <MotionInView delay={0.2} className="mx-auto mt-12 max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </MotionInView>
    </section>
  )
}

export const homeFAQItems: FAQItem[] = [
  {
    question: "Is SOLO PDF really free?",
    answer:
      "Yes, SOLO PDF's core features are completely free. There are no file upload limits or daily usage restrictions. Premium features may be added in the future, but essential PDF editing will always remain free.",
  },
  {
    question: "Are my files really never uploaded?",
    answer:
      "Yes, 100%. SOLO PDF uses WebAssembly and JavaScript to perform all PDF processing directly in your browser. You can check the Network tab in developer tools to verify that no file data is ever transmitted.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Basic PDF operations work offline. After your first visit, necessary resources are cached so you can use the tool without an internet connection.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "There's no server-side limit, but browser memory is a constraint. Files under 100MB typically process without issues. Larger files may vary based on device performance.",
  },
  {
    question: "Which browsers are supported?",
    answer:
      "All modern browsers including Chrome, Firefox, Safari, and Edge are supported. For optimal performance, we recommend the latest version of Chrome or Edge.",
  },
  {
    question: "Can I safely process sensitive documents?",
    answer:
      "Yes, this is SOLO PDF's main advantage. Since files are never transmitted over the internet, you can safely process confidential documents and personal information.",
  },
]

export const supportFAQItems: FAQItem[] = [
  {
    question: "My PDF file won't open",
    answer:
      "The file may be corrupted or password-protected. Try opening it in another PDF viewer first. Password-protected PDFs are not currently supported.",
  },
  {
    question: "The browser freezes during processing",
    answer:
      "This can happen with very large or complex files. Refresh the page and try with a smaller file. We recommend using Chrome or Edge browsers.",
  },
  {
    question: "Can I use it on mobile?",
    answer:
      "Yes, it works on mobile browsers. However, large files and complex operations work better on desktop devices.",
  },
  {
    question: "A specific feature isn't working",
    answer:
      "Try clearing your browser cache and refreshing the page. If the problem persists, try a different browser or contact us.",
  },
  {
    question: "Is my data saved anywhere?",
    answer:
      "File data is never saved. All data disappears when you close the browser. Only some preference settings may be stored in local storage.",
  },
]
