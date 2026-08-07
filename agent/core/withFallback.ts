import type {
  LanguageModelV4,
  LanguageModelV4CallOptions,
  LanguageModelV4GenerateResult,
  LanguageModelV4StreamResult,
} from "@ai-sdk/provider"

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError"
}

function fallbackTo<T>(
  primary: () => PromiseLike<T>,
  fallback: () => PromiseLike<T>,
  onFallback: (error: unknown) => void,
): Promise<T> {
  return Promise.resolve()
    .then(primary)
    .catch((error) => {
      if (isAbortError(error)) throw error
      onFallback(error)
      return fallback()
    })
}

export function withFallback(primary: LanguageModelV4, fallback: LanguageModelV4): LanguageModelV4 {
  return {
    specificationVersion: "v4",
    provider: primary.provider,
    modelId: primary.modelId,
    supportedUrls: primary.supportedUrls,
    doGenerate(options: LanguageModelV4CallOptions): Promise<LanguageModelV4GenerateResult> {
      return fallbackTo(
        () => primary.doGenerate(options),
        () => fallback.doGenerate(options),
        (error) =>
          console.warn(`[${primary.provider}] failed, falling back to ${fallback.provider}`, error),
      )
    },
    doStream(options: LanguageModelV4CallOptions): Promise<LanguageModelV4StreamResult> {
      return fallbackTo(
        () => primary.doStream(options),
        () => fallback.doStream(options),
        (error) =>
          console.warn(`[${primary.provider}] failed, falling back to ${fallback.provider}`, error),
      )
    },
  }
}
