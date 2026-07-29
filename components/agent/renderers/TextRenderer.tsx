"use client"

import type { EveMessagePart } from "eve/react"

interface TextRendererProps {
  part: EveMessagePart & { type: "text" }
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
        <span className="bg-foreground/50 ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm align-text-bottom" />
      )}
    </span>
  )
}
