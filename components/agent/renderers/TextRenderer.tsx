"use client"

import type { UIDataTypes, UIMessagePart, UITools } from "ai"

interface TextRendererProps {
  part: UIMessagePart<UIDataTypes, UITools> & { type: "text" }
  isAssistant: boolean
  isStreaming: boolean
  isLastText: boolean
}

export default function TextRenderer({
  part,
  isAssistant,
  isStreaming,
  isLastText,
}: TextRendererProps) {
  return (
    <span className="whitespace-pre-wrap">
      {part.text}
      {isAssistant && isLastText && isStreaming && (
        <span className="bg-foreground/50 ml-0.5 inline-block h-4 w-2 animate-pulse rounded-sm align-text-bottom" />
      )}
    </span>
  )
}
