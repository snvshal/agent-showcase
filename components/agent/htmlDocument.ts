import type { UIDataTypes, UIMessagePart, UITools } from "ai"

export interface HtmlDocument {
  toolCallId: string
  filename: string
  html: string
  summary?: string
}

export function withPreviewBase(html: string) {
  const baseTag = '<base href="about:srcdoc" />'

  if (/<base\b/i.test(html)) {
    return html.replace(/<base\b[^>]*>/i, baseTag)
  }

  if (/<head\b/i.test(html)) {
    return html.replace(/<head\b[^>]*>/i, (head) => `${head}\n  ${baseTag}`)
  }

  if (/<html\b/i.test(html)) {
    return html.replace(/(<html\b[^>]*>)/i, `$1<head>${baseTag}</head>`)
  }

  return `${baseTag}\n${html}`
}

const FORBIDDEN_TAGS = new Set([
  "script",
  "iframe",
  "frame",
  "frameset",
  "object",
  "embed",
  "applet",
  "base",
])

const URL_ATTRIBUTES = new Set([
  "href",
  "src",
  "action",
  "formaction",
  "poster",
  "cite",
  "data",
  "xlink:href",
])

function isDangerousUrl(value: string) {
  const normalized = value.replace(/[\u0000-\u0020]+/g, "").toLowerCase()
  return (
    normalized.startsWith("javascript:") ||
    normalized.startsWith("vbscript:") ||
    (normalized.startsWith("data:") &&
      !/^data:image\/(png|jpeg|gif|webp);base64,/i.test(normalized))
  )
}

function hasDangerousCss(value: string) {
  return /javascript\s*:|expression\s*\(|@import|url\s*\(\s*['"]?\s*data:/i.test(value)
}

function sanitizeStyleText(value: string) {
  return value
    .replace(/@import[^;]*;/gi, "")
    .replace(/expression\s*\([^)]*\)/gi, "")
    .replace(/url\s*\(\s*(['"]?)javascript:[^)]*\)/gi, "")
    .replace(/url\s*\(\s*(['"]?)data:[^)]*\)/gi, "")
}

function isExternalHttpUrl(value: string) {
  try {
    const url = new URL(value, "https://webpage.local/")
    return (
      (url.protocol === "http:" || url.protocol === "https:") && url.hostname !== "webpage.local"
    )
  } catch {
    return false
  }
}

function hardenExternalLinks(root: ParentNode) {
  for (const link of root.querySelectorAll<HTMLAnchorElement>("a[href]")) {
    const href = link.getAttribute("href")
    if (!href || !isExternalHttpUrl(href)) continue

    link.setAttribute("target", "_blank")
    const rel = new Set(
      (link.getAttribute("rel") ?? "")
        .split(/\s+/)
        .map((token) => token.toLowerCase())
        .filter(Boolean),
    )
    rel.add("noopener")
    rel.add("noreferrer")
    link.setAttribute("rel", Array.from(rel).join(" "))
  }
}

function sanitizeHtml(source: string) {
  const parsed = new DOMParser().parseFromString(source, "text/html")

  for (const element of Array.from(parsed.querySelectorAll("*"))) {
    const tagName = element.localName.toLowerCase()
    if (FORBIDDEN_TAGS.has(tagName)) {
      element.remove()
      continue
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase()
      if (
        name.startsWith("on") ||
        name === "srcdoc" ||
        (name === "style" && hasDangerousCss(attribute.value)) ||
        (URL_ATTRIBUTES.has(name) && isDangerousUrl(attribute.value))
      ) {
        element.removeAttributeNode(attribute)
      }
    }

    if (tagName === "style" && element.textContent) {
      element.textContent = sanitizeStyleText(element.textContent)
    }

    if (tagName === "meta" && element.getAttribute("http-equiv")?.toLowerCase() === "refresh") {
      element.remove()
    }
  }

  hardenExternalLinks(parsed)

  const doctype = parsed.doctype ? `<!DOCTYPE ${parsed.doctype.name}>` : ""
  return parsed.documentElement ? `${doctype}\n${parsed.documentElement.outerHTML}` : ""
}

const documentCache = new Map<string, HtmlDocument>()

export function htmlDocumentForPart(
  part: UIMessagePart<UIDataTypes, UITools> & { type: "dynamic-tool" },
): HtmlDocument | null {
  if (part.type !== "dynamic-tool" || part.toolName !== "generate_webpage") return null
  if (part.state !== "output-available" || !part.output || typeof part.output !== "object") {
    return null
  }

  const cached = documentCache.get(part.toolCallId)
  if (cached) return cached

  const output = part.output as { filename?: unknown; html?: unknown; summary?: unknown }
  if (
    typeof output.filename !== "string" ||
    typeof output.html !== "string" ||
    output.html.length === 0
  ) {
    return null
  }

  const document: HtmlDocument = {
    toolCallId: part.toolCallId,
    filename: output.filename,
    html: sanitizeHtml(output.html),
    summary: typeof output.summary === "string" ? output.summary : undefined,
  }
  if (documentCache.size >= 50) {
    const oldest = documentCache.keys().next().value
    if (oldest) documentCache.delete(oldest)
  }
  documentCache.set(part.toolCallId, document)
  return document
}

export function downloadHtmlDocument(document: Pick<HtmlDocument, "filename" | "html">) {
  const blob = new Blob([document.html], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const safeFilename =
    document.filename.replace(/[^a-z0-9._-]/gi, "-").slice(-80) || "web-page.html"
  const link = window.document.createElement("a")
  link.href = url
  link.download = safeFilename
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}
