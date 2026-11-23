import type { Agent } from "@/agent/core/Agent"
import { financialAgent } from "@/agent/financial/agent"
import { pdfAgent } from "@/agent/pdf/agent"
import { designAgent } from "@/agent/design/agent"
import { searchAgent } from "@/agent/search/agent"
import { webpageAgent } from "@/agent/webpage/agent"

const agents: Record<string, Agent> = {
  financial: financialAgent,
  pdf: pdfAgent,
  design: designAgent,
  search: searchAgent,
  webpage: webpageAgent,
}

export function getAgent(key: string | undefined): Agent | undefined {
  if (!key || !Object.hasOwn(agents, key)) return undefined
  return agents[key]
}

export function listAgents(): { name: string; description?: string }[] {
  return Object.values(agents).map((agent) => ({
    name: agent.name,
    description: agent.description,
  }))
}
