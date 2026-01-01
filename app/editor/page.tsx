import type { Metadata } from "next"
import { EditorWrapper } from "@/components/editor/EditorWrapper"

export const metadata: Metadata = {
  title: "PDF Editor",
  description: "Edit PDF files directly in your browser. No upload required.",
}

export default function EditorPage() {
  return <EditorWrapper />
}
