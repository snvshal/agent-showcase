import { Receipt } from "lucide-react";
import DataTable from "@/components/DataTable";
import AgentPanel from "@/components/AgentPanel";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b px-6 py-3 flex items-center gap-3 shrink-0">
        <div className="text-lg font-semibold tracking-tight">
          <Receipt className="size-5 inline-block align-text-bottom" /> Financial Transactions
        </div>
        <div className="text-xs text-muted-foreground">
          AI Agent Showcase — powered by Eve + Next.js
        </div>
      </header>

      <main className="flex flex-1 gap-0 overflow-hidden">
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
