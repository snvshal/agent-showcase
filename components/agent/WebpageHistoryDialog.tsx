"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { diffLines } from "diff"
import { Clock3, Eye, GitCompareArrows, RotateCcw, X } from "lucide-react"
import { withPreviewBase } from "@/components/agent/htmlDocument"
import { Button } from "@/components/ui/button"
import type { WebpageVersion } from "@/components/agent/webpageVersions"

function sourceLabel(source: WebpageVersion["source"]) {
  switch (source) {
    case "agent":
      return "Agent update"
    case "manual":
      return "Manual save"
    case "restore":
      return "Restored"
    case "restore-checkpoint":
      return "Before restore"
  }
}

function formatVersionTimestamp(timestamp: number) {
  const date = new Date(timestamp)
  const day = new Intl.DateTimeFormat("en-GB", { day: "numeric" }).format(date)
  const month = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date)
  const year = new Intl.DateTimeFormat("en-GB", { year: "numeric" }).format(date)
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
  return `${day} ${month.toLowerCase()}, ${year}, ${time}`
}

export default function WebpageHistoryDialog({
  versions,
  currentHtml,
  currentFilename,
  onClose,
  onRestore,
}: {
  versions: WebpageVersion[]
  currentHtml: string
  currentFilename: string
  onClose: () => void
  onRestore: (version: WebpageVersion) => Promise<void>
}) {
  const [selectedId, setSelectedId] = useState(versions[0]?.id ?? null)
  const [compareToId, setCompareToId] = useState(versions[1]?.id ?? null)
  const [comparing, setComparing] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const visibleVersions = versions.slice(0, 10)
  const selected =
    visibleVersions.find((version) => version.id === selectedId) ?? visibleVersions[0] ?? null
  const comparisonVersions = visibleVersions.filter((version) => version.id !== selected?.id)
  const compareVersion =
    comparisonVersions.find((version) => version.id === compareToId) ??
    comparisonVersions[0] ??
    null
  const isCurrentVersion = selected?.html === currentHtml && selected?.filename === currentFilename
  const diff = useMemo(() => {
    if (!comparing) return []
    const visible = versions.slice(0, 10)
    const current = visible.find((version) => version.id === selectedId) ?? visible[0]
    const candidates = visible.filter((version) => version.id !== current?.id)
    const other = candidates.find((version) => version.id === compareToId) ?? candidates[0]
    if (!current || !other) return []
    return diffLines(other.html, current.html)
  }, [comparing, compareToId, selectedId, versions])

  const { addedLines, removedLines } = useMemo(() => {
    let added = 0
    let removed = 0
    for (const change of diff) {
      if (change.added) added += change.count ?? 0
      if (change.removed) removed += change.count ?? 0
    }
    return { addedLines: added, removedLines: removed }
  }, [diff])
  const dialogRef = useRef<HTMLElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current()
    }
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [])

  const restore = async () => {
    if (!selected || isCurrentVersion || restoring) return
    setRestoring(true)
    try {
      await onRestore(selected)
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="webpage-history-title"
        className="bg-background flex h-[min(92dvh,54rem)] max-h-[calc(100dvh-1.5rem)] min-h-[min(32rem,calc(100dvh-1.5rem))] w-full max-w-6xl flex-col overflow-hidden rounded-xl border shadow-xl sm:h-[min(90dvh,58rem)] sm:max-h-[calc(100dvh-3rem)] sm:min-h-[min(38rem,calc(100dvh-3rem))]"
      >
        <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-3">
          <Clock3 className="text-muted-foreground size-4" />
          <div className="min-w-0 flex-1">
            <h2 id="webpage-history-title" className="text-sm font-semibold">
              Version history
            </h2>
            <p className="text-muted-foreground text-xs">Latest 10 versions</p>
          </div>
          <div className="order-last flex w-full shrink-0 items-center gap-2 sm:order-none sm:w-auto sm:gap-1">
            {selected && comparisonVersions.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setComparing((current) => !current)}
                className="flex-1 sm:flex-none"
              >
                {comparing ? (
                  <Eye className="size-3.5" />
                ) : (
                  <GitCompareArrows className="size-3.5" />
                )}
                <span>{comparing ? "Preview" : "Compare"}</span>
              </Button>
            )}
            {isCurrentVersion ? (
              <span className="text-muted-foreground flex-1 px-2 text-center text-xs sm:flex-none">
                Current version
              </span>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={restore}
                disabled={!selected || restoring}
                className="flex-1 sm:flex-none"
              >
                <RotateCcw className="size-3.5" />
                <span>{restoring ? "Restoring…" : "Restore"}</span>
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close history"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </header>

        {visibleVersions.length === 0 ? (
          <div className="text-muted-foreground flex min-h-48 flex-1 items-center justify-center p-8 text-sm">
            No saved versions yet. Edit the page or ask the agent to create one.
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            <ol className="border-border max-h-48 shrink-0 divide-y overflow-y-auto border-b sm:max-h-none sm:w-72 sm:border-r sm:border-b-0">
              {visibleVersions.map((version) => (
                <li key={version.id}>
                  <button
                    type="button"
                    aria-pressed={selected?.id === version.id}
                    onClick={() => setSelectedId(version.id)}
                    className={`focus-visible:ring-ring w-full px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset ${
                      selected?.id === version.id ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                  >
                    <span
                      className="text-foreground block truncate text-sm font-medium"
                      title={version.commitMessage}
                    >
                      {version.commitMessage || sourceLabel(version.source)}
                    </span>
                    <span className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-[11px]">
                      <span className="min-w-0 truncate">{version.filename}</span>
                      <span aria-hidden="true">·</span>
                      <time
                        className="shrink-0"
                        dateTime={new Date(version.createdAt).toISOString()}
                      >
                        {formatVersionTimestamp(version.createdAt)}
                      </time>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            {selected && (
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                {comparing && compareVersion ? (
                  <div className="flex min-h-0 flex-1 flex-col">
                    <div className="border-border flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2 text-xs">
                      <label htmlFor="webpage-compare-version" className="text-muted-foreground">
                        Compare with
                      </label>
                      <select
                        id="webpage-compare-version"
                        value={compareVersion.id}
                        onChange={(event) => setCompareToId(Number(event.target.value))}
                        className="bg-background text-foreground focus-visible:ring-ring min-w-0 flex-1 rounded-md border px-2 py-1 text-xs outline-none focus-visible:ring-2"
                      >
                        {comparisonVersions.map((version) => (
                          <option key={version.id} value={version.id}>
                            {version.commitMessage || sourceLabel(version.source)} ·{" "}
                            {version.filename}
                          </option>
                        ))}
                      </select>
                      <span className="text-emerald-700 dark:text-emerald-400">+{addedLines}</span>
                      <span className="text-red-700 dark:text-red-400">−{removedLines}</span>
                    </div>
                    <div
                      role="region"
                      aria-label={`Code changes from ${compareVersion.filename} to ${selected.filename}`}
                      className="bg-background min-h-0 flex-1 overflow-auto py-2 font-mono text-xs leading-5"
                    >
                      {diff.length === 0 ? (
                        <p className="text-muted-foreground p-4">
                          No changes between these versions.
                        </p>
                      ) : (
                        diff.map((change, chunkIndex) => (
                          <div
                            key={`${chunkIndex}-${change.value.slice(0, 20)}`}
                            className={
                              change.added
                                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                                : change.removed
                                  ? "bg-red-500/10 text-red-800 dark:text-red-300"
                                  : "text-muted-foreground"
                            }
                          >
                            {change.value.split("\n").map((line, lineIndex, lines) => {
                              if (lineIndex === lines.length - 1 && line === "") return null
                              const marker = change.added ? "+" : change.removed ? "−" : " "
                              return (
                                <div
                                  key={`${chunkIndex}-${lineIndex}`}
                                  className="flex min-w-max px-3"
                                >
                                  <span className="w-5 shrink-0 select-none">{marker}</span>
                                  <span>{line || " "}</span>
                                </div>
                              )
                            })}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <iframe
                    srcDoc={withPreviewBase(selected.html)}
                    title={`Preview of ${selected.filename}`}
                    sandbox="allow-forms allow-popups allow-scripts"
                    referrerPolicy="no-referrer"
                    className="min-h-64 w-full flex-1 bg-white"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
