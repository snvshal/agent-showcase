"use client"

import Image from "next/image"
import type { UIDataTypes, UIMessagePart, UITools } from "ai"
import { designUrlForPart } from "@/components/agent/designObjectUrl"

interface DesignResultRendererProps {
  part: UIMessagePart<UIDataTypes, UITools> & { type: "dynamic-tool" }
  selected?: boolean
  onSelect?: (url: string) => void
}

export default function DesignResultRenderer({
  part,
  selected = false,
  onSelect,
}: DesignResultRendererProps) {
  const result = designUrlForPart(part)

  if (!result) {
    return null
  }

  const content = (
    <>
      <div className="border-border relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border">
        <Image
          src={result.url}
          alt="Generated design preview"
          fill
          unoptimized
          sizes="40px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm font-medium">Design generated</p>
        <p className="text-muted-foreground truncate text-xs">{result.filename}</p>
      </div>
    </>
  )

  const boxClassName = `border-border bg-background/50 mt-3 mb-3 flex items-center gap-3 rounded-lg border p-3`

  if (!onSelect) {
    return <div className={boxClassName}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(result.url)}
      aria-pressed={selected}
      className={`${boxClassName} focus-visible:ring-ring/50 hover:bg-muted/50 w-full cursor-pointer text-left transition-colors outline-none focus-visible:ring-3 ${
        selected ? "border-primary/60 bg-muted/50 ring-primary/20 ring-2" : ""
      }`}
    >
      {content}
    </button>
  )
}
