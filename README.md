# agent-showcase

A collection of AI agent demonstrations built with [Next.js](https://nextjs.org), the [Vercel AI SDK](https://ai-sdk.dev), [shadcn/ui](https://ui.shadcn.com), and [Bun](https://bun.sh).

Each showcase features a different agent use case with real tool calling, streaming responses, and a polished UI.

## Showcases

The home page (`/`) is a hub that lists every showcase as a card. Each agent has its own page:

- **`/financial`** — Financial Transactions Agent
- **`/pdf`** — PDF Generator Agent
- **`/design`** — Design Generator Agent
- **`/search`** — Web Search Agent
- **`/webpage`** — Webpage Builder Agent

### Financial Transactions Agent

A read-only financial data analyst agent. Browse income/expense transactions in a sortable table and ask natural-language questions about the data.

- **Tool**: Single `search_transactions` tool with parameterized filters (type, category, department, amount range, date range, group-by, sort)
- **Data**: 80+ seeded transactions stored as JSON, auto-seeded on first access
- **UI**: Side-by-side layout (data table + agent chat), responsive tabs on mobile
- **Features**: Streaming responses, visible tool calls with reasoning, shimmer loading status

### PDF Generator Agent

Ask for any document — a resume, report, contract, or letter — and the agent drafts the content and renders it into a downloadable PDF file.

- **Tool**: Single `generate_pdf` tool taking a structured document spec (title, author, sections with paragraphs, bullets, and tables)
- **Rendering**: `@react-pdf/renderer` renders the spec to a styled A4 PDF, returned as base64 in the tool result and shown/downloaded in the browser via an in-memory blob URL — nothing is written to disk
- **UI**: Dedicated `/pdf` showcase with example prompts and a custom tool-call renderer showing a Download card when the PDF is ready
- **Features**: Streaming responses, visible tool calls, scoped document-writing persona

### Design Generator Agent

Ask for any graphic — a social media post, banner, flyer, or quote card — and the agent plans the layout, palette, and typography, then renders a downloadable vector image.

- **Tool**: Single `generate_design` tool taking a structured design spec (canvas size, solid or gradient background, title/subtitle/footer text layers, decorative shapes)
- **Rendering**: A server-side SVG renderer builds a sanitized, responsive vector graphic from the spec, returned in the tool result and rendered in-memory as a data URL (no image-gen API required, nothing written to disk)
- **UI**: Dedicated `/design` showcase with example prompts and a preview pane showing the latest design with Download/Open buttons
- **Features**: Streaming responses, visible tool calls, scoped graphic-design persona

### Web Search Agent

Ask anything — news, specs, prices, comparisons — and the agent searches the live web and answers with cited sources.

- **Tool**: Single `search_web` tool backed by the [Exa](https://exa.ai) API, taking a query plus optional result count and depth
- **Data**: Results are cached in-memory for 5 minutes to avoid duplicate calls; results carry title, URL, and a snippet built from Exa highlights
- **UI**: Dedicated `/search` showcase (two-pane layout with sources panel and agent chat) featuring inline `[n]` citation links with hover popovers and a sources sidebar
- **Features**: Streaming responses, visible tool calls, scoped research persona that refuses to answer from memory alone

### Webpage Builder Agent

Create and revise single-file web pages from a prompt. The current editor source is included with chat requests so revisions reflect manual edits.

- **Tool**: Single `generate_webpage` tool returning a complete HTML document with embedded CSS
- **Rendering**: Generated HTML is sanitized and previewed in an isolated iframe; manually added JavaScript can run in the preview, but the iframe has no same-origin access. Pages are downloaded explicitly, while version snapshots are stored locally in browser IndexedDB
- **UI**: Dedicated `/webpage` workspace with a syntax-highlighted source editor, a Preview/Code toggle, manual Save button, AI-generated version notes based on HTML diffs, local history for the latest 10 snapshots with code comparison, click-to-rename filename, and a download action
- **Features**: Streaming responses, visible tool calls, external links that open safely in a new tab, internal hash links that work in the preview, and a generated-page policy that rejects scripts, inline event handlers, and embedded frames

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
| `EXA_API_KEY`        | Exa key for the Web Search agent            |

Agents route through [OpenRouter](https://openrouter.ai) by default and automatically fall back to Groq if the primary provider request fails (e.g. auth errors, rate limits, or outages).

## Adding a Showcase

Each showcase lives in its own directory under `app/` with corresponding agent tools under `agent/`. See the Financial Transactions showcase as a reference pattern.
