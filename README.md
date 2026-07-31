# agent-showcase

A collection of AI agent demonstrations built with [Next.js](https://nextjs.org), the [Vercel AI SDK](https://ai-sdk.dev), [shadcn/ui](https://ui.shadcn.com), and [Bun](https://bun.sh).

Each showcase features a different agent use case with real tool calling, streaming responses, and a polished UI.

## Showcases

### Financial Transactions Agent

A read-only financial data analyst agent. Browse income/expense transactions in a sortable table and ask natural-language questions about the data.

- **Tool**: Single `search_transactions` tool with parameterized filters (type, category, department, amount range, date range, group-by, sort)
- **Data**: 80+ seeded transactions stored as JSON, auto-seeded on first access
- **UI**: Side-by-side layout (data table + agent chat), responsive tabs on mobile
- **Features**: Streaming responses, visible tool calls with reasoning, shimmer loading status

## Tech Stack

| Tool                                           | Purpose                   |
| ---------------------------------------------- | ------------------------- |
| [Bun](https://bun.sh)                          | Runtime & package manager |
| [Next.js 16](https://nextjs.org)               | React framework           |
| [Vercel AI SDK](https://ai-sdk.dev)            | Agent runtime & streaming  |
| [shadcn/ui](https://ui.shadcn.com) (base-nova) | UI components             |
| [Tailwind CSS v4](https://tailwindcss.com)     | Styling                   |
| [lucide-react](https://lucide.dev)             | Icons                     |

## Getting Started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding a Showcase

Each showcase lives in its own directory under `app/` with corresponding agent tools under `agent/`. See the Financial Transactions showcase as a reference pattern.
