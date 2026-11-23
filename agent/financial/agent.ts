import { Agent } from "@/agent/core/Agent"
import { generalModel } from "@/agent/core/models"
import { FINANCIAL_SYSTEM_PROMPT } from "./persona"
import { calculate_tool, search_transactions_tool } from "./tools"

export const financialAgent = new Agent({
  name: "financial",
  description: "Financial data analyst for transactions",
  model: generalModel,
  system: FINANCIAL_SYSTEM_PROMPT,
  tools: { search_transactions: search_transactions_tool, calculate: calculate_tool },
  maxSteps: 5,
  providerOptions: {
    groq: {
      reasoningEffort: "medium",
    },
  },
})
