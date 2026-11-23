"use client"

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"
import type { UIDataTypes, UIMessage, UIMessagePart, UITools } from "ai"
import { Bot, Check, Code2, Download, Eye, History, Save } from "lucide-react"
import AgentPanel from "@/components/agent/AgentPanel"
import CodeEditor from "@/components/agent/CodeEditor"
import WebpageHistoryDialog from "@/components/agent/WebpageHistoryDialog"
import { useAgentChat } from "@/components/agent/useAgentChat"
import {
  downloadHtmlDocument,
  htmlDocumentForPart,
  withPreviewBase,
  type HtmlDocument,
} from "@/components/agent/htmlDocument"
import {
  listWebpageVersions,
  saveWebpageVersion,
  updateWebpageVersionNote,
  type WebpageVersion,
} from "@/components/agent/webpageVersions"
import { summarizeWebpageVersion } from "@/components/agent/webpageVersionSummary"
import BackLink from "@/components/BackLink"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const EXAMPLES = [
  "Create a responsive personal portfolio for a product designer with an about section, selected work, and contact links.",
  "Build a clean landing page for a neighborhood coffee shop with a menu, opening hours, and a location section.",
  "Design a responsive weekly habit tracker with a checklist layout and progress summary.",
]

const EMPTY_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your page</title>
  </head>
  <body>
    <main>
      <h1>Your HTML page</h1>
      <p>Ask the agent to create a page, or start editing this file.</p>
    </main>
  </body>
</html>`

const VIEW_OPTIONS = [
  { id: "preview", label: "Preview", Icon: Eye },
  { id: "source", label: "Code", Icon: Code2 },
] as const

const MAX_NAME_LENGTH = 24

function normalizeName(value: string) {
  return (
    value
      .trim()
      .replace(/\.html?$/i, "")
      .replace(/[^a-z0-9._-]+/gi, "-")
      .replace(/^[.-]+|[.-]+$/g, "")
      .slice(0, MAX_NAME_LENGTH) || "web-page"
  )
}

function getLatestDocument(messages: UIMessage[]): HtmlDocument | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (msg.role !== "assistant") continue
    for (let j = msg.parts.length - 1; j >= 0; j--) {
      const part = msg.parts[j]
      if (part.type !== "dynamic-tool") continue
      const result = htmlDocumentForPart(
        part as UIMessagePart<UIDataTypes, UITools> & { type: "dynamic-tool" },
      )
      if (result) return result
    }
  }
  return null
}

function normalizeVersionNote(note: string) {
  return note.trim().replace(/\s+/g, " ").slice(0, 120) || undefined
}

function HtmlWorkspace({
  html,
  previewHtml,
  filename,
  view,
  onViewChange,
  onHtmlChange,
  onFilenameChange,
  onDownload,
  onSave,
  onShowHistory,
  versionCount,
  versionError,
  isDirty,
  isSaving,
}: {
  html: string
  previewHtml: string
  filename: string
  view: "preview" | "source"
  onViewChange: (view: "preview" | "source") => void
  onHtmlChange: (html: string) => void
  onFilenameChange: (filename: string) => void
  onDownload: () => void
  onSave: () => void
  onShowHistory: () => void
  versionCount: number
  versionError: string | null
  isDirty: boolean
  isSaving: boolean
}) {
  const canSave = isDirty || versionCount === 0
  const [isRenaming, setIsRenaming] = useState(false)
  const [filenameDraft, setFilenameDraft] = useState<string | null>(null)
  const renameSettledRef = useRef(false)
  const activeDraft = filenameDraft ?? filename

  const startRename = () => {
    renameSettledRef.current = false
    setFilenameDraft(normalizeName(filename))
    setIsRenaming(true)
  }

  const settleRename = (commit: boolean) => {
    if (renameSettledRef.current) return
    renameSettledRef.current = true
    if (commit) onFilenameChange(`${normalizeName(activeDraft)}.html`)
    setFilenameDraft(null)
    setIsRenaming(false)
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 sm:p-4">
      {versionError && (
        <p role="status" className="text-destructive px-1 pb-2 text-xs">
          {versionError}
        </p>
      )}
      <div className="border-border bg-background/50 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border">
        <div className="flex min-w-0 shrink-0 items-center gap-2 border-b px-3 py-2">
          <h2 className="min-w-0 flex-1 text-sm font-medium">
            {isRenaming ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  aria-label="Webpage name"
                  value={activeDraft}
                  maxLength={MAX_NAME_LENGTH}
                  onChange={(event) => setFilenameDraft(event.target.value)}
                  onFocus={(event) => event.currentTarget.select()}
                  onBlur={() => settleRename(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      settleRename(true)
                    } else if (event.key === "Escape") {
                      event.preventDefault()
                      settleRename(false)
                    }
                  }}
                  className="bg-background text-foreground focus-visible:ring-ring w-32 rounded border px-1.5 py-0.5 text-sm font-medium outline-none focus-visible:ring-2 sm:w-44"
                />
                <span className="text-muted-foreground shrink-0">.html</span>
              </div>
            ) : (
              <button
                type="button"
                title="Click to rename"
                aria-label={`Rename ${filename}`}
                onClick={startRename}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring w-full min-w-0 truncate rounded text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {filename}
              </button>
            )}
          </h2>
          <div
            aria-label="Workspace view"
            className="bg-background/80 inline-flex shrink-0 items-center gap-0.5 rounded-lg border p-0.5"
          >
            {VIEW_OPTIONS.map(({ id, label, Icon }) => (
              <Button
                key={id}
                type="button"
                size="sm"
                variant={view === id ? "secondary" : "ghost"}
                aria-label={label}
                aria-pressed={view === id}
                onClick={() => onViewChange(id)}
                className="h-7 gap-1.5 px-2 text-xs"
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Download HTML"
            onClick={onDownload}
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button
            type="button"
            variant={canSave ? "default" : "outline"}
            size="sm"
            aria-label={isSaving ? "Saving version" : canSave ? "Save version" : "Saved"}
            disabled={!canSave || isSaving}
            onClick={onSave}
          >
            {canSave ? <Save className="size-4" /> : <Check className="size-4" />}
            <span className="hidden sm:inline">
              {isSaving ? "Saving…" : canSave ? "Save" : "Saved"}
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={`Version history, ${versionCount} versions`}
            onClick={onShowHistory}
          >
            <History className="size-4" />
            <span className="hidden sm:inline">History</span>
            <span className="text-muted-foreground text-[10px]">{versionCount}</span>
          </Button>
        </div>

        <div className="relative min-h-0 flex-1">
          {view === "preview" ? (
            <iframe
              srcDoc={withPreviewBase(previewHtml)}
              title={`Live preview of ${filename}`}
              sandbox="allow-forms allow-popups allow-scripts"
              referrerPolicy="no-referrer"
              className="h-full w-full bg-white"
            />
          ) : (
            <div className="flex h-full min-h-0 flex-col">
              <CodeEditor
                value={html}
                onChange={onHtmlChange}
                label="Complete HTML document editor"
                language="html"
                className="min-h-0 flex-1"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function HtmlPage() {
  const [tab, setTab] = useState<"workspace" | "agent">("agent")
  const [workspaceView, setWorkspaceView] = useState<"preview" | "source">("preview")
  const [draft, setDraft] = useState("")
  const [html, setHtml] = useState(EMPTY_HTML)
  const [previewHtml, setPreviewHtml] = useState(EMPTY_HTML)
  const [filename, setFilename] = useState("web-page.html")
  const [savedHtml, setSavedHtml] = useState(EMPTY_HTML)
  const [savedFilename, setSavedFilename] = useState("web-page.html")
  const [versions, setVersions] = useState<WebpageVersion[]>([])
  const [versionsReady, setVersionsReady] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [versionError, setVersionError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const adoptedToolCallRef = useRef<string | null>(null)
  const adoptionGenerationRef = useRef(0)
  const isDirty = html !== savedHtml || filename !== savedFilename

  const persistVersion = useCallback(async (version: Omit<WebpageVersion, "id" | "createdAt">) => {
    try {
      const saved = await saveWebpageVersion(version)
      setVersions(await listWebpageVersions())
      setVersionError(null)
      return saved
    } catch {
      setVersionError("Could not save version history in this browser.")
      return null
    }
  }, [])

  const persistAnnotatedVersion = useCallback(
    async (
      version: Omit<WebpageVersion, "id" | "createdAt">,
      previousHtml: string,
      suppliedSummary?: string,
    ) => {
      const saved = await persistVersion(version)
      if (!saved) return null

      void (async () => {
        const commitMessage =
          normalizeVersionNote(suppliedSummary ?? "") ??
          (await summarizeWebpageVersion(previousHtml, saved.html))
        if (!commitMessage) return
        try {
          await updateWebpageVersionNote(saved.id, commitMessage)
          setVersions(await listWebpageVersions())
        } catch {
          setVersionError("Could not update version note.")
        }
      })()

      return saved
    },
    [persistVersion],
  )

  useEffect(() => {
    let active = true
    void listWebpageVersions()
      .then((storedVersions) => {
        if (!active) return
        setVersions(storedVersions)
        const latest = storedVersions[0]
        if (latest) {
          setHtml(latest.html)
          setPreviewHtml(latest.html)
          setFilename(latest.filename)
          setSavedHtml(latest.html)
          setSavedFilename(latest.filename)
        }
      })
      .catch(() => {
        if (active) setVersionError("Version history is unavailable in this browser.")
      })
      .finally(() => {
        if (active) setVersionsReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setPreviewHtml(html), 200)
    return () => window.clearTimeout(timer)
  }, [html])

  const handleViewChange = useCallback(
    (view: "preview" | "source") => {
      if (view === "preview") setPreviewHtml(html)
      setWorkspaceView(view)
    },
    [html],
  )

  const getCurrentHtml = useCallback(() => html, [html])
  const chat = useAgentChat("webpage", getCurrentHtml)

  useEffect(() => {
    if (!versionsReady) return
    const document = getLatestDocument(chat.messages)
    if (!document || document.toolCallId === adoptedToolCallRef.current) return
    adoptedToolCallRef.current = document.toolCallId
    setTab("workspace")
    const generation = ++adoptionGenerationRef.current

    const previousHtml = html
    const previousFilename = filename
    const previousWasDirty = previousHtml !== savedHtml || previousFilename !== savedFilename
    setHtml(document.html)
    setPreviewHtml(document.html)
    setFilename(document.filename)

    void (async () => {
      if (previousWasDirty) {
        await persistAnnotatedVersion(
          { html: previousHtml, filename: previousFilename, source: "manual" },
          savedHtml,
        )
      }
      const saved = await persistAnnotatedVersion(
        { html: document.html, filename: document.filename, source: "agent" },
        previousHtml,
        document.summary,
      )
      if (saved && generation === adoptionGenerationRef.current) {
        setSavedHtml(saved.html)
        setSavedFilename(saved.filename)
      }
    })()
  }, [
    chat.messages,
    filename,
    html,
    persistAnnotatedVersion,
    savedFilename,
    savedHtml,
    versionsReady,
  ])

  const handleSave = async () => {
    if ((!isDirty && versions.length > 0) || isSaving) return
    setIsSaving(true)
    try {
      const saved = await persistAnnotatedVersion({ html, filename, source: "manual" }, savedHtml)
      if (saved) {
        setSavedHtml(saved.html)
        setSavedFilename(saved.filename)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const saveBeforeAgent = async () => {
    if (isDirty) {
      await persistAnnotatedVersion({ html, filename, source: "manual" }, savedHtml)
    }
    return true
  }

  const handleSendMessage = async (message: { text: string }) => {
    if (!(await saveBeforeAgent())) return
    return chat.sendMessage(message)
  }

  const handleRegenerate = async (options?: { messageId?: string }) => {
    if (!(await saveBeforeAgent())) return
    return chat.regenerate(options)
  }

  const handleRestore = async (version: WebpageVersion) => {
    if (isDirty) {
      await persistVersion({ html, filename, source: "restore-checkpoint" })
    }

    const restored = await persistVersion({
      html: version.html,
      filename: version.filename,
      commitMessage: normalizeVersionNote(
        version.commitMessage ? `Restored: ${version.commitMessage}` : "",
      ),
      source: "restore",
    })
    const nextHtml = restored?.html ?? version.html
    const nextFilename = restored?.filename ?? version.filename

    setHtml(nextHtml)
    setPreviewHtml(nextHtml)
    setFilename(nextFilename)
    setSavedHtml(nextHtml)
    setSavedFilename(nextFilename)
    setHistoryOpen(false)
    setTab("workspace")
  }

  const handleNewChat = () => {
    chat.stopAndClear()
    adoptedToolCallRef.current = null
    adoptionGenerationRef.current += 1
    setDraft("")
    setTab("agent")
  }

  useEffect(() => {
    if (!isDirty) return
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", warnBeforeLeaving)
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving)
  }, [isDirty])

  const agentPanel = (
    <AgentPanel
      messages={chat.messages}
      status={chat.status}
      error={chat.error}
      sendMessage={handleSendMessage}
      stop={chat.stop}
      regenerate={handleRegenerate}
      onNewChat={handleNewChat}
      value={draft}
      onValueChange={setDraft}
      placeholder="Describe the page or edit you want..."
      emptyTitle="Ask the agent to build a web page"
      emptyHint="Choose an example or describe a page to create"
      suggestions={EXAMPLES}
    />
  )

  const workspace = (
    <HtmlWorkspace
      html={html}
      previewHtml={previewHtml}
      filename={filename}
      view={workspaceView}
      onViewChange={handleViewChange}
      onHtmlChange={setHtml}
      onFilenameChange={setFilename}
      onDownload={() => downloadHtmlDocument({ filename, html })}
      onSave={handleSave}
      onShowHistory={() => setHistoryOpen(true)}
      versionCount={Math.min(versions.length, 10)}
      versionError={versionError}
      isDirty={isDirty}
      isSaving={isSaving}
    />
  )

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 flex-col border-b px-4 py-3 lg:flex-row lg:items-center lg:gap-3 lg:px-6">
        <div className="flex items-center gap-2 text-base font-semibold tracking-tight lg:text-lg">
          <BackLink />
          <Code2 className="size-4 shrink-0 lg:size-5" />
          <span>Webpage Builder</span>
          <div className="ml-auto lg:hidden">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex items-center gap-3 lg:flex-1">
          <div className="hidden lg:ml-auto lg:block">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <div role="tablist" aria-label="Webpage builder panels" className="flex shrink-0 border-b">
          {(
            [
              ["workspace", "Workspace", Eye],
              ["agent", "Agent", Bot],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`webpage-tab-${id}`}
              aria-selected={tab === id}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
                event.preventDefault()
                setTab(id === "workspace" ? "agent" : "workspace")
              }}
              className={`focus-visible:ring-ring flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none ${
                tab === id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`webpage-panel-${tab}`}
          aria-labelledby={`webpage-tab-${tab}`}
          className={
            tab === "agent"
              ? "min-h-0 flex-1 overflow-hidden p-3"
              : "flex min-h-0 flex-1 flex-col overflow-hidden"
          }
        >
          {tab === "agent" ? agentPanel : workspace}
        </div>
      </div>

      <main className="hidden min-h-0 flex-1 gap-0 overflow-hidden lg:flex">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-r">
          {workspace}
        </div>
        <section className="flex min-h-0 w-[420px] shrink-0 flex-col overflow-hidden p-4">
          {agentPanel}
        </section>
      </main>
      {historyOpen && (
        <WebpageHistoryDialog
          versions={versions}
          currentHtml={html}
          currentFilename={filename}
          onClose={() => setHistoryOpen(false)}
          onRestore={handleRestore}
        />
      )}
    </div>
  )
}
