import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { SHOWCASES } from "@/lib/showcases"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border/70 border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="lava-text font-jetbrains text-lg font-bold tracking-tight transition-opacity hover:opacity-90 sm:text-xl"
          >
            agents.
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pt-16 pb-20 sm:px-8 sm:pt-24">
        <section className="mb-16 max-w-2xl sm:mb-20">
          <p className="text-primary mb-5 text-xs font-semibold tracking-[0.16em] uppercase">
            A collection of practical AI
          </p>
          <h1 className="text-5xl leading-[1.08] font-semibold tracking-[-0.05em] text-pretty sm:text-6xl">
            Useful agents.
            <br />
            <span className="text-muted-foreground">Real work, made easier.</span>
          </h1>
          <p className="text-muted-foreground mt-6 max-w-xl text-base leading-7 text-pretty sm:text-lg">
            Explore focused demos for everyday tasks, from analyzing data to creating documents and
            designs.
          </p>
        </section>

        <section aria-labelledby="showcases-heading">
          <div className="border-border mb-5 flex items-baseline justify-between border-b pb-3 sm:mb-6">
            <h2 id="showcases-heading" className="text-sm font-semibold tracking-tight">
              Explore the showcases
            </h2>
            <span className="text-muted-foreground text-xs">{SHOWCASES.length} demos</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {SHOWCASES.map((showcase) => {
              const Icon = showcase.icon

              return (
                <Link
                  key={showcase.href}
                  href={showcase.href}
                  className="group focus-visible:ring-ring rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
                >
                  <Card className="border-border/80 bg-card group-hover:border-primary/35 group-hover:bg-muted/40 h-full rounded-2xl border shadow-none transition-colors">
                    <CardHeader className="gap-5 p-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <span className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-xl">
                          <Icon className="size-[18px]" strokeWidth={1.8} />
                        </span>
                        <ArrowUpRight className="text-muted-foreground group-hover:text-primary size-4 transition-colors" />
                      </div>
                      <div className="grid gap-2">
                        <CardTitle className="text-base font-semibold tracking-tight">
                          {showcase.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-6 text-pretty">
                          {showcase.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      </main>

      <footer
        aria-hidden="true"
        className="relative mt-12 h-[clamp(8rem,22vw,15rem)] overflow-hidden"
      >
        <div className="relative h-full">
          <p className="absolute inset-x-0 bottom-0 translate-y-[10%] text-center text-[clamp(3.5rem,22vw,18rem)] leading-[0.8] font-semibold tracking-[0.02em] whitespace-nowrap text-transparent select-none [-webkit-text-stroke:1.5px_color-mix(in_oklab,var(--foreground)_32%,transparent)]">
            AGENTS
          </p>
          <p
            className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-[10%] text-center text-[clamp(3.5rem,22vw,18rem)] leading-[0.8] font-semibold tracking-[0.02em] whitespace-nowrap text-transparent opacity-70 blur-[1.5px] select-none [-webkit-text-stroke:3px_rgba(56,72,120,0.5)] dark:opacity-80 dark:blur-[2px] dark:[-webkit-text-stroke:4px_rgba(0,0,0,0.8)]"
            style={{
              maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
            }}
          >
            AGENTS
          </p>
        </div>
      </footer>
    </div>
  )
}
