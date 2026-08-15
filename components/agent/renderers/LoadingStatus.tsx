"use client"

import { useEffect, useState, type ReactNode } from "react"

export const shimmerTextClass =
  "from-muted-foreground via-foreground to-muted-foreground animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r bg-[length:200%_100%] bg-clip-text text-transparent text-sm"

const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

function BrailleSpinner() {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % spinnerFrames.length), 80)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="inline-block w-3.5 text-center font-mono leading-none" aria-hidden="true">
      {spinnerFrames[frame]}
    </span>
  )
}

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000)
  if (total < 60) return `${total}s`
  const minutes = Math.floor(total / 60)
  const seconds = String(total % 60).padStart(2, "0")
  return `${minutes}m ${seconds}s`
}

interface LoadingStatusProps {
  icon?: ReactNode
  text: string
  showElapsed?: boolean
}

export default function LoadingStatus({ icon, text, showElapsed = false }: LoadingStatusProps) {
  const [start] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!showElapsed) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [showElapsed])

  return (
    <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
      {icon ?? <BrailleSpinner />}
      <span className={shimmerTextClass}>{text}...</span>
      {showElapsed && (
        <span className="text-muted-foreground/60 font-mono text-xs tabular-nums">
          · {formatElapsed(now - start)}
        </span>
      )}
    </div>
  )
}
