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

interface LoadingStatusProps {
  icon?: ReactNode
  text: string
}

export default function LoadingStatus({ icon, text }: LoadingStatusProps) {
  return (
    <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
      {icon ?? <BrailleSpinner />}
      <span className={shimmerTextClass}>{text}</span>
    </div>
  )
}
