import { dynamicTool } from "ai"
import { z } from "zod"
import { searchWeb, type SearchResult } from "@/lib/search"

interface SearchWebOutput {
  query: string
  results: SearchResult[]
  error?: string
}

export const search_web_tool = dynamicTool({
  description:
    "Search the web and return current, factual results (title, URL, snippet) for a query. Use this for any question that needs up-to-date, researched, or factual information — news, events, prices, specs, technical details, comparisons, definitions. Call again with a refined query when the first results miss the mark.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "The search query. Keep it focused on the exact information you need, e.g. 'Next.js 16 route handlers API'.",
      ),
    maxResults: z
      .number()
      .min(1)
      .max(10)
      .optional()
      .describe("Max results to return (default 5, use up to 8 for broad questions)"),
    searchDepth: z
      .enum(["basic", "advanced"])
      .optional()
      .describe("'advanced' runs a slower, deeper search; use for detailed or niche queries"),
  }),
  execute: async (params, { abortSignal }) => {
    const { query, maxResults, searchDepth } = params as {
      query: string
      maxResults?: number
      searchDepth?: "basic" | "advanced"
    }
    try {
      const results = await searchWeb(query, { maxResults, searchDepth, signal: abortSignal })
      return { query, results } satisfies SearchWebOutput
    } catch (error) {
      if (abortSignal?.aborted) throw error
      return {
        query,
        results: [],
        error: error instanceof Error ? error.message : String(error),
      } satisfies SearchWebOutput
    }
  },
})
