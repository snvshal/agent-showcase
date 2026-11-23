import { Agent } from "@/agent/core/Agent"
import { generalModel } from "@/agent/core/models"
import { PDF_SYSTEM_PROMPT } from "./persona"
import { generate_pdf_tool } from "./tools/generate_pdf"

export const pdfAgent = new Agent({
  name: "pdf",
  description: "Generates PDF documents from a prompt",
  model: generalModel,
  system: PDF_SYSTEM_PROMPT,
  tools: { generate_pdf: generate_pdf_tool },
  maxSteps: 5,
  providerOptions: {
    groq: {
      reasoningEffort: "medium",
    },
  },
})
