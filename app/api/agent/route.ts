import { convertToModelMessages, createUIMessageStreamResponse, generateId, toUIMessageStream } from "ai"
import type { UIMessage } from "ai"
import { getAgent } from "@/agent"

export async function POST(request: Request) {
  const { messages, agent: agentKey } = (await request.json()) as {
    messages: UIMessage[]
    agent?: string
  }

  const agent = getAgent(agentKey)
  const result = agent.stream(await convertToModelMessages(messages), { signal: request.signal })
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      tools: agent.tools,
      originalMessages: messages,
      generateMessageId: generateId,
    }),
  })
}
