"use client"

import { useState } from "react"
import { Receipt, Table2, Bot } from "lucide-react"
import DataTable from "@/components/DataTable"
import AgentPanel from "@/components/agent/AgentPanel"

export default function Home() {
  const [tab, setTab] = useState<"data" | "agent">("data")

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 flex-col gap-0.5 border-b px-4 py-3 lg:flex-row lg:items-center lg:gap-3 lg:px-6">
        <div className="flex items-center gap-1.5 text-base font-semibold tracking-tight lg:text-lg">
          <Receipt className="size-4 shrink-0 lg:size-5" />
          <span>Financial Transactions</span>
        </div>
        <div className="text-muted-foreground text-xs">
          AI Agent Showcase — powered by Eve + Next.js
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <div className="flex shrink-0 border-b">
          <button
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
            <AgentPanel />
          </div>
        )}
      </div>

      <main className="hidden flex-1 gap-0 overflow-hidden lg:flex">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-r p-4">
          <h2 className="text-muted-foreground mb-3 text-sm font-medium">Transactions</h2>
          <DataTable />
        </section>
        <section className="flex min-h-0 w-[420px] shrink-0 flex-col overflow-hidden p-4">
          <AgentPanel />
        </section>
      </main>
    </div>
  )
}
