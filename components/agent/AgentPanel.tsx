"use client"

import { useState, useEffect, useMemo, type ReactNode } from "react"
import { useEveAgent } from "eve/react"
import type { EveMessageData, EveMessagePart } from "eve/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Loader2, Bot, Square } from "lucide-react"
import { Marker, MarkerIcon, MarkerContent } from "@/components/ui/marker"
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
const rawToolCallRe = /^(\w+)(\{[\s\S]*\})\1$/

function extractInputRequest(part: EveMessagePart): {
  requestId: string
  prompt: string
  options?: readonly { id: string; label: string; style?: string }[]
  allowFreeform?: boolean
} | null {
  if (part.type === "dynamic-tool" && part.toolMetadata?.eve?.inputRequest) {
    const req = part.toolMetadata.eve.inputRequest
    return {
      requestId: req.requestId,
      prompt: req.prompt,
      options: req.options,
      allowFreeform: req.allowFreeform ?? true,
    }
  }
  if (part.type === "text") {
    const match = part.text.match(rawToolCallRe)
    if (match) {
      try {
        const parsed = JSON.parse(match[2])
        if (parsed.prompt && parsed.requestId) {
          return {
            requestId: parsed.requestId,
            prompt: parsed.prompt,
            options: parsed.options,
            allowFreeform: parsed.allowFreeform ?? true,
          }
        }
      } catch {}
    }
  }
  return null
}

function findPendingInput(messages: EveMessageData["messages"]): {
  requestId: string
  prompt: string
  options?: readonly { id: string; label: string; style?: string }[]
  allowFreeform?: boolean
} | null {
  if (messages.length === 0) return null
  const lastMsg = messages[messages.length - 1]
  if (lastMsg.role !== "assistant") return null
  for (const part of lastMsg.parts) {
    const req = extractInputRequest(part)
    if (req) return req
  }
  return null
}

export interface AgentPanelProps {
  instructionsKey?: string
  renderToolCall?: (part: EveMessagePart & { type: "dynamic-tool" }) => ReactNode
  placeholder?: string
  emptyTitle?: string
  emptyHint?: string
  className?: string
}

const loadingMessages = [
  "Understanding your query...",
  "Analyzing financial data...",
  "Searching transactions...",
  "Compiling results...",
]

export default function AgentPanel({
  renderToolCall,
  placeholder = "Ask about the data...",
  emptyTitle = "Ask the agent about the data",
  emptyHint = 'Try "What were our biggest expenses?" or "Show me income by department"',
  className,
}: AgentPanelProps) {
  const agent = useEveAgent()
  const [input, setInput] = useState("")
  const [msgTick, setMsgTick] = useState(0)
  const pendingInput = useMemo(() => findPendingInput(agent.data.messages), [agent.data.messages])

  const isBusy = agent.status === "submitted" || agent.status === "streaming"

  useEffect(() => {
    if (!isBusy) return
    const interval = setInterval(() => {
      setMsgTick((t) => t + 1)
    }, 2500)
    return () => {
      clearInterval(interval)
      setMsgTick(0)
    }
  }, [isBusy])

  const msgIndex = isBusy ? msgTick % loadingMessages.length : 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isBusy) return

    if (pendingInput) {
      const inputResponse: { requestId: string; text?: string; optionId?: string } = {
        requestId: pendingInput.requestId,
      }
      if (input.trim()) {
        inputResponse.text = input.trim()
      }
      if (!inputResponse.text && !inputResponse.optionId) return
      setInput("")
      agent.send({ inputResponses: [inputResponse] })
      return
    }

    const msg = input.trim()
    if (!msg) return
    setInput("")
    agent.send({ message: msg })
  }

  function renderPart(
    part: EveMessagePart,
    i: number,
    isAssistant: boolean,
    isStreaming: boolean,
    isLastText: boolean,
  ) {
    if (extractInputRequest(part)) {
      return null
    }
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

  const showBusy = isBusy && agent.data.messages[agent.data.messages.length - 1]?.role === "user"

  return (
    <Card size="sm" className={`flex h-full min-h-0 flex-col ${className ?? ""}`}>
      <CardHeader>
        <CardTitle>Agent Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        {agent.status === "error" && agent.error && (
          <div className="mx-3 mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
            {agent.error.message ?? String(agent.error)}
          </div>
        )}
        {agent.data.messages.length === 0 ? (
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
                  {agent.data.messages.map((msg) => {
                    const lastTextIndex = msg.parts.reduce(
                      (last, p, idx) => (p.type === "text" ? idx : last),
                      -1,
                    )
                      const isStreamingMsg =
                            msg.role === "assistant" && msg.metadata?.status === "streaming"
                          const hasVisibleParts = msg.parts.some((p) => p.type !== "step-start")
                          const isLastMsg = msg.id === agent.data.messages[agent.data.messages.length - 1]?.id

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
                            {!hasVisibleParts && isBusy && isStreamingMsg && isLastMsg ? (
                              <LoadingStatus text={loadingMessages[msgIndex]} />
                            ) : (
                              <>
                                {msg.parts.map((part, i) =>
                                  renderPart(part, i, true, isStreamingMsg, i === lastTextIndex),
                                )}
                                {isBusy && isStreamingMsg && isLastMsg && !msg.parts.some((p) => p.type === "text") && (
                                  <div className="mt-2">
                                    <LoadingStatus text="Thinking..." />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </MessageScrollerItem>
                    )
                  })}

                  {showBusy && (
                    <MessageScrollerItem>
                      <Marker role="status">
                        <MarkerIcon>
                          <Loader2 className="size-4 animate-spin" />
                        </MarkerIcon>
                        <MarkerContent className="from-muted-foreground via-foreground to-muted-foreground animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r bg-[length:200%_100%] bg-clip-text text-sm text-transparent">
                          {loadingMessages[msgIndex]}
                        </MarkerContent>
                      </Marker>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        )}

        {pendingInput && !isBusy ? (
          <div className="flex flex-col gap-2 border-t p-3">
            <p className="text-sm font-medium">{pendingInput.prompt}</p>
            {pendingInput.options && pendingInput.options.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pendingInput.options.map((opt) => {
                  const optVariant =
                    opt.style === "primary"
                      ? "default"
                      : opt.style === "danger"
                        ? "destructive"
                        : "outline"
                  return (
                    <Button
                      key={opt.id}
                      variant={optVariant}
                      size="sm"
                      onClick={() => {
                        agent.send({
                          inputResponses: [{ requestId: pendingInput.requestId, optionId: opt.id }],
                        })
                      }}
                    >
                      {opt.label}
                    </Button>
                  )
                })}
              </div>
            )}
            {pendingInput.allowFreeform && (
              <form
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault()
                  const text = input.trim()
                  if (!text) return
                  setInput("")
                  agent.send({
                    inputResponses: [{ requestId: pendingInput.requestId, text }],
                  })
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!input.trim()}>
                  <Send className="size-4" />
                </Button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              disabled={isBusy}
              className="flex-1"
            />
            {isBusy ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  agent.stop()
                }}
              >
                <Square className="size-4" />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="size-4" />
              </Button>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  )
}
