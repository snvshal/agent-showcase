export interface SearchResult {
  title: string
  url: string
  snippet: string
}

interface ExaResult {
  title?: string
  url?: string
  text?: string
  highlights?: string[]
}

interface ExaResponse {
  results?: ExaResult[]
}

const MAX_CACHE_AGE_MS = 5 * 60 * 1000
const cache = new Map<string, { at: number; value: SearchResult[] }>()

function cacheKey(query: string, maxResults: number, searchDepth: string): string {
  return `${searchDepth}:${maxResults}:${query.trim().toLowerCase()}`
}

function pruneCache(): void {
  const now = Date.now()
  for (const [key, entry] of cache) {
    if (now - entry.at > MAX_CACHE_AGE_MS) cache.delete(key)
  }
  if (cache.size > 200) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0]
    if (oldest) cache.delete(oldest[0])
  }
}

function snippetFor(result: ExaResult): string {
  if (result.highlights && result.highlights.length > 0) {
    return result.highlights.join(" ").trim().slice(0, 500)
  }
  return (result.text ?? "").trim().slice(0, 500)
}

function normalizeResults(data: ExaResponse): SearchResult[] {
  const seen = new Set<string>()
  const results: SearchResult[] = []
  for (const raw of data.results ?? []) {
    const url = raw.url?.trim()
    if (!url || seen.has(url)) continue
    seen.add(url)
    results.push({
      title: (raw.title ?? url).trim(),
      url,
      snippet: snippetFor(raw),
    })
  }
  return results
}

export interface SearchWebOptions {
  maxResults?: number
  searchDepth?: "basic" | "advanced"
}

const EXA_SEARCH_TYPES: Record<NonNullable<SearchWebOptions["searchDepth"]>, string> = {
  basic: "auto",
  advanced: "deep",
}

export async function searchWeb(
  query: string,
  { maxResults = 5, searchDepth = "basic" }: SearchWebOptions = {},
): Promise<SearchResult[]> {
  const apiKey = process.env.EXA_API_KEY
  if (!apiKey) {
    throw new Error("EXA_API_KEY is not configured. Add it to your .env.local file.")
  }

  const key = cacheKey(query, maxResults, searchDepth)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.at <= MAX_CACHE_AGE_MS) {
    return cached.value
  }

  let response: Response
  try {
    response = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        query,
        type: EXA_SEARCH_TYPES[searchDepth],
        numResults: maxResults,
        contents: { highlights: true },
      }),
      signal: AbortSignal.timeout(20_000),
    })
  } catch (error) {
    throw new Error(`Web search failed: ${error instanceof Error ? error.message : String(error)}`)
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(
      `Web search failed (${response.status})${body ? `: ${body.slice(0, 200)}` : ""}`,
    )
  }

  const data = (await response.json()) as ExaResponse
  const results = normalizeResults(data)

  if (results.length === 0) {
    return []
  }

  pruneCache()
  cache.set(key, { at: Date.now(), value: results })
  return results
}
