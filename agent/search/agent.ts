import { Agent } from "@/agent/core/Agent"
import { generalModel } from "@/agent/core/models"
import { SEARCH_SYSTEM_PROMPT } from "./persona"
import { search_web_tool } from "./tools"

export const searchAgent = new Agent({
  name: "search",
  description: "Web research agent that searches the live web and cites its sources",
  model: generalModel,
  system: SEARCH_SYSTEM_PROMPT,
  tools: { search_web: search_web_tool },
  maxSteps: 5,
  providerOptions: {
    groq: {
      reasoningEffort: "medium",
    },
  },
})
