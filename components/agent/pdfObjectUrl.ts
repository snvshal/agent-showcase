"use client"

import type { UIDataTypes, UIMessagePart, UITools } from "ai"

type ToolPart = UIMessagePart<UIDataTypes, UITools> & { type: "dynamic-tool" }

const objectUrls = new Map<string, { url: string; filename?: string }>()

function parseResult(part: ToolPart): { pdf?: unknown; filename?: unknown } {
  const output =
    part.state === "output-available"
      ? (part.output as { pdf?: unknown; filename?: unknown } | undefined)
      : undefined
  return output ?? {}
}

export function objectUrlForPart(part: ToolPart): { url: string; filename?: string } | null {
  const cached = objectUrls.get(part.toolCallId)
  if (cached) return cached

  const { pdf, filename } = parseResult(part)
  if (typeof pdf !== "string" || pdf.length === 0) return null

  try {
    const binary = atob(pdf)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: "application/pdf" })
    const result = {
      url: URL.createObjectURL(blob),
      filename: typeof filename === "string" && filename.length > 0 ? filename : "document.pdf",
    }
    objectUrls.set(part.toolCallId, result)
    return result
  } catch {
    return null
  }
}

export function revokePdfObjectUrls(): void {
  for (const { url } of objectUrls.values()) {
    URL.revokeObjectURL(url)
  }
  objectUrls.clear()
}
