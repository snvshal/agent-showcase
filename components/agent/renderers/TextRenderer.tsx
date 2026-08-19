"use client"

import type { UIDataTypes, UIMessagePart, UITools } from "ai"
import type { CitationSource } from "@/components/agent/citations"
import MarkdownRenderer from "@/components/agent/renderers/MarkdownRenderer"

interface TextRendererProps {
  part: UIMessagePart<UIDataTypes, UITools> & { type: "text" }
  isAssistant: boolean
  isLastText: boolean
  sources?: CitationSource[]
}

export default function TextRenderer({
  part,
  isAssistant,
  isLastText,
  sources,
}: TextRendererProps) {
  const isStreaming = isAssistant && isLastText && part.state === "streaming"

  return (
    <div className="w-full">
      <MarkdownRenderer content={part.text} sources={sources} isStreaming={isStreaming} />
    </div>
  )
}
