"use client"

import { useEffect, useRef } from "react"
import type { UIDataTypes, UIMessagePart, UITools } from "ai"
import { ChevronDown, CircleDashed, Lightbulb } from "lucide-react"

interface ReasoningRendererProps {
  part: UIMessagePart<UIDataTypes, UITools> & { type: "reasoning" }
}

export default function ReasoningRenderer({ part }: ReasoningRendererProps) {
  const streamingBodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = streamingBodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [part.text])

  const isStreaming = part.state === "streaming"

  return (
    <details
      className="group border-border/70 bg-muted/25 my-2 overflow-hidden rounded-lg border text-xs shadow-2xs transition-all duration-200 first:mt-0 last:mb-0"
      open={isStreaming}
    >
      <summary className="hover:bg-muted/40 text-muted-foreground flex cursor-pointer list-none items-center justify-between px-3 py-2 transition-colors select-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2 font-medium">
          {isStreaming ? (
            <CircleDashed className="size-3.5 animate-spin text-amber-500" />
          ) : (
            <Lightbulb className="text-muted-foreground size-3.5" />
          )}
          <span className={isStreaming ? "text-foreground font-medium" : "text-foreground/80"}>
            {isStreaming ? "Agent is reasoning..." : "Reasoning process"}
          </span>
          <span className="bg-muted text-muted-foreground/80 py-0.2 rounded-md px-1.5 font-mono text-[10px]">
            {isStreaming ? "Live" : "Thought"}
          </span>
        </div>

        <ChevronDown className="text-muted-foreground/60 size-3.5 transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div
        ref={streamingBodyRef}
        className="border-border/50 bg-background/50 text-muted-foreground max-h-[220px] overflow-y-auto border-t p-3 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap"
      >
        {part.text}
        {isStreaming && (
          <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-none bg-amber-500/70 align-text-bottom" />
        )}
      </div>
    </details>
  )
}
