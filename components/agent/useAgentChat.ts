"use client"

import { useCallback, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { finalizeAbortedParts } from "@/components/agent/finalizeAbortedParts"

export type AgentKey = "financial" | "pdf" | "design" | "search"

type AbortIntent = "stop" | "clear"

export function useAgentChat(agent: AgentKey) {
  const chatRef = useRef<ReturnType<typeof useChat> | null>(null)
  const abortIntentRef = useRef<AbortIntent | null>(null)

  const chat = useChat({
    transport: new DefaultChatTransport({
      api: "/api/agent",
      body: { agent },
    }),
    onFinish: ({ isAbort, messages }) => {
      const abortIntent = abortIntentRef.current
      abortIntentRef.current = null

      if (isAbort && abortIntent === "stop") {
        chatRef.current?.setMessages(finalizeAbortedParts(messages))
      }
    },
  })

  useEffect(() => {
    chatRef.current = chat
  }, [chat])

  const stop = useCallback(() => {
    const activeChat = chatRef.current
    if (!activeChat) return

    if (activeChat.status === "submitted" || activeChat.status === "streaming") {
      abortIntentRef.current = "stop"
    }
    void activeChat.stop()
  }, [])

  const stopAndClear = useCallback(() => {
    const activeChat = chatRef.current
    if (!activeChat) return

    abortIntentRef.current = "clear"
    void activeChat.stop()
    activeChat.setMessages([])
  }, [])

  return { ...chat, stop, stopAndClear }
}
