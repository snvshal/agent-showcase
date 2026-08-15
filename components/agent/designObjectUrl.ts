"use client"

import type { UIDataTypes, UIMessagePart, UITools } from "ai"

type ToolPart = UIMessagePart<UIDataTypes, UITools> & { type: "dynamic-tool" }

function parseResult(part: ToolPart): { svg?: unknown; filename?: unknown } {
  const output =
    part.state === "output-available"
      ? (part.output as { svg?: unknown; filename?: unknown } | undefined)
      : undefined
  return output ?? {}
}

export interface DesignResult {
  url: string
  filename: string
  width: number
  height: number
}

const objectUrls = new Map<string, DesignResult>()

function parseSvgSize(svg: string): { width: number; height: number } {
  const forward = svg.match(/<svg[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"/)
  const match: RegExpMatchArray | null =
    forward ?? svg.match(/<svg[^>]*\bheight="(\d+)"[^>]*\bwidth="(\d+)"/)
  return {
    width: Number(match?.[1] ?? 1080),
    height: Number(match?.[2] ?? 1080),
  }
}

export function designUrlForPart(part: ToolPart): DesignResult | null {
  const cached = objectUrls.get(part.toolCallId)
  if (cached) return cached

  const { svg, filename } = parseResult(part)
  if (typeof svg !== "string" || svg.length === 0) return null
  const { width, height } = parseSvgSize(svg)
  const result: DesignResult = {
    url: URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })),
    filename: typeof filename === "string" && filename.length > 0 ? filename : "design.svg",
    width,
    height,
  }
  objectUrls.set(part.toolCallId, result)
  return result
}

export function revokeDesignObjectUrls(): void {
  for (const { url } of objectUrls.values()) {
    URL.revokeObjectURL(url)
  }
  objectUrls.clear()
}

const MAX_PNG_DIMENSION = 4096
const PNG_SCALE = 2

function loadSvgImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load the design for export"))
    img.src = url
  })
}

export async function exportDesignPng(design: { url: string; filename: string }): Promise<void> {
  const img = await loadSvgImage(design.url)
  const naturalWidth = img.naturalWidth || 1080
  const naturalHeight = img.naturalHeight || 1080
  const largest = Math.max(naturalWidth, naturalHeight)
  const scale = Math.min(PNG_SCALE, MAX_PNG_DIMENSION / largest)
  const width = Math.round(naturalWidth * scale)
  const height = Math.round(naturalHeight * scale)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is not supported in this browser")
  ctx.scale(scale, scale)
  ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
  if (!blob) throw new Error("Could not create the PNG image")

  const pngUrl = URL.createObjectURL(blob)
  const pngName = design.filename.replace(/\.svg$/i, "") + ".png"
  try {
    const link = document.createElement("a")
    link.href = pngUrl
    link.download = pngName
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    URL.revokeObjectURL(pngUrl)
  }
}
