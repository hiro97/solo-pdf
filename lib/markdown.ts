// Simple markdown-ish renderer without external dependencies
// Supports: # headings, ## subheadings, - lists, blank lines for paragraphs, **bold**

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

function formatText(text: string): string {
  // Handle **bold** text
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
}

export function parseMarkdown(content: string): MarkdownNode[] {
  const lines = content.split("\n")
  return lines.map(parseLine)
}

export function renderMarkdownToHtml(content: string): string {
  const nodes = parseMarkdown(content)
  const result: string[] = []
  let inList = false
  let currentParagraph: string[] = []

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      result.push(`<p class="mb-4 text-muted-foreground leading-relaxed">${formatText(currentParagraph.join(" "))}</p>`)
      currentParagraph = []
    }
  }

  const closeList = () => {
    if (inList) {
      result.push("</ul>")
      inList = false
    }
  }

  for (const node of nodes) {
    switch (node.type) {
      case "h1":
        flushParagraph()
        closeList()
        result.push(`<h1 class="text-3xl font-bold mt-8 mb-4">${formatText(node.content)}</h1>`)
        break

      case "h2":
        flushParagraph()
        closeList()
        result.push(`<h2 class="text-2xl font-semibold mt-6 mb-3">${formatText(node.content)}</h2>`)
        break

      case "h3":
        flushParagraph()
        closeList()
        result.push(`<h3 class="text-xl font-semibold mt-4 mb-2">${formatText(node.content)}</h3>`)
        break

      case "li":
        flushParagraph()
        if (!inList) {
          result.push('<ul class="list-disc list-inside mb-4 space-y-1 text-muted-foreground">')
          inList = true
        }
        result.push(`<li>${formatText(node.content)}</li>`)
        break

      case "blank":
        flushParagraph()
        closeList()
        break

      case "p":
        closeList()
        currentParagraph.push(node.content)
        break
    }
  }

  flushParagraph()
  closeList()

  return result.join("\n")
}
