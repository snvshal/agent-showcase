import { FileText, Receipt, type LucideIcon } from "lucide-react"

export interface ShowcaseMeta {
  key: string
  href: string
  label: string
  title: string
  description: string
  icon: LucideIcon
  accent: string
}

export const SHOWCASES: ShowcaseMeta[] = [
  {
    key: "financial",
    href: "/financial",
    label: "Financial",
    title: "Financial Transactions",
    description:
      "Ask natural-language questions about income and expense data, with a read-only analyst agent and a sortable data table.",
    icon: Receipt,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "pdf",
    href: "/pdf",
    label: "PDF Generator",
    title: "PDF Generator",
    description:
      "Describe any document — resume, report, contract, or letter — and the agent drafts the content and renders a downloadable PDF.",
    icon: FileText,
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
]
