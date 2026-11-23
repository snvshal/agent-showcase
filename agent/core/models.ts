import { groq } from "@ai-sdk/groq"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { withFallback } from "@/agent/core/withFallback"

export const OPENROUTER_MODELS = {
  general: "openai/gpt-oss-20b",
  code: "deepseek/deepseek-v4-flash-0731",
} as const

export const GROQ_FALLBACK_MODEL = "openai/gpt-oss-20b"

const openrouter = createOpenRouter()

export const generalModel = withFallback(
  openrouter.chat(OPENROUTER_MODELS.general),
  groq(GROQ_FALLBACK_MODEL),
)

export const codeModel = withFallback(
  openrouter.chat(OPENROUTER_MODELS.code),
  groq(GROQ_FALLBACK_MODEL),
)
