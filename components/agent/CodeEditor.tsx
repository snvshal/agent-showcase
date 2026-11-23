"use client"

import { useCallback, useMemo, useRef, useState, type KeyboardEvent, type UIEvent } from "react"
import { cn } from "@/lib/utils"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  label: string
  language?: "html" | "css"
  className?: string
}

interface Token {
  text: string
  className?: string
}

const COLORS = {
  comment: "text-slate-500 italic dark:text-slate-400",
  punctuation: "text-muted-foreground",
  tag: "text-sky-600 dark:text-sky-400",
  attribute: "text-violet-600 dark:text-violet-400",
  string: "text-emerald-600 dark:text-emerald-400",
  keyword: "text-fuchsia-600 dark:text-fuchsia-400",
  number: "text-amber-600 dark:text-amber-400",
  selector: "text-pink-600 dark:text-pink-400",
  entity: "text-amber-600 dark:text-amber-400",
} as const

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char])
}

function tokensToHtml(tokens: Token[]) {
  return tokens
    .map((token) =>
      token.className
        ? `<span class="${token.className}">${escapeHtml(token.text)}</span>`
        : escapeHtml(token.text),
    )
    .join("")
}

function pushTokens(
  source: string,
  pattern: RegExp,
  classify: (match: RegExpExecArray) => string | undefined,
  tokens: Token[],
) {
  pattern.lastIndex = 0
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: source.slice(lastIndex, match.index) })
    }
    tokens.push({ text: match[0], className: classify(match) })
    lastIndex = match.index + match[0].length
    if (match[0].length === 0) pattern.lastIndex += 1
  }

  if (lastIndex < source.length) {
    tokens.push({ text: source.slice(lastIndex) })
  }
}

const CSS_TOKEN =
  /\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|@[\w-]+|#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|vmin|vmax|ch|ex|s|ms|deg|fr)?\b|[A-Za-z-]+(?=\s*:)|[.#][A-Za-z_][\w-]*|[{}();:,]|\s+|[^\s]/g

function tokenizeCss(source: string, tokens: Token[]) {
  pushTokens(
    source,
    CSS_TOKEN,
    (match) => {
      const text = match[0]
      if (text.startsWith("/*")) return COLORS.comment
      if (text.startsWith('"') || text.startsWith("'")) return COLORS.string
      if (text.startsWith("@")) return COLORS.keyword
      if (/^#[\da-f]/i.test(text) || /^\d/.test(text)) return COLORS.number
      if (/^[.#]/.test(text)) return COLORS.selector
      if (/^[{}();:,]$/.test(text)) return COLORS.punctuation
      if (/^[A-Za-z-]+$/.test(text)) return COLORS.attribute
      return undefined
    },
    tokens,
  )
}

const JS_KEYWORDS = new Set([
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "default",
  "do",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "null",
  "of",
  "return",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "undefined",
  "var",
  "while",
])

const JS_TOKEN =
  /\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`|\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|async|await|try|catch|finally|throw|import|export|from|default|typeof|instanceof|in|of|this|null|undefined|true|false)\b|\b\d+(?:\.\d+)?\b|[{}()[\];,.:=+\-*/<>!?&|%]+|\s+|[A-Za-z_$][\w$]*/g

function tokenizeJs(source: string, tokens: Token[]) {
  pushTokens(
    source,
    JS_TOKEN,
    (match) => {
      const text = match[0]
      if (text.startsWith("//") || text.startsWith("/*")) return COLORS.comment
      if (/^["'`]/.test(text)) return COLORS.string
      if (/^\d/.test(text)) return COLORS.number
      if (JS_KEYWORDS.has(text)) return COLORS.keyword
      if (/^[{}()[\];,.:=+\-*/<>!?&|%]+$/.test(text)) return COLORS.punctuation
      return undefined
    },
    tokens,
  )
}

function tokenizeMarkupText(source: string, tokens: Token[]) {
  pushTokens(source, /&[A-Za-z#][A-Za-z0-9#]*;/g, () => COLORS.entity, tokens)
}

const TAG_TOKEN =
  /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|([\w:.-]+)(?=\s*=)|(<\/?)([A-Za-z][\w:-]*)|(<!)([A-Za-z]+)|(=)|(\/?>)|(\s+)|([^\s=<>`]+)/g

function tokenizeTag(tag: string, tokens: Token[]) {
  if (tag.startsWith("<!--")) {
    tokens.push({ text: tag, className: COLORS.comment })
    return
  }

  pushTokens(
    tag,
    TAG_TOKEN,
    (match) => {
      if (match[1]) return COLORS.string
      if (match[2]) return COLORS.attribute
      if (match[3]) return COLORS.punctuation
      if (match[4]) return COLORS.tag
      if (match[5]) return COLORS.punctuation
      if (match[6]) return COLORS.keyword
      if (match[7]) return COLORS.punctuation
      if (match[8]) return COLORS.punctuation
      if (match[9]) return undefined
      return COLORS.punctuation
    },
    tokens,
  )
}

const HTML_TOKEN =
  /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/?[A-Za-z][\w:-]*(?:"[^"]*"|'[^']*'|[^<>])*>/gi

function tokenizeHtml(source: string): Token[] {
  const tokens: Token[] = []
  let mode: "markup" | "css" | "js" = "markup"
  let lastIndex = 0

  HTML_TOKEN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = HTML_TOKEN.exec(source)) !== null) {
    if (match.index > lastIndex) {
      const text = source.slice(lastIndex, match.index)
      if (mode === "css") tokenizeCss(text, tokens)
      else if (mode === "js") tokenizeJs(text, tokens)
      else tokenizeMarkupText(text, tokens)
    }

    const tag = match[0]
    tokenizeTag(tag, tokens)

    const lower = tag.toLowerCase()
    if (/^<\/(style|script)\b/.test(lower)) mode = "markup"
    else if (/^<style\b/.test(lower) && !/\/>$/.test(lower)) mode = "css"
    else if (/^<script\b/.test(lower) && !/\/>$/.test(lower)) mode = "js"

    lastIndex = match.index + tag.length
  }

  if (lastIndex < source.length) {
    const text = source.slice(lastIndex)
    if (mode === "css") tokenizeCss(text, tokens)
    else if (mode === "js") tokenizeJs(text, tokens)
    else tokenizeMarkupText(text, tokens)
  }

  return tokens
}

export default function CodeEditor({
  value,
  onChange,
  label,
  language = "html",
  className,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)
  const gutterRef = useRef<HTMLDivElement>(null)
  const [activeLine, setActiveLine] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)

  const highlighted = useMemo(() => {
    if (language === "html") return tokensToHtml(tokenizeHtml(value))
    const tokens: Token[] = []
    tokenizeCss(value, tokens)
    return tokensToHtml(tokens)
  }, [language, value])
  const lineCount = useMemo(() => value.split("\n").length, [value])

  const syncScroll = useCallback((event: UIEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget
    setScrollTop(textarea.scrollTop)
    if (highlightRef.current) {
      highlightRef.current.scrollTop = textarea.scrollTop
      highlightRef.current.scrollLeft = textarea.scrollLeft
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = textarea.scrollTop
    }
  }, [])

  const updateActiveLine = useCallback(
    (textarea: HTMLTextAreaElement) => {
      setActiveLine(value.slice(0, textarea.selectionStart).split("\n").length - 1)
    },
    [value],
  )

  const handleChange = useCallback(
    (textarea: HTMLTextAreaElement) => {
      onChange(textarea.value)
      updateActiveLine(textarea)
    },
    [onChange, updateActiveLine],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Tab") return
      event.preventDefault()

      const textarea = event.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const next = `${value.slice(0, start)}  ${value.slice(end)}`
      onChange(next)
      updateActiveLine(textarea)

      requestAnimationFrame(() => {
        textarea.selectionStart = start + 2
        textarea.selectionEnd = start + 2
        updateActiveLine(textarea)
      })
    },
    [onChange, updateActiveLine, value],
  )

  return (
    <div
      className={cn(
        "bg-background flex min-h-0 min-w-0 overflow-hidden font-mono text-[12px] leading-5",
        className,
      )}
    >
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="bg-muted/30 text-muted-foreground/60 w-11 shrink-0 overflow-hidden border-r py-3 text-right select-none"
      >
        <div>
          {Array.from({ length: lineCount }, (_, index) => (
            <div
              key={index}
              className={`h-5 px-2 ${activeLine === index ? "bg-accent/60 text-accent-foreground" : ""}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="relative min-w-0 flex-1">
        <div
          aria-hidden="true"
          className="bg-accent/60 pointer-events-none absolute inset-x-0 top-3 z-0 h-5"
          style={{ transform: `translateY(${activeLine * 20 - scrollTop}px)` }}
        />
        <pre
          ref={highlightRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden p-3 whitespace-pre"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
        <textarea
          ref={textareaRef}
          aria-label={label}
          value={value}
          onChange={(event) => handleChange(event.currentTarget)}
          onClick={(event) => updateActiveLine(event.currentTarget)}
          onKeyUp={(event) => updateActiveLine(event.currentTarget)}
          onSelect={(event) => updateActiveLine(event.currentTarget)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          className="text-foreground caret-foreground selection:bg-primary/25 absolute inset-0 z-20 h-full w-full resize-none overflow-auto border-0 bg-transparent p-3 leading-5 whitespace-pre text-transparent outline-none"
        />
      </div>
    </div>
  )
}
