import { dynamicTool } from "ai"
import { z } from "zod"
import { renderPdf, type PdfDocumentSpec } from "@/agent/pdf/lib/renderPdf"

const sectionSchema = z.object({
  heading: z.string().describe("Section heading"),
  paragraphs: z
    .array(z.string())
    .optional()
    .describe("Body paragraphs. Use separate entries for separate paragraphs."),
  bullets: z.array(z.string()).optional().describe("Bullet list items for this section"),
  table: z
    .object({
      headers: z.array(z.string()).min(1).describe("Column headers"),
      rows: z
        .array(z.array(z.string()).min(1))
        .min(1)
        .describe("Table rows; each row must match the headers column count"),
    })
    .optional()
    .describe("Optional data table"),
})

export const generate_pdf_tool = dynamicTool({
  description:
    "Generate a professionally formatted PDF document from a structured specification and return its contents to be shown in the UI. Use this when the user asks to create, write, or generate any document, PDF, resume, report, contract, letter, or handout. Returns the document data and a filename for the generated file.",
  inputSchema: z.object({
    title: z.string().describe("Document title, shown large at the top"),
    subtitle: z.string().optional().describe("Short subtitle under the title"),
    author: z.string().optional().describe("Author or byline"),
    accentColor: z.string().optional().describe("Hex color for title and accents, e.g. '#2563eb'"),
    sections: z
      .array(sectionSchema)
      .min(1)
      .describe(
        "Document body, in reading order. Include every section you want on the page. Do not invent data that the user did not provide; leave it as a placeholder in plain text when the user must fill it in.",
      ),
  }),
  execute: async (params) => {
    try {
      return await renderPdf(params as PdfDocumentSpec)
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) }
    }
  },
})
