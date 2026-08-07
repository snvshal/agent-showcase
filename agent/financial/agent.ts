import { groq } from "@ai-sdk/groq"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent } from "@/agent/core/Agent"
import { withFallback } from "@/agent/core/withFallback"
import { FINANCIAL_SYSTEM_PROMPT } from "./persona"
import { calculate_tool, search_transactions_tool } from "./tools"

const openrouter = createOpenRouter()

export const financialAgent = new Agent({
  name: "financial",
  description: "Financial data analyst for transactions",
  model: withFallback(openrouter.chat("openai/gpt-oss-20b"), groq("openai/gpt-oss-20b")),
  system: FINANCIAL_SYSTEM_PROMPT,
  tools: { search_transactions: search_transactions_tool, calculate: calculate_tool },
  maxSteps: 5,
  providerOptions: {
    groq: {
      reasoningEffort: "medium",
    },
  },
})
