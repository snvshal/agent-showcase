"use client"

import { useState } from "react"
import { Link2 } from "lucide-react"
import type { CitationSource } from "@/components/agent/citations"
import SourceCard from "@/components/agent/renderers/SourceCard"
import ConfirmLinkDialog, { type ConfirmLinkTarget } from "@/components/agent/ConfirmLinkDialog"

interface SourcesPanelProps {
  sources: CitationSource[] | null
}

export default function SourcesPanel({ sources }: SourcesPanelProps) {
  const [target, setTarget] = useState<ConfirmLinkTarget | null>(null)

  const handleConfirm = () => {
    if (!target) return
    window.open(target.url, "_blank", "noopener,noreferrer")
    setTarget(null)
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-muted-foreground flex flex-1 items-center gap-2 text-sm font-medium">
          <Link2 className="size-4" />
          Sources
        </h2>
      </div>
      {sources && sources.length > 0 ? (
        <div className="border-border bg-background/50 min-h-0 flex-1 overflow-y-auto rounded-lg border p-1.5">
          <ul className="flex flex-col gap-0.5">
            {sources.map((source) => (
              <li key={`${source.n}-${source.url}`}>
                <SourceCard
                  source={source}
                  onOpen={(s) => setTarget({ url: s.url, title: s.title, hostname: s.hostname })}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-muted-foreground flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <Link2 className="text-muted-foreground size-10" />
          <p className="text-sm font-medium">No sources yet</p>
          <p className="max-w-[260px] text-xs">
            Ask the agent a question and click the Sources button under a response to see its links
            here.
          </p>
        </div>
      )}
      <ConfirmLinkDialog
        target={target}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        onConfirm={handleConfirm}
      />
    </section>
  )
}
