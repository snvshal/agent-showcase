import { defineTool } from "eve/tools"
import { z } from "zod"
import { searchTransactions } from "../../lib/data"

export default defineTool({
  description:
    "Search and analyze financial transactions. Use filters to narrow results, or use groupBy for aggregate analysis by category, department, or month. When 3+ results match, stats are auto-included.",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe("Search term for description and counterparty (LIKE match)"),
    type: z.enum(["income", "expense"]).optional().describe("Filter by transaction type"),
    category: z
      .string()
      .optional()
      .describe("Filter by category (e.g. Payroll, Rent, Consulting, Subscriptions)"),
    department: z
      .string()
      .optional()
      .describe("Filter by department (e.g. Engineering, Sales, Marketing)"),
    counterparty: z.string().optional().describe("Filter by counterparty name (partial match)"),
    minAmount: z.number().optional().describe("Minimum amount filter"),
    maxAmount: z.number().optional().describe("Maximum amount filter"),
    startDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    endDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
    groupBy: z
      .enum(["category", "department", "month", "none"])
      .optional()
      .describe("Group results for aggregate analysis"),
    sortBy: z.enum(["date", "amount"]).optional().describe("Sort column"),
    sortOrder: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    limit: z.number().min(1).max(200).optional().describe("Max results to return (default 50)"),
  }),
  async execute(input) {
    return searchTransactions(input)
  },
})
