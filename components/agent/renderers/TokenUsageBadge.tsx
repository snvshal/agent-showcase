"use client"

import { Gauge } from "lucide-react"

export interface TokenUsage {
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
}

const fmt = (n: number) => n.toLocaleString()

export default function TokenUsageBadge({ usage }: { usage: TokenUsage }) {
  const input = usage.inputTokens ?? 0
  const output = usage.outputTokens ?? 0
  const total = usage.totalTokens ?? input + output

  return (
    <span className="group/tokens text-muted-foreground border-border bg-muted/50 relative inline-flex items-center gap-1.5 rounded-lg border py-0.5 pr-2 pl-1.5 text-[11px] font-medium">
      <Gauge className="size-3.5" />
      <span className="tabular-nums">{fmt(total)}</span>
      <span className="text-muted-foreground/60 font-normal">tokens</span>
      <span
        role="tooltip"
        className="bg-popover text-popover-foreground border-border invisible absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-lg border px-3 py-2 text-[11px] whitespace-nowrap opacity-0 shadow-md transition-opacity duration-100 group-hover/tokens:visible group-hover/tokens:opacity-100"
      >
        <div className="text-popover-foreground/80 flex flex-col gap-1 tabular-nums">
          <span>
            Input <span>{fmt(input)}</span>
          </span>
          <span>
            Output <span>{fmt(output)}</span>
          </span>
        </div>
      </span>
    </span>
  )
}
