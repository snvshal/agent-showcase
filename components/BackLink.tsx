import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export default function BackLink({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      aria-label="Back to showcase"
      className={cn(
        "text-muted-foreground hover:text-foreground hover:bg-muted flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
        className,
      )}
    >
      <ArrowLeft className="size-4" />
    </Link>
  )
}
