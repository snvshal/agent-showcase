"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Receipt, Table2, Bot } from "lucide-react"
import DataTable from "@/components/DataTable"
import AgentPanel from "@/components/agent/AgentPanel"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function Home() {
  const [tab, setTab] = useState<"data" | "agent">("data")
  const chat = useChat({
    transport: new DefaultChatTransport({
      api: "/api/agent",
      body: { agent: "financial" },
    }),
  })

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 flex-col border-b px-4 py-3 lg:flex-row lg:items-center lg:gap-3 lg:px-6">
        <div className="flex items-center gap-1.5 text-base font-semibold tracking-tight lg:text-lg">
          <Receipt className="size-4 shrink-0 lg:size-5" />
          <span>Financial Transactions</span>
          <div className="ml-auto lg:hidden">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex items-center gap-3 lg:flex-1">
          <div className="text-muted-foreground text-xs">
            AI Agent Showcase — powered by Next.js + AI SDK
          </div>
          <div className="hidden lg:ml-auto lg:block">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <div className="flex shrink-0 border-b">
          <button
            role="tab"
            aria-selected={tab === "data"}
            onClick={() => setTab("data")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "data"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Table2 className="size-4" />
            Transactions
          </button>
          <button
            role="tab"
            aria-selected={tab === "agent"}
            onClick={() => setTab("agent")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "agent"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Bot className="size-4" />
            Agent
          </button>
        </div>
        {tab === "data" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
            <DataTable />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-hidden">
            <AgentPanel
              messages={chat.messages}
              status={chat.status}
              error={chat.error}
              sendMessage={chat.sendMessage}
              stop={chat.stop}
              regenerate={chat.regenerate}
            />
          </div>
        )}
      </div>

      <main className="hidden flex-1 gap-0 overflow-hidden lg:flex">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-r p-4">
          <h2 className="text-muted-foreground mb-3 text-sm font-medium">Transactions</h2>
          <DataTable />
        </section>
        <section className="flex min-h-0 w-[420px] shrink-0 flex-col overflow-hidden p-4">
          <AgentPanel
            messages={chat.messages}
            status={chat.status}
            error={chat.error}
            sendMessage={chat.sendMessage}
            stop={chat.stop}
            regenerate={chat.regenerate}
          />
        </section>
      </main>
    </div>
  )
}
