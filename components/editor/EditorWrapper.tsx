"use client"

import dynamic from "next/dynamic"

// Dynamic import with SSR disabled to prevent DOMMatrix and other browser API errors
const EditorPageContent = dynamic(
  () => import("@/components/editor/EditorPageContent").then((mod) => mod.EditorPageContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    ),
  }
)

export function EditorWrapper() {
  return <EditorPageContent />
}
