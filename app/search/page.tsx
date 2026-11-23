"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Bot, Link2, Search } from "lucide-react"
import AgentPanel from "@/components/agent/AgentPanel"
import SourcesPanel from "@/components/agent/SourcesPanel"
import { useAgentChat } from "@/components/agent/useAgentChat"
import { getCitationSourcesByMessage } from "@/components/agent/citations"
import type { CitationSource } from "@/components/agent/citations"
import BackLink from "@/components/BackLink"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const EXAMPLES = [
  "Compare OpenAI's latest models and pricing.",
  "What's the 2026 Tesla Model 3 price and range?",
  "Who won the latest F1 race, and who's leading the championship?",
]

export default function SearchPage() {
  const [tab, setTab] = useState<"sources" | "agent">("agent")
  const [draft, setDraft] = useState("")
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const chat = useAgentChat("search")

  const sourcesByMessage = useMemo(
    () => getCitationSourcesByMessage(chat.messages),
    [chat.messages],
  )

  const allSources = useMemo(() => {
    const sources: CitationSource[] = []
    for (const msg of chat.messages) {
      for (const source of sourcesByMessage.get(msg.id) ?? []) {
        sources.push(source)
      }
    }
    return sources
  }, [sourcesByMessage, chat.messages])

  const latestSourcesMessageId = useMemo(() => {
    for (let i = chat.messages.length - 1; i >= 0; i--) {
      const id = chat.messages[i].id
      if ((sourcesByMessage.get(id)?.length ?? 0) > 0) return id
    }
    return null
  }, [chat.messages, sourcesByMessage])

  const prevLatest = useRef<string | null>(latestSourcesMessageId)
  useEffect(() => {
    if (latestSourcesMessageId !== prevLatest.current) {
      prevLatest.current = latestSourcesMessageId
      setSelectedMessageId(null)
    }
  }, [latestSourcesMessageId])

  const activeMessageId = selectedMessageId ?? latestSourcesMessageId
  const activeSources = activeMessageId ? (sourcesByMessage.get(activeMessageId) ?? null) : null

  const handleNewChat = () => {
    chat.stopAndClear()
    setDraft("")
    setSelectedMessageId(null)
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
      getCitationSources={() => allSources}
      renderAssistantFooter={(msg) => {
        const sources = sourcesByMessage.get(msg.id)
        if (!sources || sources.length === 0) return null
        const isActive = activeMessageId === msg.id
        return (
          <div className="mt-2">
            <Button
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="h-7 gap-1.5 px-2.5 text-xs"
              onClick={() => {
                setSelectedMessageId(msg.id)
                setTab("sources")
              }}
            >
              <Link2 className="size-3.5" />
              Sources
              <span className="bg-foreground/10 rounded-full px-1.5 text-[10px] font-medium tabular-nums">
                {sources.length}
              </span>
            </Button>
          </div>
        )
      }}
      placeholder="Ask anything — search the web..."
      emptyTitle="Search the web"
      emptyHint="Ask about news, prices, specs, or comparisons and the agent will search live sources"
      suggestions={EXAMPLES}
    />
  )

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 flex-col border-b px-4 py-3 lg:flex-row lg:items-center lg:gap-3 lg:px-6">
        <div className="flex items-center gap-2 text-base font-semibold tracking-tight lg:text-lg">
          <BackLink />
          <Search className="size-4 shrink-0 lg:size-5" />
          <span>Web Search</span>
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
            aria-selected={tab === "sources"}
            onClick={() => setTab("sources")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "sources"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Link2 className="size-4" />
            Sources
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
        {tab === "sources" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <SourcesPanel sources={activeSources} />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden p-4">{agentPanel}</div>
        )}
      </div>

      <main className="hidden flex-1 gap-0 overflow-hidden lg:flex">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-r">
          <SourcesPanel sources={activeSources} />
        </div>
        <section className="flex min-h-0 w-[420px] shrink-0 flex-col overflow-hidden p-4">
          {agentPanel}
        </section>
      </main>
    </div>
  )
}
