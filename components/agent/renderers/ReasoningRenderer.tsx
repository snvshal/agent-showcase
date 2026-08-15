"use client"

import { useEffect, useRef, useState } from "react"
import type { UIDataTypes, UIMessagePart, UITools } from "ai"
import { ChevronDown, CircleDashed, Lightbulb } from "lucide-react"

interface ReasoningRendererProps {
  part: UIMessagePart<UIDataTypes, UITools> & { type: "reasoning" }
}

export default function ReasoningRenderer({ part }: ReasoningRendererProps) {
  const streamingBodyRef = useRef<HTMLDivElement>(null)
  const lastTextRef = useRef(part.text)
  const [quiet, setQuiet] = useState(false)

  useEffect(() => {
    const el = streamingBodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [part.text])

  useEffect(() => {
    if (part.state !== "streaming") return
    const id = setInterval(() => {
      if (part.text !== lastTextRef.current) {
        lastTextRef.current = part.text
        setQuiet(false)
      } else {
        setQuiet(true)
      }
    }, 1500)
    return () => clearInterval(id)
  }, [part.text, part.state])

  const showLive = part.state === "streaming" && !quiet

  if (showLive) {
    return (
      <details className="group my-3" open>
        <summary className="text-muted-foreground flex cursor-pointer list-none items-center gap-1.5 text-sm [&::-webkit-details-marker]:hidden">
          <CircleDashed className="size-3.5" />
          <span>Agent thinking...</span>
          <ChevronDown className="ml-auto inline-block size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div
          ref={streamingBodyRef}
          className="bg-background/50 mt-1.5 max-h-[200px] overflow-y-auto rounded-lg border p-2 font-mono text-sm whitespace-pre-wrap"
        >
          {part.text}
        </div>
      </details>
    )
  }

  return (
    <details className="group my-3">
      <summary className="text-muted-foreground flex cursor-pointer list-none items-center gap-1.5 text-sm [&::-webkit-details-marker]:hidden">
        <Lightbulb className="size-3.5" />
        <span>Agent thought</span>
        <ChevronDown className="ml-auto inline-block size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="bg-background/50 mt-1.5 max-h-[200px] overflow-y-auto rounded-lg border p-2 font-mono text-sm whitespace-pre-wrap group-open:animate-[slide-down_200ms_ease-out]">
        {part.text}
      </div>
    </details>
  )
}
