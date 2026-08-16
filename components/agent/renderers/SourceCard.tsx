"use client"

import type { CitationSource } from "@/components/agent/citations"

interface SourceCardProps {
  source: CitationSource
  onOpen: (source: CitationSource) => void
}

export default function SourceCard({ source, onOpen }: SourceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(source)}
      aria-label={`Open source ${source.n}: ${source.title}`}
      className="focus-visible:ring-ring/50 group hover:bg-muted/50 flex w-full items-start gap-2.5 rounded-md p-2 text-left transition-colors outline-none focus-visible:ring-3"
    >
      <span className="bg-muted text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-xs font-medium tabular-nums">
        {source.n}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-foreground block text-sm leading-snug font-medium break-words group-hover:underline">
          {source.title}
        </span>
        <span className="text-muted-foreground block truncate text-xs">{source.hostname}</span>
        {source.snippet ? (
          <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-xs leading-relaxed">
            {source.snippet}
          </span>
        ) : null}
      </span>
    </button>
  )
}
