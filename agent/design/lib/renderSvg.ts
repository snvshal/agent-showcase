export interface DesignShape {
  type: "rect" | "circle" | "ellipse" | "line" | "triangle" | "ring" | "emoji"
  x: number
  y: number
  width?: number
  height?: number
  size?: number
  rx?: number
  color?: string
  opacity?: number
  strokeColor?: string
  strokeWidth?: number
  glyph?: string
}

export interface DesignTextLayer {
  text: string
  color?: string
  fontSize?: number
  fontWeight?: string
  letterSpacing?: number
  align?: "left" | "center"
  y?: number
  maxWidth?: number
}

export interface DesignButton {
  text: string
  x: number
  y: number
  width?: number
  height?: number
  background: string
  color?: string
  fontSize?: number
  radius?: number
}

export type DesignBackground =
  | { type: "solid"; color: string }
  | { type: "linear"; from: string; to: string; angle?: number }
  | { type: "radial"; from: string; to: string; cx?: number; cy?: number; radius?: number }

export interface DesignSpec {
  name?: string
  width: number
  height: number
  background: DesignBackground
  title?: DesignTextLayer
  subtitle?: DesignTextLayer
  footer?: DesignTextLayer
  shapes?: DesignShape[]
  buttons?: DesignButton[]
}

const DEFAULT_BG = "#1e293b"
const DEFAULT_TEXT = "#ffffff"
const DEFAULT_TITLE_SIZE = 72
const DEFAULT_SUBTITLE_SIZE = 34
const DEFAULT_FOOTER_SIZE = 22
const DEFAULT_BUTTON_SIZE = 28
const LINE_HEIGHT = 1.2
const PADDING_RATIO = 0.08
const MIN_DIMENSION = 8

function toFinite(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function normalizeColor(color: string | undefined, fallback: string): string {
  if (typeof color !== "string") return fallback
  const trimmed = color.trim()
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return trimmed
      .slice(1)
      .split("")
      .map((c) => c + c)
      .join("")
      .replace(/^/, "#")
  }
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed
  if (trimmed.toLowerCase() === "transparent" || trimmed.toLowerCase() === "none") return trimmed
  return fallback
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function normalizeOpacity(opacity: number | undefined): number {
  if (typeof opacity !== "number" || !Number.isFinite(opacity)) return 1
  return Math.min(1, Math.max(0, opacity))
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function charWidth(ch: string, fontSize: number): number {
  const code = ch.codePointAt(0) ?? 0
  if (code >= 0x1f000) return fontSize * 1.05
  if (ch === " ") return fontSize * 0.3
  if (ch >= "A" && ch <= "Z") return fontSize * 0.66
  if (ch >= "0" && ch <= "9") return fontSize * 0.56
  if ("ilI!'.|,;:".includes(ch)) return fontSize * 0.3
  if ("mwMW@%&#".includes(ch)) return fontSize * 0.8
  return fontSize * 0.55
}

function estimateTextWidth(text: string, fontSize: number, letterSpacing: number): number {
  let width = 0
  for (const ch of text) width += charWidth(ch, fontSize)
  return width + letterSpacing * Math.max(0, text.length - 1)
}

function wrapToWidth(
  text: string,
  maxWidth: number,
  fontSize: number,
  letterSpacing: number,
): string[] {
  const lines: string[] = []
  for (const paragraph of text.split("\n")) {
    if (!paragraph.trim()) {
      lines.push("")
      continue
    }
    let current = ""
    for (const word of paragraph.split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word
      if (!current || estimateTextWidth(candidate, fontSize, letterSpacing) <= maxWidth) {
        current = candidate
      } else {
        if (current) lines.push(current)
        current = word
      }
    }
    lines.push(current)
  }
  return lines
}

function prepareText(
  layer: DesignTextLayer,
  width: number,
  defaults: { fontSize: number },
  maxWidth: number,
): { lines: string[]; fontSize: number } {
  const base = toFinite(layer.fontSize, defaults.fontSize)
  const letterSpacing = toFinite(layer.letterSpacing, 0)
  let fontSize = base
  let lines = wrapToWidth(layer.text, maxWidth, fontSize, letterSpacing)
  const widest = Math.max(
    0,
    ...lines.map((line) => estimateTextWidth(line, fontSize, letterSpacing)),
  )
  if (widest > maxWidth) {
    fontSize = Math.max(base * 0.5, Math.floor((fontSize * maxWidth) / widest))
    lines = wrapToWidth(layer.text, maxWidth, fontSize, letterSpacing)
  }
  return { lines, fontSize }
}

function renderBackground(background: DesignBackground, width: number, height: number): string {
  if (background.type === "linear") {
    const angle = toFinite(background.angle, 135) * (Math.PI / 180)
    const dx = Math.cos(angle)
    const dy = Math.sin(angle)
    const length = (Math.abs(dx) * width + Math.abs(dy) * height) / 2
    const cx = width / 2
    const cy = height / 2
    const from = normalizeColor(background.from, "#2563eb")
    const to = normalizeColor(background.to, "#7c3aed")
    return [
      `<defs>`,
      `<linearGradient id="bg-gradient" x1="${(cx - dx * length).toFixed(1)}" y1="${(cy - dy * length).toFixed(1)}" x2="${(cx + dx * length).toFixed(1)}" y2="${(cy + dy * length).toFixed(1)}" gradientUnits="userSpaceOnUse">`,
      `<stop offset="0%" stop-color="${from}" />`,
      `<stop offset="100%" stop-color="${to}" />`,
      `</linearGradient>`,
      `</defs>`,
      `<rect x="0" y="0" width="${width}" height="${height}" fill="url(#bg-gradient)" />`,
    ].join("\n")
  }
  if (background.type === "radial") {
    const cx = clamp(toFinite(background.cx, width / 2), 0, width)
    const cy = clamp(toFinite(background.cy, height / 2), 0, height)
    const radius = Math.max(
      1,
      toFinite(
        background.radius,
        Math.round(Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy))),
      ),
    )
    const from = normalizeColor(background.from, "#f59e0b")
    const to = normalizeColor(background.to, "#0f172a")
    return [
      `<defs>`,
      `<radialGradient id="bg-radial" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${radius.toFixed(1)}" gradientUnits="userSpaceOnUse">`,
      `<stop offset="0%" stop-color="${from}" />`,
      `<stop offset="100%" stop-color="${to}" />`,
      `</radialGradient>`,
      `</defs>`,
      `<rect x="0" y="0" width="${width}" height="${height}" fill="url(#bg-radial)" />`,
    ].join("\n")
  }
  const color = normalizeColor(background.color, DEFAULT_BG)
  return `<rect x="0" y="0" width="${width}" height="${height}" fill="${color}" />`
}

function renderShape(shape: DesignShape, width: number, height: number): string {
  const opacity = normalizeOpacity(shape.opacity)
  const color = normalizeColor(shape.color, "#ffffff")
  const strokeWidth = toFinite(shape.strokeWidth, 0)
  const strokeColor = normalizeColor(shape.strokeColor, color)
  const x = clamp(toFinite(shape.x, 0), 0, width)
  const y = clamp(toFinite(shape.y, 0), 0, height)
  const stroke = strokeWidth > 0 ? ` stroke="${strokeColor}" stroke-width="${strokeWidth}"` : ""

  switch (shape.type) {
    case "rect": {
      const w = Math.min(width, Math.max(MIN_DIMENSION, toFinite(shape.width, 100)))
      const h = Math.min(height, Math.max(MIN_DIMENSION, toFinite(shape.height, 100)))
      const rx = clamp(toFinite(shape.rx, 0), 0, Math.min(w, h) / 2)
      const left = clamp(x, 0, width - w)
      const top = clamp(y, 0, height - h)
      return `<rect x="${left}" y="${top}" width="${w}" height="${h}" rx="${rx}" fill="${color}" fill-opacity="${opacity}"${stroke} />`
    }
    case "circle": {
      const size = Math.max(MIN_DIMENSION, toFinite(shape.size, 100))
      const r = Math.min(size / 2, Math.min(width, height) / 2)
      const cx = clamp(x, r, width - r)
      const cy = clamp(y, r, height - r)
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity="${opacity}"${stroke} />`
    }
    case "ellipse": {
      const rx = Math.min(toFinite(shape.width, 100) / 2, width / 2)
      const ry = Math.min(toFinite(shape.height, 100) / 2, height / 2)
      const cx = clamp(x, rx, width - rx)
      const cy = clamp(y, ry, height - ry)
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}" fill-opacity="${opacity}"${stroke} />`
    }
    case "line": {
      const w = toFinite(shape.width, 100)
      const h = toFinite(shape.height, 0)
      const x1 = clamp(x, 0, width)
      const y1 = clamp(y, 0, height)
      const x2 = clamp(x + w, 0, width)
      const y2 = clamp(y + h, 0, height)
      const sw = Math.max(1, toFinite(shape.size, 4))
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${sw}" />`
    }
    case "triangle": {
      const w = Math.min(width, Math.max(MIN_DIMENSION, toFinite(shape.width, 100)))
      const h = Math.min(height, Math.max(MIN_DIMENSION, toFinite(shape.height, 100)))
      const cx = clamp(x, w / 2, width - w / 2)
      const cy = clamp(y, h / 2, height - h / 2)
      const points = `${cx},${cy - h / 2} ${cx - w / 2},${cy + h / 2} ${cx + w / 2},${cy + h / 2}`
      return `<polygon points="${points}" fill="${color}" fill-opacity="${opacity}"${stroke} />`
    }
    case "ring": {
      const size = Math.max(MIN_DIMENSION, toFinite(shape.size, 100))
      const r = Math.min(size / 2, Math.min(width, height) / 2)
      const cx = clamp(x, r, width - r)
      const cy = clamp(y, r, height - r)
      const sw = Math.max(1, strokeWidth > 0 ? strokeWidth : Math.round(r * 0.15))
      const ringStroke = normalizeColor(shape.strokeColor, color)
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ringStroke}" stroke-opacity="${opacity}" stroke-width="${sw}" />`
    }
    case "emoji": {
      const size = Math.max(MIN_DIMENSION, toFinite(shape.size, 64))
      const cx = clamp(x, 0, width)
      const cy = clamp(y, 0, height)
      const glyph = escapeXml(shape.glyph ?? "✨")
      return `<text x="${cx}" y="${cy}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${glyph}</text>`
    }
  }
}

function renderButton(button: DesignButton, width: number, height: number): string {
  const fontSize = Math.max(12, toFinite(button.fontSize, DEFAULT_BUTTON_SIZE))
  const padX = Math.round(fontSize * 0.9)
  const textWidth = estimateTextWidth(button.text, fontSize, 0)
  const buttonWidth = clamp(
    toFinite(button.width, Math.round(textWidth + padX * 2)),
    MIN_DIMENSION,
    width,
  )
  const buttonHeight = clamp(
    toFinite(button.height, Math.round(fontSize * 2)),
    MIN_DIMENSION,
    height,
  )
  const x = clamp(toFinite(button.x, width / 2), buttonWidth / 2, width - buttonWidth / 2)
  const y = clamp(toFinite(button.y, height / 2), buttonHeight / 2, height - buttonHeight / 2)
  const radius = clamp(toFinite(button.radius, Math.round(buttonHeight / 2)), 0, buttonHeight / 2)
  const background = normalizeColor(button.background, "#ffffff")
  const color = normalizeColor(button.color, "#0f172a")

  return [
    `<rect x="${(x - buttonWidth / 2).toFixed(1)}" y="${(y - buttonHeight / 2).toFixed(1)}" width="${buttonWidth}" height="${buttonHeight}" rx="${radius}" fill="${background}" />`,
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="${fontSize}" font-weight="700" fill="${color}" text-anchor="middle" dominant-baseline="central" letter-spacing="1">${escapeXml(button.text)}</text>`,
  ].join("\n")
}

function blockHeight(fontSize: number, lineCount: number): number {
  return Math.round(fontSize * LINE_HEIGHT * lineCount)
}

function renderTextLayer(
  layer: DesignTextLayer,
  lines: string[],
  fontSize: number,
  color: string,
  fontWeight: string,
  width: number,
  fallbackY: number,
): string {
  const letterSpacing = toFinite(layer.letterSpacing, 0)
  const align = layer.align ?? "center"
  const padding = Math.round(width * PADDING_RATIO)
  const x = align === "left" ? padding : width / 2
  const anchor = align === "left" ? "start" : "middle"
  const y = clamp(toFinite(layer.y, fallbackY), 0, 100_000)

  const lineHeight = Math.round(fontSize * LINE_HEIGHT)
  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${x}"${i === 0 ? "" : ` dy="${lineHeight}"`}>${escapeXml(line)}</tspan>`,
    )
    .join("")

  return `<text x="${x}" y="${y}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}" text-anchor="${anchor}" dominant-baseline="central" letter-spacing="${letterSpacing}">${tspans}</text>`
}

function slugify(name: string | undefined): string {
  const slug = (name ?? "design")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  return `${slug || "design"}.svg`
}

export function renderSvg(spec: DesignSpec): { svg: string; filename: string } {
  const width = Math.round(toFinite(spec.width, 1080))
  const height = Math.round(toFinite(spec.height, 1080))
  const padding = Math.round(width * PADDING_RATIO)
  const defaultMaxWidth = width - padding * 2

  const title = spec.title
    ? {
        layer: spec.title,
        prepared: prepareText(
          spec.title,
          width,
          { fontSize: DEFAULT_TITLE_SIZE },
          toFinite(spec.title.maxWidth, defaultMaxWidth),
        ),
      }
    : null
  const subtitle = spec.subtitle
    ? {
        layer: spec.subtitle,
        prepared: prepareText(
          spec.subtitle,
          width,
          { fontSize: DEFAULT_SUBTITLE_SIZE },
          toFinite(spec.subtitle.maxWidth, defaultMaxWidth),
        ),
      }
    : null
  const footer = spec.footer
    ? {
        layer: spec.footer,
        prepared: prepareText(
          spec.footer,
          width,
          { fontSize: DEFAULT_FOOTER_SIZE },
          toFinite(spec.footer.maxWidth, defaultMaxWidth),
        ),
      }
    : null

  const titleBlock = title ? blockHeight(title.prepared.fontSize, title.prepared.lines.length) : 0
  const subtitleBlock = subtitle
    ? blockHeight(subtitle.prepared.fontSize, subtitle.prepared.lines.length)
    : 0
  const footerBlock = footer
    ? blockHeight(footer.prepared.fontSize, footer.prepared.lines.length)
    : 0

  const titleCenter = title
    ? toFinite(title.layer.y, Math.round(height * (footer ? 0.3 : 0.45)))
    : 0

  const subtitleCenter = subtitle
    ? toFinite(
        subtitle.layer.y,
        title
          ? titleCenter +
              titleBlock / 2 +
              Math.round(Math.max(subtitle.prepared.fontSize * 0.8, 16)) +
              subtitleBlock / 2
          : Math.round(height * 0.55),
      )
    : 0

  const footerCenter = footer
    ? toFinite(footer.layer.y, height - footerBlock / 2 - Math.round(height * 0.06))
    : 0

  const shapesSvg = (spec.shapes ?? []).map((shape) => renderShape(shape, width, height)).join("\n")

  const buttonsSvg = (spec.buttons ?? [])
    .map((button) => renderButton(button, width, height))
    .join("\n")

  const titleSvg = title
    ? renderTextLayer(
        title.layer,
        title.prepared.lines,
        title.prepared.fontSize,
        normalizeColor(title.layer.color, DEFAULT_TEXT),
        title.layer.fontWeight ?? "700",
        width,
        titleCenter,
      )
    : ""

  const subtitleSvg = subtitle
    ? renderTextLayer(
        subtitle.layer,
        subtitle.prepared.lines,
        subtitle.prepared.fontSize,
        normalizeColor(subtitle.layer.color, DEFAULT_TEXT),
        subtitle.layer.fontWeight ?? "400",
        width,
        subtitleCenter,
      )
    : ""

  const footerSvg = footer
    ? renderTextLayer(
        footer.layer,
        footer.prepared.lines,
        footer.prepared.fontSize,
        normalizeColor(footer.layer.color, DEFAULT_TEXT),
        footer.layer.fontWeight ?? "400",
        width,
        footerCenter,
      )
    : ""

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">`,
    renderBackground(spec.background, width, height),
    shapesSvg,
    buttonsSvg,
    titleSvg,
    subtitleSvg,
    footerSvg,
    `</svg>`,
  ].join("\n")

  return { svg, filename: slugify(spec.name) }
}
