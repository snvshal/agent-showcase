"use client"

import type { UIDataTypes, UIMessagePart, UITools } from "ai"

interface TextRendererProps {
  part: UIMessagePart<UIDataTypes, UITools> & { type: "text" }
  isAssistant: boolean
  isLastText: boolean
}

export default function TextRenderer({ part, isAssistant, isLastText }: TextRendererProps) {
  return (
    <span className="whitespace-pre-wrap">
      {part.text}
      {isAssistant && isLastText && part.state === "streaming" && (
        <span className="bg-foreground/50 ml-0.5 inline-block h-4 w-2 animate-pulse rounded-sm align-text-bottom" />
      )}
    </span>
  )
}
