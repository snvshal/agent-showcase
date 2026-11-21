"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import type { ChatStatus, UIDataTypes, UIMessage, UIMessagePart, UITools } from "ai"
import { isDynamicToolUIPart, isToolUIPart } from "ai"
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Send, Bot, Square, RotateCcw } from "lucide-react"
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller"
import TextRenderer from "@/components/agent/renderers/TextRenderer"
import ReasoningRenderer from "@/components/agent/renderers/ReasoningRenderer"
import ToolCallRenderer from "@/components/agent/renderers/ToolCallRenderer"
import LoadingStatus from "@/components/agent/renderers/LoadingStatus"
import TokenUsageBadge, { type TokenUsage } from "@/components/agent/renderers/TokenUsageBadge"
import MessageDuration from "@/components/agent/renderers/MessageDuration"
import type { CitationSource } from "@/components/agent/citations"

export interface AgentPanelProps {
  messages: UIMessage[]
  status: ChatStatus
  error?: Error | undefined
  sendMessage: (message: { text: string }) => Promise<void>
  stop: () => void
  regenerate: (options?: { messageId?: string }) => Promise<void>
  onNewChat?: () => void
  renderToolCall?: (
    part: UIMessagePart<UIDataTypes, UITools> & { type: "dynamic-tool" },
  ) => ReactNode
  getCitationSources?: (message: UIMessage) => CitationSource[]
  renderAssistantFooter?: (message: UIMessage) => ReactNode
  placeholder?: string
  emptyTitle?: string
  emptyHint?: string
  suggestions?: string[]
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

function getAgentStatus(status: ChatStatus, lastMsg: UIMessage | undefined): string | null {
  if (status === "submitted") return "Working on your request"
  if (status !== "streaming") return null
  if (!lastMsg || lastMsg.role !== "assistant") return null

  for (let i = lastMsg.parts.length - 1; i >= 0; i--) {
    const part = lastMsg.parts[i]
    if (part.type === "text" && part.state === "streaming") {
      return null
    }
  }
  return "Working on your request"
}

export default function AgentPanel({
  messages,
  status,
  error,
  sendMessage,
  stop,
  regenerate,
  onNewChat,
  renderToolCall,
  getCitationSources,
  renderAssistantFooter,
  placeholder = "Ask about the data...",
  emptyTitle = "Ask the agent about the data",
  emptyHint = 'Try "What were our biggest expenses?" or "Show me income by department"',
  suggestions,
  value,
  onValueChange,
  className,
}: AgentPanelProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const draft = value ?? input
  const setDraft = onValueChange ?? setInput
  const isBusy = status === "submitted" || status === "streaming"

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    if (draft) {
      el.style.height = `${Math.min(el.scrollHeight, 128)}px`
    }
  }, [draft])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isBusy) return

    const msg = draft.trim()
    if (!msg) return
    setDraft("")
    sendMessage({ text: msg })
  }

  function renderPart(
    part: UIMessagePart<UIDataTypes, UITools>,
    i: number,
    isAssistant: boolean,
    isLastText: boolean,
    sources?: CitationSource[],
  ) {
    if (isDynamicToolUIPart(part)) {
      return (
        <div key={i}>
          <ToolCallRenderer part={part} />
          {renderToolCall ? renderToolCall(part) : null}
        </div>
      )
    }
    if (isToolUIPart(part)) {
      return (
        <div key={i}>
          <ToolCallRenderer part={part} />
        </div>
      )
    }
    switch (part.type) {
      case "text":
        return (
          <TextRenderer
            key={i}
            part={part}
            isAssistant={isAssistant}
            isLastText={isLastText}
            sources={sources}
          />
        )
      case "reasoning":
        return <ReasoningRenderer key={i} part={part} />
      default:
        return null
    }
  }

  const lastAssistantMsg =
    messages[messages.length - 1]?.role === "assistant" ? messages[messages.length - 1] : undefined
  const statusText = isBusy ? getAgentStatus(status, lastAssistantMsg) : null
  const isPendingFirstChunk = isBusy && !lastAssistantMsg

  return (
    <Card size="sm" className={`flex h-full min-h-0 flex-col pb-0 ${className ?? ""}`}>
      <CardHeader>
        <CardTitle>Agent Chat</CardTitle>
        <CardAction className="h-7">
          {onNewChat && messages.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={onNewChat}>
              <Plus className="size-3.5" />
              New chat
            </Button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        {status === "error" && error && (
          <div className="mx-3 mt-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
            <span className="flex-1">{error.message ?? String(error)}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-6 border-red-200 px-2 text-[11px] text-red-600 hover:bg-red-100 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
              onClick={() => regenerate()}
            >
              Retry
            </Button>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
            <div className="text-muted-foreground flex min-h-0 flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
              <Bot className="text-muted-foreground size-8" />
              <p className="text-sm font-medium">{emptyTitle}</p>
              <p className="max-w-[240px] text-xs">{emptyHint}</p>
            </div>
            {suggestions && suggestions.length > 0 && (
              <div className="flex w-full flex-col items-stretch gap-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => sendMessage({ text: suggestion })}
                    className="text-muted-foreground h-auto px-3 py-2 text-left whitespace-normal"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <MessageScrollerProvider autoScroll scrollPreviousItemPeek={0}>
            <MessageScroller className="flex-1">
              <MessageScrollerViewport>
                <MessageScrollerContent className="gap-0 px-3 pb-3">
                  {messages.map((msg) => {
                    const lastTextIndex = msg.parts.reduce(
                      (last, p, idx) => (p.type === "text" ? idx : last),
                      -1,
                    )
                    const isLastMsg = msg.id === messages[messages.length - 1]?.id
                    const isStreamingMsg = msg.role === "assistant" && isBusy && isLastMsg
                    const citationSources = getCitationSources ? getCitationSources(msg) : undefined

                    return (
                      <MessageScrollerItem
                        key={msg.id}
                        messageId={msg.id}
                        scrollAnchor={msg.role === "user"}
                      >
                        {msg.role === "user" ? (
                          <div className="mb-3 flex justify-end">
                            <div className="bg-muted max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed">
                              {msg.parts.map((part, i) =>
                                renderPart(part, i, false, i === msg.parts.length - 1),
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 text-sm leading-relaxed">
                            {msg.parts.map((part, i) =>
                              renderPart(part, i, true, i === lastTextIndex, citationSources),
                            )}

                            {isStreamingMsg && statusText && (
                              <div className={msg.parts.length > 0 ? "mt-2" : ""}>
                                <LoadingStatus text={statusText} showElapsed />
                              </div>
                            )}

                            {(() => {
                              const meta = msg.metadata as
                                { usage?: TokenUsage; elapsedMs?: number } | undefined
                              const duration = meta?.elapsedMs
                              const usage = meta?.usage
                              const isLastAssistant = msg.id === lastAssistantMsg?.id && !isBusy

                              if (duration === undefined && !usage && !isLastAssistant) return null

                              return (
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  {usage && <TokenUsageBadge usage={usage} />}
                                  {duration !== undefined && <MessageDuration ms={duration} />}
                                  {isLastAssistant && (
                                    <button
                                      type="button"
                                      onClick={() => regenerate()}
                                      disabled={isBusy}
                                      aria-label="Retry response"
                                      className="text-muted-foreground border-border bg-muted/50 hover:bg-muted hover:text-foreground relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg border py-0.5 pr-2 pl-1.5 text-[11px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
                                    >
                                      <RotateCcw className="size-3.5" />
                                      <span>Retry</span>
                                    </button>
                                  )}
                                </div>
                              )
                            })()}
                            {renderAssistantFooter ? renderAssistantFooter(msg) : null}
                          </div>
                        )}
                      </MessageScrollerItem>
                    )
                  })}
                  {isPendingFirstChunk && (
                    <MessageScrollerItem key="pending-assistant-turn">
                      <div className="mb-4 text-sm leading-relaxed">
                        <LoadingStatus text={statusText ?? "Working on your request"} showElapsed />
                      </div>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        )}

        <form onSubmit={handleSubmit} className="flex items-start gap-2 border-t p-3">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onInput={(e) => {
              e.currentTarget.style.height = "auto"
              e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 128)}px`
            }}
            name="message"
            placeholder={placeholder}
            autoComplete="off"
            disabled={isBusy}
            rows={1}
            className="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 dark:bg-input/30 dark:disabled:bg-input/80 h-9 max-h-24 min-h-9 w-full min-w-0 resize-none rounded-lg border bg-transparent px-3 py-1.5 text-base transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
          />
          {isBusy ? (
            <Button
              type="button"
              size="icon-lg"
              variant="outline"
              onClick={(e) => {
                e.preventDefault()
                stop()
              }}
            >
              <Square className="size-4" />
            </Button>
          ) : (
            <Button type="submit" size="icon-lg" disabled={!draft.trim()}>
              <Send className="size-4" />
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
