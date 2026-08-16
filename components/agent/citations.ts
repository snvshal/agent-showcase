import { getToolOrDynamicToolName } from "ai"
import type { UIMessage } from "ai"
import type { SearchResult } from "@/lib/search"

export interface CitationSource {
  n: number
  title: string
  url: string
  hostname: string
  snippet?: string
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function getCitationSourcesByMessage(messages: UIMessage[]): Map<string, CitationSource[]> {
  const byMessage = new Map<string, CitationSource[]>()
  let count = 0
  for (const msg of messages) {
    if (msg.role !== "assistant") continue
    const sources: CitationSource[] = []
    for (const part of msg.parts) {
      if (part.type !== "dynamic-tool") continue
      if (getToolOrDynamicToolName(part) !== "search_web") continue
      if (part.state !== "output-available") continue
      const output = (part.output ?? {}) as { results?: SearchResult[] }
      const results = Array.isArray(output.results) ? output.results : []
      for (const result of results) {
        count += 1
        sources.push({
          n: count,
          title: result.title,
          url: result.url,
          hostname: hostname(result.url),
          snippet: result.snippet || undefined,
        })
      }
    }
    if (sources.length > 0) byMessage.set(msg.id, sources)
  }
  return byMessage
}
