"use client"

import { Clock } from "lucide-react"

function formatDuration(ms: number): string {
  const totalSeconds = ms / 1000
  if (totalSeconds < 60) return `${totalSeconds.toFixed(1)}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  return `${minutes}m ${seconds}s`
}

export default function MessageDuration({ ms }: { ms: number }) {
  return (
    <span className="group/time text-muted-foreground border-border bg-muted/50 relative inline-flex items-center gap-1.5 rounded-lg border py-0.5 pr-2 pl-1.5 text-[11px] font-medium">
      <Clock className="size-3.5" />
      <span className="tabular-nums">{formatDuration(ms)}</span>
      <span className="text-muted-foreground/60 font-normal">time</span>
      <span
        role="tooltip"
        className="bg-popover text-popover-foreground border-border invisible absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-lg border px-3 py-2 text-[11px] whitespace-nowrap opacity-0 shadow-md transition-opacity duration-100 group-hover/time:visible group-hover/time:opacity-100"
      >
        Took {ms.toLocaleString()} ms
      </span>
    </span>
  )
}
