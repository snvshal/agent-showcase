import Link from "next/link"
import { ArrowRight, Bot } from "lucide-react"
import { SHOWCASES } from "@/lib/showcases"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Bot className="size-5" />
          Agent Showcase
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16">
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">AI Agent Showcase</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            A collection of AI agent demonstrations — pick one to open an interactive chat.
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          {SHOWCASES.map((showcase) => {
            const Icon = showcase.icon
            return (
              <Link
                key={showcase.href}
                href={showcase.href}
                className="group outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-xl"
              >
                <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:ring-foreground/20 group-focus-visible:ring-foreground/30">
                  <CardHeader>
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg ${showcase.accent}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <CardTitle>{showcase.title}</CardTitle>
                    <CardDescription>{showcase.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <span className="flex items-center gap-1 text-sm font-medium">
                      Open showcase
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            )
          })}
        </section>
      </main>
    </div>
  )
}
