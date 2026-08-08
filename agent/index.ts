import type { Agent } from "@/agent/core/Agent"
import { financialAgent } from "@/agent/financial/agent"
import { pdfAgent } from "@/agent/pdf/agent"

const agents: Record<string, Agent> = {
  financial: financialAgent,
  pdf: pdfAgent,
}

export function getAgent(key: string | undefined): Agent {
  return (key && agents[key]) || financialAgent
}

export function listAgents(): { name: string; description?: string }[] {
  return Object.values(agents).map((agent) => ({
    name: agent.name,
    description: agent.description,
  }))
}
