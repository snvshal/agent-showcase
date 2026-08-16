"use client"

import { useState } from "react"
import { PreviewCard } from "@base-ui/react/preview-card"
import { ArrowUpRight } from "lucide-react"
import type { CitationSource } from "@/components/agent/citations"
import ConfirmLinkDialog, { type ConfirmLinkTarget } from "@/components/agent/ConfirmLinkDialog"

interface CitationLinkProps {
  n: number
  source?: CitationSource
}

export default function CitationLink({ n, source }: CitationLinkProps) {
  const [target, setTarget] = useState<ConfirmLinkTarget | null>(null)

  if (!source) {
    return <span className="text-muted-foreground">{`[${n}]`}</span>
  }

  const openSource = () => {
    setTarget({ url: source.url, title: source.title, hostname: source.hostname })
  }

  const handleConfirm = () => {
    if (!target) return
    window.open(target.url, "_blank", "noopener,noreferrer")
    setTarget(null)
  }

  return (
    <>
      <PreviewCard.Root>
        <PreviewCard.Trigger
          delay={250}
          closeDelay={150}
          className="mx-0.5 inline-flex items-center align-baseline font-medium text-blue-600 underline decoration-blue-600/40 underline-offset-2 transition-colors hover:decoration-blue-600 dark:text-blue-400 dark:decoration-blue-400/40 dark:hover:decoration-blue-400"
          onClick={(e) => {
            e.preventDefault()
            openSource()
          }}
        >
          [{n}]
        </PreviewCard.Trigger>
        <PreviewCard.Portal>
          <PreviewCard.Positioner side="top" align="start" sideOffset={8} collisionPadding={8}>
            <PreviewCard.Popup className="border-border bg-popover text-popover-foreground data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 w-[min(88vw,22rem)] rounded-lg border p-2.5 shadow-lg outline-none">
              <button
                type="button"
                onClick={openSource}
                aria-label={`Open source ${source.n}: ${source.title}`}
                className="focus-visible:ring-ring/50 group hover:bg-muted/50 flex w-full items-start gap-2.5 rounded-md p-1.5 text-left transition-colors outline-none focus-visible:ring-3"
              >
                <span className="bg-muted text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-xs font-medium tabular-nums">
                  {source.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-foreground block text-sm leading-snug font-medium break-words group-hover:underline">
                    {source.title}
                  </span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {source.hostname}
                  </span>
                  {source.snippet ? (
                    <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-xs leading-relaxed">
                      {source.snippet}
                    </span>
                  ) : null}
                </span>
                <ArrowUpRight className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              </button>
            </PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      </PreviewCard.Root>
      <ConfirmLinkDialog
        target={target}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        onConfirm={handleConfirm}
      />
    </>
  )
}
