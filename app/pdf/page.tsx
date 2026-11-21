"use client"

import { useEffect, useRef, useState } from "react"
import type { UIDataTypes, UIMessage, UIMessagePart, UITools } from "ai"
import { Bot, ExternalLink, Eye, FileText } from "lucide-react"
import AgentPanel from "@/components/agent/AgentPanel"
import { useAgentChat } from "@/components/agent/useAgentChat"
import { objectUrlForPart, revokePdfObjectUrls } from "@/components/agent/pdfObjectUrl"
import PdfResultRenderer from "@/components/agent/renderers/PdfResultRenderer"
import BackLink from "@/components/BackLink"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const EXAMPLES = [
  "Create a one-page resume for a software engineer with 5 years of experience",
  "Write a quarterly project status report template",
  "Generate a job offer letter with placeholders for the name and salary",
]

function getPdfUrl(
  part: UIMessagePart<UIDataTypes, UITools> & { type: "dynamic-tool" },
): string | null {
  return objectUrlForPart(part)?.url ?? null
}

function getLatestPdfUrl(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (msg.role !== "assistant") continue
    for (let j = msg.parts.length - 1; j >= 0; j--) {
      const part = msg.parts[j]
      if (part.type !== "dynamic-tool") continue
      const url = getPdfUrl(part)
      if (url) return url
    }
  }
  return null
}

function PdfViewer({ url }: { url: string | null }) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-muted-foreground flex flex-1 items-center gap-2 text-sm font-medium">
          <FileText className="size-4" />
          PDF Preview
        </h2>
        <div className="h-7">
          {url && (
            <a href={url} target="_blank" rel="noreferrer">
              <Button type="button" variant="outline" size="sm">
                <ExternalLink className="size-4" />
                Open
              </Button>
            </a>
          )}
        </div>
      </div>
      {url ? (
        <div className="border-border flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border">
          <iframe src={url} title="Generated PDF preview" className="min-h-0 w-full flex-1" />
        </div>
      ) : (
        <div className="text-muted-foreground flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <FileText className="text-muted-foreground size-10" />
          <p className="text-sm font-medium">No PDF yet</p>
          <p className="max-w-[260px] text-xs">
            Ask the agent to create a document and the preview will appear here.
          </p>
        </div>
      )}
    </section>
  )
}

export default function PdfPage() {
  const [tab, setTab] = useState<"preview" | "agent">("preview")
  const [draft, setDraft] = useState("")
  const chat = useAgentChat("pdf")

  const latestUrl = getLatestPdfUrl(chat.messages)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const prevLatest = useRef<string | null>(latestUrl)

  useEffect(() => {
    if (latestUrl !== prevLatest.current) {
      prevLatest.current = latestUrl
      setSelectedUrl(null)
    }
  }, [latestUrl])

  const viewerUrl = selectedUrl ?? latestUrl

  const handleNewChat = () => {
    chat.stopAndClear()
    revokePdfObjectUrls()
    setDraft("")
  }

  const agentPanel = (
    <AgentPanel
      messages={chat.messages}
      status={chat.status}
      error={chat.error}
      sendMessage={chat.sendMessage}
      stop={chat.stop}
      regenerate={chat.regenerate}
      onNewChat={handleNewChat}
      value={draft}
      onValueChange={setDraft}
      renderToolCall={(part) => {
        const url = getPdfUrl(part)
        return (
          <PdfResultRenderer
            part={part}
            selected={url !== null && url === viewerUrl}
            onSelect={(u) => setSelectedUrl(u)}
          />
        )
      }}
      placeholder="Describe the document you want..."
      emptyTitle="Ask the agent to create a document"
      emptyHint="Pick a suggestion below or describe any document"
      suggestions={EXAMPLES}
    />
  )

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 flex-col border-b px-4 py-3 lg:flex-row lg:items-center lg:gap-3 lg:px-6">
        <div className="flex items-center gap-2 text-base font-semibold tracking-tight lg:text-lg">
          <BackLink />
          <FileText className="size-4 shrink-0 lg:size-5" />
          <span>PDF Generator</span>
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
        <div className="flex shrink-0 border-b">
          <button
            role="tab"
            aria-selected={tab === "preview"}
            onClick={() => setTab("preview")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "preview"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Eye className="size-4" />
            Preview
          </button>
          <button
            role="tab"
            aria-selected={tab === "agent"}
            onClick={() => setTab("agent")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "agent"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Bot className="size-4" />
            Agent
          </button>
        </div>
        {tab === "preview" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <PdfViewer url={viewerUrl} />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden p-4">{agentPanel}</div>
        )}
      </div>

      <main className="hidden flex-1 gap-0 overflow-hidden lg:flex">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-r">
          <PdfViewer url={viewerUrl} />
        </div>
        <section className="flex min-h-0 w-[420px] shrink-0 flex-col overflow-hidden p-4">
          {agentPanel}
        </section>
      </main>
    </div>
  )
}
