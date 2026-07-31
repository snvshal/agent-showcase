import { tool } from "ai"
import { z } from "zod"

type Token =
  | { type: "number"; value: number }
  | { type: "ident"; name: string }
  | { type: "op"; op: string }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "comma" }
  | { type: "end" }

const FUNCTION_ARITY: Record<string, [number, number]> = {
  abs: [1, 1],
  avg: [1, Infinity],
  ceil: [1, 1],
  floor: [1, 1],
  max: [1, Infinity],
  min: [1, Infinity],
  pct: [2, 2],
  round: [1, 2],
  sqrt: [1, 1],
  sum: [1, Infinity],
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < input.length) {
    const ch = input[i]

    if (/\s/.test(ch)) {
      i++
      continue
    }

    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(input[i + 1] ?? ""))) {
      let j = i
      while (j < input.length && /[0-9.]/.test(input[j])) j++
      const value = Number(input.slice(i, j))
      if (Number.isNaN(value)) throw new Error(`Invalid number at position ${i}`)
      tokens.push({ type: "number", value })
      i = j
      continue
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let j = i
      while (j < input.length && /[a-zA-Z0-9_]/.test(input[j])) j++
      tokens.push({ type: "ident", name: input.slice(i, j).toLowerCase() })
      i = j
      continue
    }

    if ("+-*/%^".includes(ch)) {
      tokens.push({ type: "op", op: ch })
      i++
      continue
    }

    if (ch === "(") {
      tokens.push({ type: "lparen" })
      i++
      continue
    }
    if (ch === ")") {
      tokens.push({ type: "rparen" })
      i++
      continue
    }
    if (ch === ",") {
      tokens.push({ type: "comma" })
      i++
      continue
    }

    throw new Error(`Unexpected character "${ch}" at position ${i}`)
  }

  tokens.push({ type: "end" })
  return tokens
}

class Parser {
  private pos = 0

  constructor(private readonly tokens: Token[]) {}

  parse(): number {
    const value = this.expression()
    const tok = this.peek()
    if (tok.type !== "end") throw new Error(`Unexpected token at position ${this.pos}`)
    return value
  }

  private peek(): Token {
    return this.tokens[this.pos]
  }

  private next(): Token {
    return this.tokens[this.pos++]
  }

  private expression(): number {
    let value = this.term()

    for (;;) {
      const tok = this.peek()
      if (tok.type === "op" && (tok.op === "+" || tok.op === "-")) {
        this.next()
        const rhs = this.term()
        value = tok.op === "+" ? value + rhs : value - rhs
      } else {
        return value
      }
    }
  }

  private term(): number {
    let value = this.unary()

    for (;;) {
      const tok = this.peek()
      if (tok.type === "op" && (tok.op === "*" || tok.op === "/" || tok.op === "%")) {
        this.next()
        const rhs = this.unary()
        if (tok.op === "*") value *= rhs
        else if (tok.op === "/") {
          if (rhs === 0) throw new Error("Division by zero")
          value /= rhs
        } else {
          if (rhs === 0) throw new Error("Modulo by zero")
          value %= rhs
        }
      } else {
        return value
      }
    }
  }

  private unary(): number {
    const tok = this.peek()
    if (tok.type === "op" && (tok.op === "+" || tok.op === "-")) {
      this.next()
      const value = this.unary()
      return tok.op === "-" ? -value : value
    }
    return this.power()
  }

  private power(): number {
    const base = this.primary()
    const tok = this.peek()
    if (tok.type === "op" && tok.op === "^") {
      this.next()
      const exp = this.unary()
      return base ** exp
    }
    return base
  }

  private primary(): number {
    const tok = this.peek()

    if (tok.type === "number") {
      this.next()
      return tok.value
    }

    if (tok.type === "lparen") {
      this.next()
      const value = this.expression()
      if (this.next().type !== "rparen") throw new Error("Expected \")\"")
      return value
    }

    if (tok.type === "ident") {
      this.next()
      const name = tok.name

      if (this.peek().type !== "lparen") {
        throw new Error(`Unknown identifier "${name}"`)
      }
      this.next()

      const args: number[] = []
      if (this.peek().type !== "rparen") {
        for (;;) {
          args.push(this.expression())
          if (this.peek().type === "comma") {
            this.next()
            continue
          }
          break
        }
      }
      if (this.next().type !== "rparen") throw new Error(`Expected ")" after ${name}`)

      const [minArgs, maxArgs] = FUNCTION_ARITY[name] ?? [NaN, NaN]
      if (Number.isNaN(minArgs)) throw new Error(`Unknown function "${name}"`)
      if (args.length < minArgs || args.length > maxArgs) {
        throw new Error(`Function "${name}" expects ${minArgs === maxArgs ? minArgs : `${minArgs}-${maxArgs}`} arguments, got ${args.length}`)
      }

      switch (name) {
        case "abs":
          return Math.abs(args[0])
        case "avg": {
          const total = args.reduce((s, n) => s + n, 0)
          return total / args.length
        }
        case "ceil":
          return Math.ceil(args[0])
        case "floor":
          return Math.floor(args[0])
        case "max":
          return Math.max(...args)
        case "min":
          return Math.min(...args)
        case "pct":
          if (args[1] === 0) throw new Error("Division by zero in pct")
          return (args[0] / args[1]) * 100
        case "round": {
          const dp = args[1] ?? 0
          const factor = 10 ** dp
          return Math.round(args[0] * factor) / factor
        }
        case "sqrt":
          return Math.sqrt(args[0])
        case "sum":
          return args.reduce((s, n) => s + n, 0)
        default:
          throw new Error(`Unknown function "${name}"`)
      }
    }

    throw new Error(`Unexpected token at position ${this.pos}`)
  }
}

export function evaluateExpression(expression: string): number {
  if (!expression.trim()) throw new Error("Expression is empty")
  return new Parser(tokenize(expression)).parse()
}

export const calculate_tool = tool({
  description:
    "Precisely evaluate an arithmetic expression for any derived math — percentages, growth, totals spanning multiple results, and comparisons. Supports + - * / % ^ and parentheses, plus functions sum(...), avg(...), min(...), max(...), round(n, dp), pct(part, whole), abs(n), sqrt(n), floor(n), ceil(n). Use this instead of computing numbers mentally.",
  inputSchema: z.object({
    expression: z
      .string()
      .describe(
        'Arithmetic expression to evaluate, e.g. "round(pct(1542.3, 9876.54), 2)" or "sum(1200, 450.5) / 4"',
      ),
  }),
  execute: async ({ expression }) => {
    try {
      return { value: evaluateExpression(expression) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }
  },
})
