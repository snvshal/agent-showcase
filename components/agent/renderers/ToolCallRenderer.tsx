"use client"

import { useEffect, useRef, type ReactNode } from "react"
import type { DynamicToolUIPart, ToolUIPart, UITools } from "ai"
import { getToolOrDynamicToolName } from "ai"
import { CheckCircle, XCircle, ChevronDown, CircleDashed } from "lucide-react"
import { ABORT_ERROR } from "@/components/agent/finalizeAbortedParts"
import { toolDisplayName } from "@/components/agent/toolLabels"

export interface ToolCallRendererProps {
  part: ToolUIPart<UITools> | DynamicToolUIPart
}

function formatValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value, null, 1)
}

export default function ToolCallRenderer({ part }: ToolCallRendererProps) {
  const toolName = getToolOrDynamicToolName(part)
  const displayName = toolDisplayName(toolName)
  const loadingBodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = loadingBodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [part.input])

  const isInput = part.state === "input-available"
  const isOutput = part.state === "output-available"
  const isError = part.state === "output-error"
  const isStreaming = part.state === "input-streaming"
  const isLoading = isStreaming || isInput
  const hasBody = (isInput && part.input !== undefined) || isOutput || isError

  if (isLoading) {
    return (
      <details className="group my-3" open>
        <summary className="text-muted-foreground flex cursor-pointer list-none items-center gap-1.5 text-sm [&::-webkit-details-marker]:hidden">
          <CircleDashed className="size-3.5" />
          <span>Running {displayName}...</span>
          {hasBody ? (
            <ChevronDown className="ml-auto inline-block size-4 transition-transform group-open:rotate-180" />
          ) : null}
        </summary>
        {hasBody ? (
          <div
            ref={loadingBodyRef}
            className="bg-background/50 mt-1.5 rounded-lg border p-2 font-mono text-sm"
          >
            <pre className="text-muted-foreground max-h-[200px] overflow-x-auto whitespace-pre-wrap">
              {part.input !== undefined ? formatValue(part.input).slice(0, 2000) : ""}
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
    ? `${displayName} completed`
    : isStopped
      ? `${displayName} stopped`
      : `${displayName} failed`

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
          {part.output !== undefined ? formatValue(part.output).slice(0, 2000) : ""}
        </pre>
      )}
    </div>
  ) : null

  return (
    <details className="group my-3">
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
