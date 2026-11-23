import { createTwoFilesPatch } from "diff"
import { MAX_WEBPAGE_DIFF_LENGTH } from "@/lib/webpageDiff"

const SUMMARY_TIMEOUT_MS = 10_000

export async function summarizeWebpageVersion(previousHtml: string, nextHtml: string) {
  if (previousHtml === nextHtml) return undefined

  const fullDiff = createTwoFilesPatch(
    "previous.html",
    "current.html",
    previousHtml,
    nextHtml,
    "",
    "",
    { context: 2 },
  )
  const diff =
    fullDiff.length <= MAX_WEBPAGE_DIFF_LENGTH
      ? fullDiff
      : `${fullDiff.slice(0, MAX_WEBPAGE_DIFF_LENGTH / 2)}\n[diff excerpt]\n${fullDiff.slice(-MAX_WEBPAGE_DIFF_LENGTH / 2)}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SUMMARY_TIMEOUT_MS)

  try {
    const response = await fetch("/api/webpage/version-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diff }),
      signal: controller.signal,
    })
    if (!response.ok) return undefined
    const result = (await response.json()) as { summary?: unknown }
    return typeof result.summary === "string" ? result.summary.trim() || undefined : undefined
  } catch {
    return undefined
  } finally {
    clearTimeout(timeout)
  }
}
