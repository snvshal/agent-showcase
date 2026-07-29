"use client"

import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"

interface LoadingStatusProps {
  icon?: ReactNode
  text: string
}

export default function LoadingStatus({ icon, text }: LoadingStatusProps) {
  return (
    <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
      {icon ?? <Loader2 className="size-3.5 animate-spin" />}
      <span className="from-muted-foreground via-foreground to-muted-foreground animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r bg-[length:200%_100%] bg-clip-text text-transparent text-sm">
        {text}
      </span>
    </div>
  )
}
