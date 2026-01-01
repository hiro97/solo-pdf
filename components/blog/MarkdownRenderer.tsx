"use client"

import { Fragment, type ReactNode } from "react"

interface MarkdownNode {
  type: "h1" | "h2" | "h3" | "p" | "li" | "blank"
  content: string
}

function parseLine(line: string): MarkdownNode {
  const trimmed = line.trim()

  if (trimmed === "") {
    return { type: "blank", content: "" }
  }

  if (trimmed.startsWith("### ")) {
    return { type: "h3", content: trimmed.slice(4) }
  }

  if (trimmed.startsWith("## ")) {
    return { type: "h2", content: trimmed.slice(3) }
  }

  if (trimmed.startsWith("# ")) {
    return { type: "h1", content: trimmed.slice(2) }
  }

  if (trimmed.startsWith("- ")) {
    return { type: "li", content: trimmed.slice(2) }
  }

  return { type: "p", content: trimmed }
}

function parseMarkdown(content: string): MarkdownNode[] {
  const lines = content.split("\n")
  return lines.map(parseLine)
}

// Format text with **bold** support - returns React nodes
function formatText(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.+?\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const nodes = parseMarkdown(content)
  const elements: ReactNode[] = []
  let listItems: ReactNode[] = []
  let paragraphParts: string[] = []
  let keyIndex = 0

  const flushParagraph = () => {
    if (paragraphParts.length > 0) {
      elements.push(
        <p key={keyIndex++} className="mb-4 leading-relaxed text-muted-foreground">
          {formatText(paragraphParts.join(" "))}
        </p>
      )
      paragraphParts = []
    }
  }

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={keyIndex++} className="mb-4 list-inside list-disc space-y-1 text-muted-foreground">
          {listItems}
        </ul>
      )
      listItems = []
    }
  }

  for (const node of nodes) {
    switch (node.type) {
      case "h1":
        flushParagraph()
        flushList()
        elements.push(
          <h2 key={keyIndex++} className="mb-4 mt-8 text-2xl font-bold">
            {formatText(node.content)}
          </h2>
        )
        break

      case "h2":
        flushParagraph()
        flushList()
        elements.push(
          <h3 key={keyIndex++} className="mb-3 mt-6 text-xl font-semibold">
            {formatText(node.content)}
          </h3>
        )
        break

      case "h3":
        flushParagraph()
        flushList()
        elements.push(
          <h4 key={keyIndex++} className="mb-2 mt-4 text-lg font-semibold">
            {formatText(node.content)}
          </h4>
        )
        break

      case "li":
        flushParagraph()
        listItems.push(<li key={`li-${listItems.length}`}>{formatText(node.content)}</li>)
        break

      case "blank":
        flushParagraph()
        flushList()
        break

      case "p":
        flushList()
        paragraphParts.push(node.content)
        break
    }
  }

  flushParagraph()
  flushList()

  return <article className="prose-custom">{elements}</article>
}
