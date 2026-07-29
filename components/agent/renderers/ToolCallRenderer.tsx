"use client"

import type { ReactNode } from "react"
import type { EveMessagePart } from "eve/react"
import { CheckCircle, XCircle, User, Wrench } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface ToolCallRendererProps {
  part: EveMessagePart & { type: "dynamic-tool" }
}

export default function ToolCallRenderer({ part }: ToolCallRendererProps) {
  const isInput = part.state === "input-streaming" || part.state === "input-available"
  const isOutput = part.state === "output-available"
  const isError = part.state === "output-error"

  const icon: Record<string, ReactNode> = {
    "input-streaming": <Wrench className="size-3.5" />,
    "input-available": <Wrench className="size-3.5" />,
    "output-available": <CheckCircle className="size-3.5 text-green-600" />,
    "output-error": <XCircle className="size-3.5 text-red-600" />,
    "approval-requested": <User className="size-3.5 text-yellow-600" />,
    "approval-responded": <User className="size-3.5 text-yellow-600" />,
    "output-denied": <User className="size-3.5 text-yellow-600" />,
  }

  const bg: Record<string, string> = {
    "input-streaming": "bg-background/50",
    "input-available": "bg-background/50",
    "output-available": "bg-green-50/50 dark:bg-green-950/20",
    "output-error": "bg-red-50/50 dark:bg-red-950/20",
    "approval-requested": "bg-yellow-50/50 dark:bg-yellow-950/20",
    "approval-responded": "bg-yellow-50/50 dark:bg-yellow-950/20",
    "output-denied": "bg-yellow-50/50 dark:bg-yellow-950/20",
  }

  return (
    <div
      className={`my-1.5 rounded-lg border p-2 font-mono text-xs ${bg[part.state] ?? "bg-background/50"}`}
    >
      <div className="text-foreground mb-1 flex items-center gap-1.5">
        <span>{icon[part.state] ?? <Wrench className="size-3.5" />}</span>
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
