"use client"

import type { EveMessagePart } from "eve/react"
import { Brain, ChevronDown } from "lucide-react"

interface ReasoningRendererProps {
  part: EveMessagePart & { type: "reasoning" }
}

export default function ReasoningRenderer({ part }: ReasoningRendererProps) {
  if (part.state === "streaming") return null

  return (
    <details className="group my-3">
      <summary className="text-muted-foreground flex cursor-pointer list-none items-center gap-1.5 text-sm [&::-webkit-details-marker]:hidden">
        <Brain className="size-3.5" />
        <span>Agent thought</span>
        <ChevronDown className="ml-auto inline-block size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="bg-background/50 mt-1.5 rounded-lg border p-2 font-mono text-sm whitespace-pre-wrap group-open:animate-[slide-down_200ms_ease-out]">
        {part.text}
      </div>
    </details>
  )
}
