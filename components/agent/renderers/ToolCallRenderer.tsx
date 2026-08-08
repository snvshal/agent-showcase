"use client"

import type { ReactNode } from "react"
import type { UIDataTypes, UIMessagePart, UITools } from "ai"
import { CheckCircle, XCircle, ChevronDown, Loader2 } from "lucide-react"
import { ABORT_ERROR } from "@/components/agent/finalizeAbortedParts"

export interface ToolCallRendererProps {
  part: UIMessagePart<UIDataTypes, UITools> & { type: "dynamic-tool" }
}

export default function ToolCallRenderer({ part }: ToolCallRendererProps) {
  const isInput = part.state === "input-available"
  const isOutput = part.state === "output-available"
  const isError = part.state === "output-error"
  const isStreaming = part.state === "input-streaming"
  const isLoading = isStreaming || isInput
  const hasBody = (isInput && part.input !== undefined) || isOutput || isError

  if (isLoading) {
    return (
      <details className="group my-3">
        <summary className="text-muted-foreground flex cursor-pointer list-none items-center gap-1.5 text-sm [&::-webkit-details-marker]:hidden">
          <Loader2 className="size-3.5 animate-spin" />
          <span>{part.toolName}</span>
          {hasBody ? (
            <ChevronDown className="ml-auto inline-block size-4 transition-transform group-open:rotate-180" />
          ) : null}
        </summary>
        {hasBody ? (
          <div className="bg-background/50 mt-1.5 rounded-lg border p-2 font-mono text-sm group-open:animate-[slide-down_200ms_ease-out]">
            <pre className="text-muted-foreground max-h-[200px] overflow-x-auto whitespace-pre-wrap">
              {part.input !== undefined
                ? (typeof part.input === "string"
                    ? part.input
                    : JSON.stringify(part.input, null, 1)
                  ).slice(0, 2000)
                : ""}
            </pre>
          </div>
        ) : null}
      </details>
    )
  }

  const icon: ReactNode = isOutput ? (
    <CheckCircle className="size-3.5" />
  ) : (
    <XCircle className="size-3.5" />
  )

  const isStopped = isError && part.errorText === ABORT_ERROR
  const label = isOutput
    ? `Queried ${part.toolName}`
    : isStopped
      ? `${part.toolName} stopped`
      : `${part.toolName} failed`

  const body = hasBody ? (
    <div className="bg-background/50 mt-1.5 rounded-lg border p-2 font-mono text-sm group-open:animate-[slide-down_200ms_ease-out]">
      {isError ? (
        <pre
          className={`overflow-x-auto whitespace-pre-wrap ${
            isStopped ? "text-muted-foreground" : "text-red-500"
          }`}
        >
          {part.errorText}
        </pre>
      ) : (
        <pre className="text-muted-foreground max-h-[200px] overflow-x-auto whitespace-pre-wrap">
          {part.output !== undefined
            ? (typeof part.output === "string"
                ? part.output
                : JSON.stringify(part.output, null, 1)
              ).slice(0, 2000)
            : ""}
        </pre>
      )}
    </div>
  ) : null

  return (
    <details className="group my-3" open={hasBody}>
      <summary className="text-muted-foreground flex cursor-pointer list-none items-center gap-1.5 text-sm [&::-webkit-details-marker]:hidden">
        <span>{icon}</span>
        <span>{label}</span>
        {hasBody ? (
          <ChevronDown className="ml-auto inline-block size-4 transition-transform group-open:rotate-180" />
        ) : null}
      </summary>
      {body}
    </details>
  )
}
