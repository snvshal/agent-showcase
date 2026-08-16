import { groq } from "@ai-sdk/groq"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent } from "@/agent/core/Agent"
import { withFallback } from "@/agent/core/withFallback"
import { SEARCH_SYSTEM_PROMPT } from "./persona"
import { search_web_tool } from "./tools"

const openrouter = createOpenRouter()

export const searchAgent = new Agent({
  name: "search",
  description: "Web research agent that searches the live web and cites its sources",
  model: withFallback(openrouter.chat("openai/gpt-oss-20b"), groq("openai/gpt-oss-20b")),
  system: SEARCH_SYSTEM_PROMPT,
  tools: { search_web: search_web_tool },
  maxSteps: 5,
  providerOptions: {
    groq: {
      reasoningEffort: "medium",
    },
  },
})
