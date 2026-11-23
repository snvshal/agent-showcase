import { dynamicTool } from "ai"
import { z } from "zod"

const TAG_AND_EVENT_PATTERN =
  /<(?:script|iframe|frame|frameset|object|embed|applet|base)\b|<\/script\b|\son[a-z0-9_-]+\s*=|\bsrcdoc\s*=/i
const SCHEME_AND_CSS_PATTERN =
  /javascript:|vbscript:|data\s*:\s*text\/html|@import|expression\s*\(/i

function isForbiddenWebpage(source: string): boolean {
  const decoded = source
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, decimal: string) => String.fromCharCode(Number(decimal)))
    .replace(/&colon;/gi, ":")
    .replace(/&sol;/gi, "/")
    .replace(/&[a-z]+;/gi, "")
    .toLowerCase()

  const collapsed = decoded.replace(/[\u0000-\u0020]+/g, " ")
  const stripped = decoded.replace(/[\u0000-\u0020]+/g, "")

  return TAG_AND_EVENT_PATTERN.test(collapsed) || SCHEME_AND_CSS_PATTERN.test(stripped)
}

export const generate_webpage_tool = dynamicTool({
  description:
    'Create or revise a complete single-file webpage using HTML and embedded CSS only. Do not add JavaScript. Always return the entire updated document, not a fragment. Use the current editor source included in the conversation as the source of truth when editing an existing page. Use target="_blank" rel="noopener noreferrer" for external links. Include a short summary (at most 120 characters) describing the change.',
  inputSchema: z.object({
    filename: z
      .string()
      .min(1)
      .max(80)
      .describe("A short filename for the download, with or without the .html extension"),
    html: z
      .string()
      .min(1)
      .max(100_000)
      .describe("The full HTML document with embedded CSS and no scripts or event handlers")
      .refine(
        (source) => !isForbiddenWebpage(source),
        "Webpages must not contain JavaScript, script tags, inline event handlers, embedded frames, or unsafe URL schemes",
      ),
    summary: z
      .string()
      .max(120)
      .default("Initial webpage creation")
      .describe("A short note describing what changed in this webpage"),
  }),
  execute: async (params) => {
    const { filename, html, summary } = params as {
      filename: string
      html: string
      summary?: string
    }
    const safeBase = filename
      .replace(/\.html?$/i, "")
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72)
    return {
      filename: `${safeBase || "web-page"}.html`,
      html,
      summary: (summary || "Initial webpage creation").trim().slice(0, 120),
    }
  },
})
