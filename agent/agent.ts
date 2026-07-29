import { groq } from "@ai-sdk/groq"
import { defineAgent } from "eve"

export default defineAgent({
  model: groq("openai/gpt-oss-20b"),
  modelOptions: {
    providerOptions: {
      groq: {
        reasoningEffort: "medium",
      },
    },
  },
})
