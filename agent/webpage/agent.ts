import { Agent } from "@/agent/core/Agent"
import { codeModel } from "@/agent/core/models"
import { HTML_SYSTEM_PROMPT } from "./persona"
import { generate_webpage_tool } from "./tools"

export const webpageAgent = new Agent({
  name: "webpage",
  description: "Creates and edits single-file webpages with live previews",
  model: codeModel,
  system: HTML_SYSTEM_PROMPT,
  tools: { generate_webpage: generate_webpage_tool },
  maxSteps: 5,
  providerOptions: {
    groq: {
      reasoningEffort: "medium",
    },
  },
})
