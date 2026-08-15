import { groq } from "@ai-sdk/groq"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Agent } from "@/agent/core/Agent"
import { withFallback } from "@/agent/core/withFallback"
import { DESIGN_SYSTEM_PROMPT } from "./persona"
import { generate_design_tool } from "./tools"

const openrouter = createOpenRouter()

export const designAgent = new Agent({
  name: "design",
  description: "Creates vector graphics and social designs from a prompt",
  model: withFallback(
    openrouter.chat("deepseek/deepseek-v4-flash-0731"),
    groq("openai/gpt-oss-20b"),
  ),
  system: DESIGN_SYSTEM_PROMPT,
  tools: { generate_design: generate_design_tool },
  maxSteps: 5,
  providerOptions: {
    groq: {
      reasoningEffort: "medium",
    },
  },
})
