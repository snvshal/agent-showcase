"use client"

import { FileText } from "lucide-react"
import type { UIDataTypes, UIMessagePart, UITools } from "ai"
import ToolCallRenderer from "@/components/agent/renderers/ToolCallRenderer"
import { objectUrlForPart } from "@/components/agent/pdfObjectUrl"

interface PdfResultRendererProps {
  part: UIMessagePart<UIDataTypes, UITools> & { type: "dynamic-tool" }
  selected?: boolean
  onSelect?: (url: string) => void
}

export default function PdfResultRenderer({
  part,
  selected = false,
  onSelect,
}: PdfResultRendererProps) {
  const result = objectUrlForPart(part)

  if (!result) {
    return <ToolCallRenderer part={part} />
  }

  const content = (
    <>
      <div className="border-border flex size-10 shrink-0 items-center justify-center rounded-md border">
        <FileText className="text-foreground size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm font-medium">PDF generated</p>
        <p className="text-muted-foreground truncate text-xs">
          {result.filename ?? "document.pdf"}
        </p>
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
