import type { ReactNode } from "react"
import { ExternalLink, Terminal } from "lucide-react"
import type { CitationSource } from "@/components/agent/citations"
import CitationLink from "@/components/agent/renderers/CitationLink"

interface MarkdownRendererProps {
  content: string
  sources?: CitationSource[]
  isStreaming?: boolean
}

function parseInlines(text: string, byCitationNumber: Map<number, CitationSource>): ReactNode[] {
  // Regex to match citations [1] or [1, 2], inline code `code`, bold/italic ***, **, *, ~~strike~~, and [links](url)
  const regex =
    /(\[\d+(?:\s*,\s*\d+)*\])|(`[^`]+`)|(\*\*\*[^*]+\*\*\*)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(~~[^~]+~~)|(\[[^\]]+\]\([^)]+\))/g

  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const fullMatch = match[0]

    // Citation [1] or [1, 2]
    if (match[1]) {
      const inner = fullMatch.slice(1, -1)
      const parts = inner.split(",")
      parts.forEach((p, idx) => {
        const n = Number(p.trim())
        if (!isNaN(n)) {
          nodes.push(
            <CitationLink
              key={`cite-${match!.index}-${idx}`}
              n={n}
              source={byCitationNumber.get(n)}
            />,
          )
        } else {
          nodes.push(fullMatch)
        }
      })
    }
    // Inline code `code`
    else if (match[2]) {
      const code = fullMatch.slice(1, -1)
      nodes.push(
        <code
          key={`code-${match.index}`}
          className="bg-muted text-foreground/90 border-border/60 mx-0.5 rounded-md border px-1.5 py-0.5 font-mono text-[0.82em] font-medium"
        >
          {code}
        </code>,
      )
    }
    // Bold + Italic ***text***
    else if (match[3]) {
      const inner = fullMatch.slice(3, -3)
      nodes.push(
        <strong key={`bi-${match.index}`} className="font-semibold italic">
          {parseInlines(inner, byCitationNumber)}
        </strong>,
      )
    }
    // Bold **text**
    else if (match[4]) {
      const inner = fullMatch.slice(2, -2)
      nodes.push(
        <strong key={`b-${match.index}`} className="text-foreground font-semibold">
          {parseInlines(inner, byCitationNumber)}
        </strong>,
      )
    }
    // Italic *text*
    else if (match[5]) {
      const inner = fullMatch.slice(1, -1)
      nodes.push(
        <em key={`i-${match.index}`} className="italic">
          {parseInlines(inner, byCitationNumber)}
        </em>,
      )
    }
    // Strikethrough ~~text~~
    else if (match[6]) {
      const inner = fullMatch.slice(2, -2)
      nodes.push(
        <del key={`s-${match.index}`} className="text-muted-foreground line-through">
          {parseInlines(inner, byCitationNumber)}
        </del>,
      )
    }
    // Link [text](url)
    else if (match[7]) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(fullMatch)
      if (linkMatch) {
        const linkText = linkMatch[1]
        const href = linkMatch[2]
        nodes.push(
          <a
            key={`a-${match.index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 font-medium underline underline-offset-3 transition-colors"
          >
            {parseInlines(linkText, byCitationNumber)}
            <ExternalLink className="inline-block size-3 opacity-70" />
          </a>,
        )
      } else {
        nodes.push(fullMatch)
      }
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

function CodeBlock({ language, code }: { language?: string; code: string }) {
  return (
    <div className="border-border/70 bg-muted/40 my-3 overflow-hidden rounded-lg border shadow-xs">
      {language && (
        <div className="border-border/50 bg-muted/70 text-muted-foreground flex items-center border-b px-3 py-1.5 text-xs font-medium">
          <div className="flex items-center gap-1.5 font-mono">
            <Terminal className="size-3.5" />
            <span>{language}</span>
          </div>
        </div>
      )}
      <div className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">
        <pre className="text-foreground/90 whitespace-pre">{code}</pre>
      </div>
    </div>
  )
}

function TableBlock({
  headers,
  rows,
  byCitationNumber,
}: {
  headers: string[]
  rows: string[][]
  byCitationNumber: Map<number, CitationSource>
}) {
  return (
    <div className="border-border/70 my-3 overflow-x-auto rounded-lg border shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/60 text-foreground border-border/60 border-b font-medium">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 font-semibold">
                {parseInlines(h.trim(), byCitationNumber)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-border/40 divide-y">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-muted/30 even:bg-muted/15 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="text-muted-foreground px-3 py-2">
                  {parseInlines(cell.trim(), byCitationNumber)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function MarkdownRenderer({
  content,
  sources,
  isStreaming = false,
}: MarkdownRendererProps) {
  const byCitationNumber = new Map((sources ?? []).map((source) => [source.n, source]))

  // Parse markdown lines/blocks
  const blocks: ReactNode[] = []
  const lines = content.split(/\r?\n/)
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // 1. Fenced code block (```lang or ```)
    if (line.trimStart().startsWith("```")) {
      const match = line.trimStart().match(/^```([a-zA-Z0-9_-]*)/)
      const language = match ? match[1] : ""
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      if (i < lines.length) {
        // Skip closing ```
        i++
      }
      blocks.push(
        <CodeBlock key={`code-block-${i}`} language={language} code={codeLines.join("\n")} />,
      )
      continue
    }

    // 2. Table (| Col 1 | Col 2 |)
    if (
      line.trim().startsWith("|") &&
      line.trim().endsWith("|") &&
      i + 1 < lines.length &&
      lines[i + 1].trim().startsWith("|") &&
      lines[i + 1].includes("---")
    ) {
      const parseCells = (rowText: string) => {
        const raw = rowText.trim()
        const stripped = raw.startsWith("|") ? raw.slice(1) : raw
        const cleaned = stripped.endsWith("|") ? stripped.slice(0, -1) : stripped
        return cleaned.split("|")
      }

      const headers = parseCells(line)
      i += 2 // skip header and delimiter line
      const rows: string[][] = []

      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        rows.push(parseCells(lines[i]))
        i++
      }

      blocks.push(
        <TableBlock
          key={`table-${i}`}
          headers={headers}
          rows={rows}
          byCitationNumber={byCitationNumber}
        />,
      )
      continue
    }

    // 3. Headings (#, ##, ###, ####)
    if (line.startsWith("#")) {
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
      if (headingMatch) {
        const level = headingMatch[1].length
        const headingText = headingMatch[2]
        const inlines = parseInlines(headingText, byCitationNumber)

        switch (level) {
          case 1:
            blocks.push(
              <h1
                key={`h1-${i}`}
                className="text-foreground mt-4 mb-2 text-lg font-bold tracking-tight first:mt-0"
              >
                {inlines}
              </h1>,
            )
            break
          case 2:
            blocks.push(
              <h2
                key={`h2-${i}`}
                className="text-foreground mt-3.5 mb-1.5 text-base font-semibold tracking-tight first:mt-0"
              >
                {inlines}
              </h2>,
            )
            break
          case 3:
          default:
            blocks.push(
              <h3
                key={`h3-${i}`}
                className="text-foreground mt-3 mb-1 text-sm font-semibold tracking-tight first:mt-0"
              >
                {inlines}
              </h3>,
            )
            break
        }
        i++
        continue
      }
    }

    // 4. Blockquote (> quote)
    if (line.trimStart().startsWith(">")) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trimStart().startsWith(">")) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ""))
        i++
      }
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="border-primary/40 bg-muted/30 text-muted-foreground my-2.5 rounded-r-md border-l-2 py-1 pr-3 pl-3.5 text-sm italic"
        >
          {quoteLines.map((q, qIdx) => (
            <div key={qIdx}>{parseInlines(q, byCitationNumber)}</div>
          ))}
        </blockquote>,
      )
      continue
    }

    // 5. Unordered List (- item or * item)
    if (/^\s*[-*]\s+/.test(line)) {
      const listItems: { indent: number; text: string }[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const itemMatch = lines[i].match(/^(\s*)[-*]\s+(.*)$/)
        if (itemMatch) {
          listItems.push({
            indent: Math.floor(itemMatch[1].length / 2),
            text: itemMatch[2],
          })
        }
        i++
      }
      blocks.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1 pl-1 text-sm leading-relaxed">
          {listItems.map((item, idx) => (
            <li
              key={idx}
              style={{ marginLeft: `${item.indent * 1}rem` }}
              className="flex items-start gap-2"
            >
              <span className="bg-foreground/60 mt-2 size-1.5 shrink-0 rounded-full" />
              <span className="text-foreground/90 flex-1">
                {parseInlines(item.text, byCitationNumber)}
              </span>
            </li>
          ))}
        </ul>,
      )
      continue
    }

    // 6. Ordered List (1. item)
    if (/^\s*\d+\.\s+/.test(line)) {
      const listItems: { num: string; text: string }[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const itemMatch = lines[i].match(/^\s*(\d+)\.\s+(.*)$/)
        if (itemMatch) {
          listItems.push({
            num: itemMatch[1],
            text: itemMatch[2],
          })
        }
        i++
      }
      blocks.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1 pl-1 text-sm leading-relaxed">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-muted-foreground font-mono text-xs font-medium tabular-nums">
                {item.num}.
              </span>
              <span className="text-foreground/90 flex-1">
                {parseInlines(item.text, byCitationNumber)}
              </span>
            </li>
          ))}
        </ol>,
      )
      continue
    }

    // 7. Horizontal Rule (--- or ***)
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line.trim())) {
      blocks.push(<hr key={`hr-${i}`} className="border-border/60 my-3 border-t" />)
      i++
      continue
    }

    // 8. Empty line
    if (!line.trim()) {
      if (i > 0 && i < lines.length - 1 && lines[i - 1].trim() && lines[i + 1].trim()) {
        blocks.push(<div key={`space-${i}`} className="h-2" />)
      }
      i++
      continue
    }

    // 9. Standard Paragraph
    const paragraphLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trimStart().startsWith("```") &&
      !lines[i].startsWith("#") &&
      !lines[i].trimStart().startsWith(">") &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !(lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) &&
      !/^(\*{3,}|-{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i])
      i++
    }

    blocks.push(
      <p key={`p-${i}`} className="text-foreground/90 text-sm leading-relaxed break-words">
        {paragraphLines.map((pLine, pIdx) => (
          <span key={pIdx}>
            {parseInlines(pLine, byCitationNumber)}
            {pIdx < paragraphLines.length - 1 && " "}
          </span>
        ))}
      </p>,
    )
  }

  return (
    <div className="space-y-2">
      {blocks}
      {isStreaming && (
        <span className="bg-foreground/50 ml-0.5 inline-block h-4 w-3 animate-pulse rounded-none align-text-bottom" />
      )}
    </div>
  )
}
