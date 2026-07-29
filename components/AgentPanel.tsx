"use client"

import { useRef, useEffect, useState } from "react"
import { useEveAgent } from "eve/react"
import type { EveMessagePart } from "eve/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send, Loader2, Bot, BrainCircuit, CheckCircle, XCircle, User, Wrench } from "lucide-react"

const loadingMessages = [
  "Understanding your query...",
  "Analyzing financial data...",
  "Searching transactions...",
  "Compiling results...",
]

export default function AgentPanel() {
  const agent = useEveAgent()
  const [input, setInput] = useState("")
  const [msgIndex, setMsgIndex] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isBusy = agent.status === "submitted" || agent.status === "streaming"

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [agent.data.messages])

  useEffect(() => {
    if (!isBusy) {
      setMsgIndex(0)
      return
    }
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % loadingMessages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isBusy])

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
          <span key={i} className="whitespace-pre-wrap">
            {part.text}
            {isAssistant && isLastText && isStreaming && (
              <span className="bg-foreground/50 ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm align-text-bottom" />
            )}
          </span>
        )

      case "reasoning":
        return (
          <details key={i} className="text-muted-foreground mt-1 text-xs">
            <summary className="hover:text-foreground cursor-pointer text-[11px] italic opacity-70">
              <BrainCircuit className="mr-1 inline size-3" /> Agent thinking
            </summary>
            <div className="border-muted-foreground/30 mt-1 border-l-2 pl-2 whitespace-pre-wrap italic">
              {part.text || "(thinking...)"}
            </div>
          </details>
        )

      case "dynamic-tool": {
        const isInput = part.state === "input-streaming" || part.state === "input-available"
        const isOutput = part.state === "output-available"
        const isError = part.state === "output-error"
        const isApproval =
          part.state === "approval-requested" ||
          part.state === "approval-responded" ||
          part.state === "output-denied"

        return (
          <div
            key={i}
            className={`my-1.5 rounded-lg border p-2 font-mono text-xs ${
              isOutput
                ? "bg-green-50/50 dark:bg-green-950/20"
                : isError
                  ? "bg-red-50/50 dark:bg-red-950/20"
                  : isApproval
                    ? "bg-yellow-50/50 dark:bg-yellow-950/20"
                    : "bg-background/50"
            }`}
          >
            <div className="text-foreground mb-1 flex items-center gap-1.5">
              <span>
                {isOutput ? (
                  <CheckCircle className="size-3.5 text-green-600" />
                ) : isError ? (
                  <XCircle className="size-3.5 text-red-600" />
                ) : isApproval ? (
                  <User className="size-3.5 text-yellow-600" />
                ) : (
                  <Wrench className="size-3.5" />
                )}
              </span>
              <span className="font-semibold">{part.toolName}</span>
              <Badge variant="outline" className="h-4 px-1 text-[10px]">
                {part.state}
              </Badge>
            </div>
            {isInput && part.input !== undefined && (
              <pre className="text-muted-foreground overflow-x-auto text-[11px] whitespace-pre-wrap">
                {JSON.stringify(part.input, null, 1)}
              </pre>
            )}
            {isOutput && part.output !== undefined && (
              <pre className="text-muted-foreground max-h-[150px] overflow-x-auto text-[11px] whitespace-pre-wrap">
                {(typeof part.output === "string"
                  ? part.output
                  : JSON.stringify(part.output, null, 1)
                ).slice(0, 500)}
              </pre>
            )}
            {isError && (
              <pre className="overflow-x-auto text-[11px] whitespace-pre-wrap text-red-500">
                {part.errorText}
              </pre>
            )}
          </div>
        )
      }

      case "step-start":
        return (
          <div key={i} className="border-muted-foreground/20 my-1 h-1 border-t border-dashed" />
        )

      default:
        return null
    }
  }

  return (
    <Card size="sm" className="flex h-full min-h-0 flex-col">
      <CardHeader>
        <CardTitle>Agent Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
          {agent.data.messages.length === 0 ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 py-12 text-center">
              <Bot className="text-muted-foreground size-8" />
              <p className="text-sm font-medium">Ask the agent about the financial data</p>
              <p className="max-w-[240px] text-xs">
                Try &ldquo;What were our biggest expenses?&rdquo; or &ldquo;Show me income by
                department&rdquo;
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {agent.data.messages.map((msg) => {
                const lastTextIndex = msg.parts.reduce(
                  (last, p, idx) => (p.type === "text" ? idx : last),
                  -1,
                )
                const isStreamingMsg =
                  msg.role === "assistant" && msg.metadata?.status === "streaming"

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {msg.parts.length === 0 && isStreamingMsg && (
                        <div className="flex gap-1">
                          <span className="bg-foreground/50 h-1.5 w-1.5 animate-bounce rounded-full" />
                          <span className="bg-foreground/50 h-1.5 w-1.5 animate-bounce rounded-full delay-100" />
                          <span className="bg-foreground/50 h-1.5 w-1.5 animate-bounce rounded-full delay-200" />
                        </div>
                      )}
                      {msg.parts.map((part, i) =>
                        renderPart(
                          part,
                          i,
                          msg.role === "assistant",
                          isStreamingMsg,
                          i === lastTextIndex,
                        ),
                      )}
                    </div>
                    <span className="text-muted-foreground px-1 text-[10px]">
                      {msg.role === "user" ? "You" : "Agent"}
                    </span>
                  </div>
                )
              })}

              {isBusy &&
                agent.data.messages.length > 0 &&
                agent.data.messages[agent.data.messages.length - 1]?.role === "user" && (
                  <div className="flex items-center gap-2.5 px-1 py-1.5">
                    <Loader2 className="text-muted-foreground size-3.5 shrink-0 animate-spin" />
                    <span className="from-muted-foreground via-foreground to-muted-foreground animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r bg-[length:200%_100%] bg-clip-text text-sm text-transparent">
                      {loadingMessages[msgIndex]}
                    </span>
                  </div>
                )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the financial data..."
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
