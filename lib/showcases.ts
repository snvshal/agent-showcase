import { FileText, Palette, Receipt, Search, type LucideIcon } from "lucide-react"

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
      "Analyze income and expense transactions with natural-language questions and an interactive data table.",
    icon: Receipt,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "pdf",
    href: "/pdf",
    label: "PDF Generator",
    title: "PDF Generator",
    description:
      "Describe documents like resumes, reports, contracts, or letters to generate and download polished PDFs.",
    icon: FileText,
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    key: "design",
    href: "/design",
    label: "Design Generator",
    title: "Design Generator",
    description:
      "Request social posts, banners, flyers, or cards to plan visual layouts and export downloadable graphics.",
    icon: Palette,
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    key: "search",
    href: "/search",
    label: "Web Search",
    title: "Web Search",
    description:
      "Ask about news, specs, pricing, or comparisons to explore the live web with cited sources.",
    icon: Search,
    accent: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
]
