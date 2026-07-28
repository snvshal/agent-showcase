"use client";

import { useRef, useEffect, useState } from "react";
import { useEveAgent } from "eve/react";
import type { EveMessagePart } from "eve/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Bot, BrainCircuit, CheckCircle, XCircle, User, Wrench } from "lucide-react";

const loadingMessages = [
  "Understanding your query...",
  "Analyzing financial data...",
  "Searching transactions...",
  "Compiling results...",
];

export default function AgentPanel() {
  const agent = useEveAgent();
  const [input, setInput] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isBusy = agent.status === "submitted" || agent.status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agent.data.messages]);

  useEffect(() => {
    if (!isBusy) {
      setMsgIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isBusy]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || isBusy) return;
    setInput("");
    agent.send({ message: msg });
  }

  function renderPart(part: EveMessagePart, i: number, isAssistant: boolean, isStreaming: boolean, isLastText: boolean) {
    switch (part.type) {
      case "text":
        return (
          <span key={i} className="whitespace-pre-wrap">
            {part.text}
            {isAssistant && isLastText && isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-foreground/50 animate-pulse ml-0.5 rounded-sm align-text-bottom" />
            )}
          </span>
        );

      case "reasoning":
        return (
          <details key={i} className="mt-1 text-xs text-muted-foreground">
            <summary className="cursor-pointer italic hover:text-foreground text-[11px] opacity-70">
              <BrainCircuit className="size-3 inline mr-1" /> Agent thinking
            </summary>
            <div className="mt-1 pl-2 border-l-2 border-muted-foreground/30 italic whitespace-pre-wrap">
              {part.text || "(thinking...)"}
            </div>
          </details>
        );

      case "dynamic-tool": {
        const isInput =
          part.state === "input-streaming" ||
          part.state === "input-available";
        const isOutput = part.state === "output-available";
        const isError = part.state === "output-error";
        const isApproval =
          part.state === "approval-requested" ||
          part.state === "approval-responded" ||
          part.state === "output-denied";

        return (
          <div
            key={i}
            className={`my-1.5 rounded-lg border p-2 text-xs font-mono ${
              isOutput
                ? "bg-green-50/50 dark:bg-green-950/20"
                : isError
                  ? "bg-red-50/50 dark:bg-red-950/20"
                  : isApproval
                    ? "bg-yellow-50/50 dark:bg-yellow-950/20"
                    : "bg-background/50"
            }`}
          >
            <div className="flex items-center gap-1.5 text-foreground mb-1">
              <span>
                {isOutput ? <CheckCircle className="size-3.5 text-green-600" /> : isError ? <XCircle className="size-3.5 text-red-600" /> : isApproval ? <User className="size-3.5 text-yellow-600" /> : <Wrench className="size-3.5" />}
              </span>
              <span className="font-semibold">{part.toolName}</span>
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                {part.state}
              </Badge>
            </div>
            {isInput && part.input !== undefined && (
              <pre className="text-[11px] text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(part.input, null, 1)}
              </pre>
            )}
            {isOutput && part.output !== undefined && (
              <pre className="text-[11px] text-muted-foreground overflow-x-auto whitespace-pre-wrap max-h-[150px]">
                {(typeof part.output === "string"
                  ? part.output
                  : JSON.stringify(part.output, null, 1)
                ).slice(0, 500)}
              </pre>
            )}
            {isError && (
              <pre className="text-[11px] text-red-500 overflow-x-auto whitespace-pre-wrap">
                {part.errorText}
              </pre>
            )}
          </div>
        );
      }

      case "step-start":
        return (
          <div key={i} className="h-1 border-t border-dashed border-muted-foreground/20 my-1" />
        );

      default:
        return null;
    }
  }

  return (
    <Card size="sm" className="flex flex-col h-full min-h-0">
      <CardHeader>
        <CardTitle>Agent Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0">
          {agent.data.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2 py-12">
              <Bot className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                Ask the agent about the financial data
              </p>
              <p className="text-xs max-w-[240px]">
                Try &ldquo;What were our biggest expenses?&rdquo; or &ldquo;Show
                me income by department&rdquo;
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {agent.data.messages.map((msg) => {
                const lastTextIndex = msg.parts.reduce(
                  (last, p, idx) => (p.type === "text" ? idx : last),
                  -1,
                );
                const isStreamingMsg =
                  msg.role === "assistant" &&
                  msg.metadata?.status === "streaming";

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1 ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.parts.length === 0 && isStreamingMsg && (
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce delay-100" />
                          <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce delay-200" />
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
                    <span className="text-[10px] text-muted-foreground px-1">
                      {msg.role === "user" ? "You" : "Agent"}
                    </span>
                  </div>
                );
              })}

              {isBusy &&
                agent.data.messages.length > 0 &&
                agent.data.messages[agent.data.messages.length - 1]
                  ?.role === "user" && (
                  <div className="flex items-center gap-2.5 px-1 py-1.5">
                    <Loader2 className="size-3.5 animate-spin text-muted-foreground shrink-0" />
                    <span className="text-sm bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmer_2.5s_ease-in-out_infinite]">
                      {loadingMessages[msgIndex]}
                    </span>
                  </div>
                )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t p-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the financial data..."
            disabled={isBusy}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isBusy || !input.trim()}
          >
            {isBusy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
    </CardContent>
  </Card>
);
}
