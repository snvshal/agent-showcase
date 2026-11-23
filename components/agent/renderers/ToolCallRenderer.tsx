"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import type { DynamicToolUIPart, ToolUIPart, UITools } from "ai"
import { getToolOrDynamicToolName } from "ai"
import {
  CheckCircle2,
  Code2,
  ChevronDown,
  CircleDashed,
  FileText,
  Palette,
  Receipt,
  Search,
  SlidersHorizontal,
  StopCircle,
  Wrench,
  XCircle,
} from "lucide-react"
import { ABORT_ERROR } from "@/components/agent/finalizeAbortedParts"
import { toolDisplayName } from "@/components/agent/toolLabels"

export interface ToolCallRendererProps {
  part: ToolUIPart<UITools> | DynamicToolUIPart
  isResponseActive: boolean
}

function formatValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2)
}

function getToolIcon(toolName: string): ReactNode {
  switch (toolName) {
    case "search_web":
      return <Search className="size-3.5" />
    case "search_transactions":
      return <Receipt className="size-3.5" />
    case "calculate":
      return <SlidersHorizontal className="size-3.5" />
    case "generate_design":
      return <Palette className="size-3.5" />
    case "generate_pdf":
      return <FileText className="size-3.5" />
    case "generate_webpage":
      return <Code2 className="size-3.5" />
    default:
      return <Wrench className="size-3.5" />
  }
}

export default function ToolCallRenderer({ part, isResponseActive }: ToolCallRendererProps) {
  const toolName = getToolOrDynamicToolName(part)
  const displayName = toolDisplayName(toolName)
  const loadingBodyRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<"output" | "input">("output")

  useEffect(() => {
    const el = loadingBodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [part.input])

  const isInput = part.state === "input-available"
  const isOutput = part.state === "output-available"
  const isError = part.state === "output-error"
  const isStreaming = part.state === "input-streaming"
  const isPending = isStreaming || isInput
  const isStopped = (isError && part.errorText === ABORT_ERROR) || (!isResponseActive && isPending)
  const isLoading = isResponseActive && isPending
  const hasBody = (isInput && part.input !== undefined) || isOutput || isError || isStopped

  const webpageFilename =
    toolName === "generate_webpage" && isOutput && part.output && typeof part.output === "object"
      ? (part.output as { filename?: unknown }).filename
      : undefined
  const webpageReady = typeof webpageFilename === "string" ? webpageFilename : null

  const toolIcon = getToolIcon(toolName)

  if (isLoading) {
    return (
      <details
        className="group border-border/70 bg-muted/20 overflow-hidden rounded-lg border text-xs shadow-2xs"
        open
      >
        <summary className="hover:bg-muted/40 text-muted-foreground flex cursor-pointer list-none items-center justify-between px-3 py-2 transition-colors select-none [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex items-center justify-center">
              <CircleDashed className="size-3.5 animate-spin text-amber-500" />
            </span>
            <span className="text-foreground font-medium">Running {displayName}...</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              Executing
            </span>
            {hasBody && (
              <ChevronDown className="text-muted-foreground/60 size-3.5 transition-transform duration-200 group-open:rotate-180" />
            )}
          </div>
        </summary>

        {hasBody && (
          <div
            ref={loadingBodyRef}
            className="border-border/50 bg-background/50 border-t p-2.5 font-mono text-[11px]"
          >
            <div className="text-muted-foreground/80 mb-1 flex items-center gap-1 font-sans text-[10px] font-medium">
              Parameters:
            </div>
            <pre className="text-muted-foreground max-h-[160px] overflow-x-auto whitespace-pre-wrap">
              {part.input !== undefined ? formatValue(part.input).slice(0, 2000) : ""}
            </pre>
          </div>
        )}
      </details>
    )
  }

  return (
    <details className="group border-border/70 bg-muted/20 overflow-hidden rounded-lg border text-xs shadow-2xs">
      <summary className="hover:bg-muted/40 text-muted-foreground flex cursor-pointer list-none items-center justify-between px-3 py-2 transition-colors select-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground/80 flex items-center justify-center">
            {toolIcon}
          </span>
          <span className="text-foreground/90 font-medium">{displayName}</span>
        </div>

        <div className="flex items-center gap-2">
          {isOutput && (
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3" />
              Completed
            </span>
          )}
          {isStopped && (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              <StopCircle className="size-3" />
              Stopped
            </span>
          )}
          {isError && !isStopped && (
            <span className="inline-flex items-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">
              <XCircle className="size-3" />
              Failed
            </span>
          )}

          {hasBody && (
            <ChevronDown className="text-muted-foreground/60 size-3.5 transition-transform duration-200 group-open:rotate-180" />
          )}
        </div>
      </summary>

      {hasBody && (
        <div className="border-border/50 bg-background/50 border-t">
          <div className="border-border/40 bg-muted/40 flex items-center justify-between border-b px-2.5 py-1 text-[11px]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setActiveTab("output")
                }}
                className={`focus-visible:ring-ring rounded px-1.5 py-0.5 font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  activeTab === "output"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Output
              </button>
              {part.input !== undefined && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setActiveTab("input")
                  }}
                  className={`focus-visible:ring-ring rounded px-1.5 py-0.5 font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                    activeTab === "input"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Parameters
                </button>
              )}
            </div>
          </div>

          <div className="p-2.5 font-mono text-[11px] leading-relaxed">
            {activeTab === "input" ? (
              <pre className="text-muted-foreground max-h-[180px] overflow-x-auto whitespace-pre-wrap">
                {part.input !== undefined ? formatValue(part.input).slice(0, 2000) : "No input"}
              </pre>
            ) : isStopped ? (
              <pre className="text-muted-foreground max-h-[180px] overflow-x-auto whitespace-pre-wrap">
                {ABORT_ERROR}
              </pre>
            ) : isError ? (
              <pre
                className={`max-h-[180px] overflow-x-auto whitespace-pre-wrap ${
                  isStopped ? "text-muted-foreground" : "text-red-500 dark:text-red-400"
                }`}
              >
                {part.errorText}
              </pre>
            ) : webpageReady ? (
              <div className="text-foreground/80 flex items-center gap-2 font-sans">
                <Code2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="min-w-0 truncate">{webpageReady} is ready in the workspace.</span>
              </div>
            ) : (
              <pre className="text-foreground/80 max-h-[180px] overflow-x-auto whitespace-pre-wrap">
                {part.output !== undefined
                  ? formatValue(part.output).slice(0, 2000)
                  : "No output data"}
              </pre>
            )}
          </div>
        </div>
      )}
    </details>
  )
}
