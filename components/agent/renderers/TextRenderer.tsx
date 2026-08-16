"use client"

import type { UIDataTypes, UIMessagePart, UITools } from "ai"
import type { CitationSource } from "@/components/agent/citations"
import CitationLink from "@/components/agent/renderers/CitationLink"

interface TextRendererProps {
  part: UIMessagePart<UIDataTypes, UITools> & { type: "text" }
  isAssistant: boolean
  isLastText: boolean
  sources?: CitationSource[]
}

interface TextToken {
  type: "text" | "citation"
  value: string
  n?: number
}

function tokenize(text: string): TextToken[] {
  const tokens: TextToken[] = []
  for (const segment of text.split(/(\[\d+(?:\s*,\s*\d+)*\])/)) {
    if (!segment) continue
    const match = /^\[(\d+(?:\s*,\s*\d+)*)\]$/.exec(segment)
    if (match) {
      for (const raw of match[1].split(",")) {
        const n = Number(raw.trim())
        tokens.push({ type: "citation", value: `[${n}]`, n })
      }
    } else {
      tokens.push({ type: "text", value: segment })
    }
  }
  return tokens
}

export default function TextRenderer({
  part,
  isAssistant,
  isLastText,
  sources,
}: TextRendererProps) {
  const byNumber = new Map((sources ?? []).map((source) => [source.n, source]))

  return (
    <span className="whitespace-pre-wrap">
      {tokenize(part.text).map((token, i) =>
        token.type === "citation" && token.n !== undefined ? (
          <CitationLink key={i} n={token.n} source={byNumber.get(token.n)} />
        ) : (
          token.value
        ),
      )}
      {isAssistant && isLastText && part.state === "streaming" && (
        <span className="bg-foreground/50 ml-0.5 inline-block h-4 w-2 animate-pulse rounded-sm align-text-bottom" />
      )}
    </span>
  )
}
