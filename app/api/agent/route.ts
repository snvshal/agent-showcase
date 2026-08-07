import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  generateId,
  toUIMessageStream,
} from "ai"
import type { UIMessage } from "ai"
import { getAgent } from "@/agent"

const MAX_MESSAGES = 25
const MAX_TEXT_LENGTH = 100_000

export async function POST(request: Request) {
  let body: { messages?: unknown; agent?: string }
  try {
    body = (await request.json()) as { messages?: unknown; agent?: string }
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { messages, agent: agentKey } = body
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages must be a non-empty array" }, { status: 400 })
  }

  const history = (messages as UIMessage[]).slice(-MAX_MESSAGES)

  const textLength = history.reduce(
    (total, m) =>
      total +
      (Array.isArray(m.parts)
        ? m.parts.reduce((sum, p) => sum + (p.type === "text" ? p.text.length : 0), 0)
        : 0),
    0,
  )
  if (textLength > MAX_TEXT_LENGTH) {
    return Response.json(
      { error: `Message history too large (max ${MAX_TEXT_LENGTH} chars)` },
      { status: 400 },
    )
  }

  const agent = getAgent(agentKey)
  const result = agent.stream(await convertToModelMessages(history), {
    signal: request.signal,
  })
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      tools: agent.tools,
      originalMessages: history,
      generateMessageId: generateId,
    }),
  })
}
