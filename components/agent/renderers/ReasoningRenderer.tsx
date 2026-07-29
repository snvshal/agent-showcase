"use client"

import { BrainCircuit } from "lucide-react"
import type { EveMessagePart } from "eve/react"

interface ReasoningRendererProps {
  part: EveMessagePart & { type: "reasoning" }
}

export default function ReasoningRenderer({ part }: ReasoningRendererProps) {
  return (
    <details className="text-muted-foreground mt-1 text-xs">
      <summary className="hover:text-foreground cursor-pointer text-[11px] italic opacity-70">
        <BrainCircuit className="mr-1 inline size-3" /> Agent thinking
      </summary>
      <div className="border-muted-foreground/30 mt-1 border-l-2 pl-2 whitespace-pre-wrap italic">
        {part.text || "(thinking...)"}
      </div>
    </details>
  )
}
