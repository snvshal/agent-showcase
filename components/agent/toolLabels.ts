const TOOL_LABELS: Record<string, string> = {
  search_transactions: "Transaction search",
  calculate: "Calculator",
  generate_design: "Design generator",
  generate_pdf: "PDF generator",
}

export function toolDisplayName(name: string): string {
  return (
    TOOL_LABELS[name] ?? name.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
  )
}
