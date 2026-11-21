import { isToolUIPart } from "ai"
import type { UIDataTypes, UIMessage, UIMessagePart, UITools } from "ai"

export const ABORT_ERROR = "Stopped by user"

function finalizePart(
  part: UIMessagePart<UIDataTypes, UITools>,
): UIMessagePart<UIDataTypes, UITools> {
  if ((part.type === "text" || part.type === "reasoning") && part.state === "streaming") {
    return { ...part, state: "done" }
  }

  if (
    isToolUIPart(part) &&
    (part.state === "input-streaming" || part.state === "input-available")
  ) {
    return {
      ...part,
      state: "output-error",
      errorText: ABORT_ERROR,
    } as UIMessagePart<UIDataTypes, UITools>
  }

  return part
}

export function finalizeAbortedParts(messages: UIMessage[]): UIMessage[] {
  return messages.map((msg) =>
    msg.role === "assistant" && msg.parts.length > 0
      ? { ...msg, parts: msg.parts.map(finalizePart) }
      : msg,
  )
}
