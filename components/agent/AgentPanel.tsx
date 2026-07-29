"use client"

import { useState, useEffect, type ReactNode } from "react"
import { useEveAgent } from "eve/react"
import type { EveMessagePart } from "eve/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Loader2, Bot } from "lucide-react"
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
import StepSeparator from "@/components/agent/renderers/StepSeparator"

const loadingMessages = [
  "Understanding your query...",
  "Analyzing financial data...",
  "Searching transactions...",
  "Compiling results...",
]

export interface AgentPanelProps {
  instructionsKey?: string
  renderToolCall?: (part: EveMessagePart & { type: "dynamic-tool" }) => ReactNode
  placeholder?: string
  emptyTitle?: string
  emptyHint?: string
  className?: string
}

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
    const msg = input.trim()
    if (!msg || isBusy) return
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
      case "step-start":
        return <StepSeparator key={i} />
      default:
        return null
    }
  }

  const showBusy =
    isBusy &&
    agent.data.messages.length > 0 &&
    agent.data.messages[agent.data.messages.length - 1]?.role === "user"

  return (
    <Card size="sm" className={`flex h-full min-h-0 flex-col ${className ?? ""}`}>
      <CardHeader>
        <CardTitle>Agent Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
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
                <MessageScrollerContent className="px-3">
                  {agent.data.messages.map((msg) => {
                    const lastTextIndex = msg.parts.reduce(
                      (last, p, idx) => (p.type === "text" ? idx : last),
                      -1,
                    )
                    const isStreamingMsg =
                      msg.role === "assistant" && msg.metadata?.status === "streaming"

                    return (
                      <MessageScrollerItem
                        key={msg.id}
                        messageId={msg.id}
                        scrollAnchor={msg.role === "user"}
                      >
                        {msg.role === "user" ? (
                          <div className="flex justify-end">
                            <div className="max-w-[80%] rounded-full bg-blue-600 px-4 py-2.5 text-sm leading-relaxed text-white dark:bg-blue-500">
                              {msg.parts.map((part, i) =>
                                renderPart(part, i, false, false, i === msg.parts.length - 1),
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm leading-relaxed">
                            {msg.parts.length === 0 && isStreamingMsg ? (
                              <div className="flex gap-1 px-1 py-2">
                                <span className="bg-foreground/50 h-1.5 w-1.5 animate-bounce rounded-full" />
                                <span className="bg-foreground/50 h-1.5 w-1.5 animate-bounce rounded-full delay-100" />
                                <span className="bg-foreground/50 h-1.5 w-1.5 animate-bounce rounded-full delay-200" />
                              </div>
                            ) : (
                              msg.parts.map((part, i) =>
                                renderPart(part, i, true, isStreamingMsg, i === lastTextIndex),
                              )
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

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isBusy}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isBusy || !input.trim()}>
            {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
