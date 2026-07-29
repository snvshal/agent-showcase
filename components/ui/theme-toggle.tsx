"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

const themes = ["light", "dark", "system"] as const
const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}
const nextTheme: Record<string, (typeof themes)[number]> = {
  light: "dark",
  dark: "system",
  system: "light",
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const current = theme ?? "system"
  const Icon = icons[current as keyof typeof icons] ?? Sun
  const next = nextTheme[current] ?? "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      title={`Switch to ${next} mode`}
    >
      <Icon className="size-4" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
