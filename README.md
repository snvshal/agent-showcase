# agent-showcase

A collection of AI agent demonstrations built with [Next.js](https://nextjs.org), the [Vercel AI SDK](https://ai-sdk.dev), [shadcn/ui](https://ui.shadcn.com), and [Bun](https://bun.sh).

Each showcase features a different agent use case with real tool calling, streaming responses, and a polished UI.

## Showcases

The home page (`/`) is a hub that lists every showcase as a card. Each agent has its own page:

- **`/financial`** — Financial Transactions Agent
- **`/pdf`** — PDF Generator Agent

### Financial Transactions Agent

A read-only financial data analyst agent. Browse income/expense transactions in a sortable table and ask natural-language questions about the data.

- **Tool**: Single `search_transactions` tool with parameterized filters (type, category, department, amount range, date range, group-by, sort)
- **Data**: 80+ seeded transactions stored as JSON, auto-seeded on first access
- **UI**: Side-by-side layout (data table + agent chat), responsive tabs on mobile
- **Features**: Streaming responses, visible tool calls with reasoning, shimmer loading status

### PDF Generator Agent

Ask for any document — a resume, report, contract, or letter — and the agent drafts the content and renders it into a downloadable PDF file.

- **Tool**: Single `generate_pdf` tool taking a structured document spec (title, author, sections with paragraphs, bullets, and tables)
- **Rendering**: `@react-pdf/renderer` renders the spec to a styled A4 PDF, saved to `public/generated/`
- **UI**: Dedicated `/pdf` showcase with example prompts and a custom tool-call renderer showing a Download card when the PDF is ready
- **Features**: Streaming responses, visible tool calls, scoped document-writing persona

## Tech Stack

| Tool                                           | Purpose                   |
| ---------------------------------------------- | ------------------------- |
| [Bun](https://bun.sh)                          | Runtime & package manager |
| [Next.js 16](https://nextjs.org)               | React framework           |
| [Vercel AI SDK](https://ai-sdk.dev)            | Agent runtime & streaming |
| [shadcn/ui](https://ui.shadcn.com) (base-nova) | UI components             |
| [Tailwind CSS v4](https://tailwindcss.com)     | Styling                   |
| [lucide-react](https://lucide.dev)             | Icons                     |

## Getting Started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

Copy `.env.example` to `.env.local` and add your API keys:

| Variable             | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `GROQ_API_KEY`       | Groq API key (fallback model provider)      |
| `OPENROUTER_API_KEY` | OpenRouter API key (primary model provider) |

Agents route through [OpenRouter](https://openrouter.ai) by default and automatically fall back to Groq if the primary provider request fails (e.g. auth errors, rate limits, or outages).

## Adding a Showcase

Each showcase lives in its own directory under `app/` with corresponding agent tools under `agent/`. See the Financial Transactions showcase as a reference pattern.
