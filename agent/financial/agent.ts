import { groq } from "@ai-sdk/groq"
import { Agent } from "@/agent/core/Agent"
import { FINANCIAL_SYSTEM_PROMPT } from "./persona"
import { searchTransactionsTool } from "./tools"

export const financialAgent = new Agent({
  name: "financial",
  description: "Financial data analyst for transactions",
  model: groq("openai/gpt-oss-20b"),
  system: FINANCIAL_SYSTEM_PROMPT,
  tools: { search_transactions: searchTransactionsTool },
  maxSteps: 5,
  providerOptions: {
    groq: {
      reasoningEffort: "medium",
    },
  },
})
