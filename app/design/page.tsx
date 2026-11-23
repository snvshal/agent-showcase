"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import type { UIDataTypes, UIMessage, UIMessagePart, UITools } from "ai"
import { Bot, Download, ExternalLink, Palette } from "lucide-react"
import AgentPanel from "@/components/agent/AgentPanel"
import { useAgentChat } from "@/components/agent/useAgentChat"
import {
  designUrlForPart,
  exportDesignPng,
  revokeDesignObjectUrls,
  type DesignResult,
} from "@/components/agent/designObjectUrl"
import DesignResultRenderer from "@/components/agent/renderers/DesignResultRenderer"
import BackLink from "@/components/BackLink"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const EXAMPLES = [
  "1080x1080 product launch post, radial glow, title 'Introducing Nova', rocket emoji, and a 'Register Now' button",
  "Black Friday banner, 1920x1080, bold 'SALE 50% OFF' with two buttons: 'Shop Now' and 'See Deals'",
  "Make an inspirational quote card on a warm sunset gradient with 'Dream big'",
]

function getLatestDesign(messages: UIMessage[]): DesignResult | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (msg.role !== "assistant") continue
    for (let j = msg.parts.length - 1; j >= 0; j--) {
      const part = msg.parts[j]
      if (part.type !== "dynamic-tool") continue
      const result = designUrlForPart(
        part as UIMessagePart<UIDataTypes, UITools> & {
          type: "dynamic-tool"
        },
      )
      if (result) return result
    }
  }
  return null
}

function DesignViewer({ design }: { design: DesignResult | null }) {
  const [exporting, setExporting] = useState(false)

  const handleDownload = async () => {
    if (!design || exporting) return
    setExporting(true)
    try {
      await exportDesignPng(design)
    } catch (error) {
      console.error("Failed to export PNG", error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-muted-foreground flex flex-1 items-center gap-2 text-sm font-medium">
          <Palette className="size-4" />
          Design Preview
        </h2>
        <div className="flex h-7 items-center gap-1.5">
          {design && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={exporting}
                onClick={handleDownload}
              >
                <Download className="size-4" />
                {exporting ? "Exporting..." : "Download PNG"}
              </Button>
              <a href={design.url} target="_blank" rel="noreferrer">
                <Button type="button" variant="outline" size="sm">
                  <ExternalLink className="size-4" />
                  Open
                </Button>
              </a>
            </>
          )}
        </div>
      </div>
      {design ? (
        <div className="border-border bg-background/50 flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg border p-4">
          <Image
            src={design.url}
            alt="Generated design preview"
            width={design.width}
            height={design.height}
            unoptimized
            className="max-h-full max-w-full rounded-md object-contain shadow-sm"
          />
        </div>
      ) : (
        <div className="text-muted-foreground flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <Palette className="text-muted-foreground size-10" />
          <p className="text-sm font-medium">No design yet</p>
          <p className="max-w-[260px] text-xs">
            Ask the agent to create a graphic and the preview will appear here.
          </p>
        </div>
      )}
    </section>
  )
}

export default function DesignPage() {
  const [tab, setTab] = useState<"preview" | "agent">("agent")
  const [draft, setDraft] = useState("")
  const chat = useAgentChat("design")

  const design = getLatestDesign(chat.messages)
  const [selected, setSelected] = useState<DesignResult | null>(null)
  const prevLatest = useRef<string | null>(null)

  useEffect(() => {
    const latestUrl = design?.url ?? null
    if (latestUrl !== prevLatest.current) {
      prevLatest.current = latestUrl
      setSelected(null)
      setTab("preview")
    }
  }, [design])

  const viewer = selected ?? design

  const handleNewChat = () => {
    chat.stopAndClear()
    revokeDesignObjectUrls()
    prevLatest.current = null
    setDraft("")
    setTab("agent")
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
        const result = designUrlForPart(part)
        return (
          <DesignResultRenderer
            part={part}
            selected={result !== null && result.url === viewer?.url}
            onSelect={() => {
              if (result) {
                setSelected(result)
                setTab("preview")
              }
            }}
          />
        )
      }}
      placeholder="Describe the graphic you want..."
      emptyTitle="Ask the agent to create a design"
      emptyHint="Pick a suggestion below or describe any graphic"
      suggestions={EXAMPLES}
    />
  )

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 flex-col border-b px-4 py-3 lg:flex-row lg:items-center lg:gap-3 lg:px-6">
        <div className="flex items-center gap-2 text-base font-semibold tracking-tight lg:text-lg">
          <BackLink />
          <Palette className="size-4 shrink-0 lg:size-5" />
          <span>Design Generator</span>
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
            <Palette className="size-4" />
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
            <DesignViewer design={viewer} />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden p-4">{agentPanel}</div>
        )}
      </div>

      <main className="hidden flex-1 gap-0 overflow-hidden lg:flex">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-r">
          <DesignViewer design={viewer} />
        </div>
        <section className="flex min-h-0 w-[420px] shrink-0 flex-col overflow-hidden p-4">
          {agentPanel}
        </section>
      </main>
    </div>
  )
}
