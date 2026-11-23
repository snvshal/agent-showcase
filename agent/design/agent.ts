import { Agent } from "@/agent/core/Agent"
import { codeModel } from "@/agent/core/models"
import { DESIGN_SYSTEM_PROMPT } from "./persona"
import { generate_design_tool } from "./tools"

export const designAgent = new Agent({
  name: "design",
  description: "Creates vector graphics and social designs from a prompt",
  model: codeModel,
  system: DESIGN_SYSTEM_PROMPT,
  tools: { generate_design: generate_design_tool },
  maxSteps: 5,
  providerOptions: {
    groq: {
      reasoningEffort: "medium",
    },
  },
})
