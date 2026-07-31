import { isStepCount, streamText } from "ai"
import type { LanguageModel, ModelMessage, ProviderMetadata, ToolSet } from "ai"

export interface AgentOptions {
  name: string
  description?: string
  system: string
  tools?: ToolSet
  model: LanguageModel
  maxSteps?: number
  providerOptions?: ProviderMetadata
}

export class Agent {
  readonly name: string
  readonly description?: string
  readonly tools?: ToolSet
  private readonly system: string
  private readonly model: LanguageModel
  private readonly maxSteps: number
  private readonly providerOptions?: ProviderMetadata

  constructor(options: AgentOptions) {
    this.name = options.name
    this.description = options.description
    this.system = options.system
    this.tools = options.tools
    this.model = options.model
    this.maxSteps = options.maxSteps ?? 5
    this.providerOptions = options.providerOptions
  }

  stream(messages: ModelMessage[], opts: { signal?: AbortSignal } = {}) {
    return streamText({
      model: this.model,
      system: this.system,
      tools: this.tools,
      stopWhen: isStepCount(this.maxSteps),
      providerOptions: this.providerOptions,
      abortSignal: opts.signal,
      messages,
    })
  }
}
