import { groq } from "@ai-sdk/groq"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent } from "@/agent/core/Agent"
import { withFallback } from "@/agent/core/withFallback"
import { HTML_SYSTEM_PROMPT } from "./persona"
import { generate_webpage_tool } from "./tools"

const openrouter = createOpenRouter()

export const webpageModel = withFallback(
  openrouter.chat("deepseek/deepseek-v4-flash-0731"),
  groq("openai/gpt-oss-20b"),
)

export const webpageAgent = new Agent({
  name: "webpage",
  description: "Creates and edits single-file webpages with live previews",
  model: webpageModel,
  system: HTML_SYSTEM_PROMPT,
  tools: { generate_webpage: generate_webpage_tool },
  maxSteps: 5,
  providerOptions: {
    groq: {
      reasoningEffort: "medium",
    },
  },
})
