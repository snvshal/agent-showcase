import { groq } from "@ai-sdk/groq"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent } from "@/agent/core/Agent"
import { withFallback } from "@/agent/core/withFallback"
import { PDF_SYSTEM_PROMPT } from "./persona"
import { generate_pdf_tool } from "./tools/generate_pdf"

const openrouter = createOpenRouter()

export const pdfAgent = new Agent({
  name: "pdf",
  description: "Generates PDF documents from a prompt",
  model: withFallback(openrouter.chat("openai/gpt-oss-20b"), groq("openai/gpt-oss-20b")),
  system: PDF_SYSTEM_PROMPT,
  tools: { generate_pdf: generate_pdf_tool },
  maxSteps: 5,
  providerOptions: {
    groq: {
      reasoningEffort: "medium",
    },
  },
})
