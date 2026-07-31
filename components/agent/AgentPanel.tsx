"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import type { ChatStatus, UIDataTypes, UIMessage, UIMessagePart, UITools } from "ai"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, Bot, Square } from "lucide-react"
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

export interface AgentPanelProps {
  messages: UIMessage[]
  status: ChatStatus
  error?: Error | undefined
  sendMessage: (message: { text: string }) => Promise<void>
  stop: () => void
  regenerate: () => Promise<void>
  renderToolCall?: (part: UIMessagePart<UIDataTypes, UITools> & { type: "dynamic-tool" }) => ReactNode
  placeholder?: string
  emptyTitle?: string
  emptyHint?: string
  className?: string
}

function getAgentStatus(
  status: ChatStatus,
  lastMsg: UIMessage | undefined,
): string | null {
  if (status === "submitted") return "Waiting for the agent..."
  if (status !== "streaming") return null
  if (!lastMsg || lastMsg.role !== "assistant") return null

  for (let i = lastMsg.parts.length - 1; i >= 0; i--) {
    const part = lastMsg.parts[i]
    switch (part.type) {
      case "text":
        if (part.state === "streaming") return null
        break
      case "reasoning":
        if (part.state === "streaming") return "Analyzing your query..."
        break
      case "dynamic-tool":
        if (part.state === "input-streaming") return "Planning the query..."
        if (part.state === "input-available") return `Running ${part.toolName}...`
        if (part.state === "output-available") return "Compiling results..."
        if (part.state === "output-error") return null
        break
    }
  }
  return lastMsg.parts.length > 0 ? "Thinking..." : null
}

export default function AgentPanel({
  messages,
  status,
  error,
  sendMessage,
  stop,
  regenerate,
  renderToolCall,
  placeholder = "Ask about the data...",
  emptyTitle = "Ask the agent about the data",
  emptyHint = 'Try "What were our biggest expenses?" or "Show me income by department"',
  className,
}: AgentPanelProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isBusy = status === "submitted" || status === "streaming"

  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [input])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isBusy) return

    const msg = input.trim()
    if (!msg) return
    setInput("")
    sendMessage({ text: msg })
  }

  function renderPart(
    part: UIMessagePart<UIDataTypes, UITools>,
    i: number,
    isAssistant: boolean,
    isStreaming: boolean,
    isLastText: boolean,
  ) {
    switch (part.type) {
      case "text":
        return (
          <TextRenderer
            key={i}
            part={part}
            isAssistant={isAssistant}
            isStreaming={isStreaming}
            isLastText={isLastText}
          />
        )
      case "reasoning":
        return <ReasoningRenderer key={i} part={part} />
      case "dynamic-tool":
        return renderToolCall ? (
          <div key={i}>{renderToolCall(part)}</div>
        ) : (
          <ToolCallRenderer key={i} part={part} />
        )
      default:
        return null
    }
  }

  const lastAssistantMsg =
    messages[messages.length - 1]?.role === "assistant"
      ? messages[messages.length - 1]
      : undefined
  const isStreamingLastMsg = isBusy && lastAssistantMsg !== undefined
  const statusText = isBusy ? getAgentStatus(status, lastAssistantMsg) : null

  return (
    <Card size="sm" className={`flex h-full min-h-0 flex-col pb-0 ${className ?? ""}`}>
      <CardHeader>
        <CardTitle>Agent Chat</CardTitle>
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
          <div className="text-muted-foreground flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <Bot className="text-muted-foreground size-8" />
            <p className="text-sm font-medium">{emptyTitle}</p>
            <p className="max-w-[240px] text-xs">{emptyHint}</p>
          </div>
        ) : (
          <MessageScrollerProvider autoScroll scrollPreviousItemPeek={64}>
            <MessageScroller className="flex-1">
              <MessageScrollerViewport>
                <MessageScrollerContent className="px-3 pb-3">
                  {messages.map((msg) => {
                    const lastTextIndex = msg.parts.reduce(
                      (last, p, idx) => (p.type === "text" ? idx : last),
                      -1,
                    )
                    const isLastMsg = msg.id === messages[messages.length - 1]?.id
                    const isStreamingMsg = msg.role === "assistant" && isBusy && isLastMsg

                    return (
                      <MessageScrollerItem
                        key={msg.id}
                        messageId={msg.id}
                        scrollAnchor={msg.role === "user"}
                      >
                        {msg.role === "user" ? (
                          <div className="flex justify-end">
                            <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2.5 text-sm leading-relaxed">
                              {msg.parts.map((part, i) =>
                                renderPart(part, i, false, false, i === msg.parts.length - 1),
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm leading-relaxed">
                            {msg.parts.map((part, i) =>
                              renderPart(part, i, true, isStreamingMsg, i === lastTextIndex),
                            )}
                            {isStreamingMsg && statusText && (
                              <div className="mt-2">
                                <LoadingStatus text={statusText} />
                              </div>
                            )}
                          </div>
                        )}
                      </MessageScrollerItem>
                    )
                  })}
                  {statusText && !isStreamingLastMsg && (
                    <MessageScrollerItem>
                      <div className="text-sm leading-relaxed">
                        <LoadingStatus text={statusText} />
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={(e) => {
              e.currentTarget.style.height = "auto"
              e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 128)}px`
            }}
            placeholder={placeholder}
            disabled={isBusy}
            rows={1}
            className="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 dark:bg-input/30 dark:disabled:bg-input/80 h-9 min-h-9 max-h-24 w-full min-w-0 resize-none rounded-lg border bg-transparent px-3 py-1.5 text-base transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
            <Button type="submit" size="icon-lg" disabled={!input.trim()}>
              <Send className="size-4" />
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
