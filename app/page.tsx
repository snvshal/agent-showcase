"use client";

import { useState } from "react";
import { Receipt, Table2, Bot } from "lucide-react";
import DataTable from "@/components/DataTable";
import AgentPanel from "@/components/AgentPanel";

export default function Home() {
  const [tab, setTab] = useState<"data" | "agent">("data");

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b px-4 lg:px-6 py-3 flex flex-col lg:flex-row lg:items-center gap-0.5 lg:gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-base lg:text-lg font-semibold tracking-tight">
          <Receipt className="size-4 lg:size-5 shrink-0" />
          <span>Financial Transactions</span>
        </div>
        <div className="text-xs text-muted-foreground">
          AI Agent Showcase — powered by Eve + Next.js
        </div>
      </header>

      <div className="lg:hidden flex-1 flex flex-col min-h-0">
        <div className="flex border-b shrink-0">
          <button
            onClick={() => setTab("data")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "data" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Table2 className="size-4" />
            Transactions
          </button>
          <button
            onClick={() => setTab("agent")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === "agent" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Bot className="size-4" />
            Agent
          </button>
        </div>
        {tab === "data" ? (
          <div className="flex-1 p-4 flex flex-col min-h-0 overflow-hidden">
            <DataTable />
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-hidden">
            <AgentPanel />
          </div>
        )}
      </div>

      <main className="hidden lg:flex flex-1 gap-0 overflow-hidden">
        <section className="flex-1 p-4 flex flex-col min-w-0 min-h-0 overflow-hidden border-r">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Transactions
          </h2>
          <DataTable />
        </section>
        <section className="w-[420px] shrink-0 p-4 flex flex-col min-h-0 overflow-hidden">
          <AgentPanel />
        </section>
      </main>
    </div>
  );
}
