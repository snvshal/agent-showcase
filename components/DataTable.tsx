"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"

interface Transaction {
  id: number
  date: string
  description: string
  type: "income" | "expense"
  category: string
  amount: number
  department: string
  payment_method: string
  counterparty: string
}

type SortKey = "date" | "amount"
type SortDir = "asc" | "desc"

export default function DataTable() {
  const [data, setData] = useState<Transaction[] | null>(null)
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("date")
  const [sortOrder, setSortOrder] = useState<SortDir>("desc")

  const loading = data === null

  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set("query", query)
    if (typeFilter) params.set("type", typeFilter)
    params.set("sortBy", sortBy)
    params.set("sortOrder", sortOrder)

    let cancelled = false

    fetch(`/api/transactions?${params}`)
      .then((r) => r.json())
      .then((result) => {
        if (!cancelled) setData(result)
      })

    return () => {
      cancelled = true
      setData(null)
    }
  }, [query, typeFilter, sortBy, sortOrder])

  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(key)
      setSortOrder("desc")
    }
  }

  function formatCurrency(n: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search transactions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border-input h-8 rounded-lg border bg-transparent px-2 text-sm"
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div data-slot="table-scroll" className="min-h-0 flex-1 overflow-auto rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-background">
              <TableHead
                className="hover:text-foreground cursor-pointer"
                onClick={() => toggleSort("date")}
              >
                Date {sortBy === "date" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead
                className="hover:text-foreground cursor-pointer text-right"
                onClick={() => toggleSort("amount")}
              >
                Amount {sortBy === "amount" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Counterparty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              data.map((t) => (
                <TableRow
                  key={t.id}
                  className={
                    t.type === "income"
                      ? "bg-green-50/40 dark:bg-green-950/10"
                      : "bg-red-50/40 dark:bg-red-950/10"
                  }
                >
                  <TableCell className="font-mono text-xs">{t.date}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={t.description}>
                    {t.description}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={t.type === "income" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell
                    className={`text-right font-mono tabular-nums ${
                      t.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell>{t.department}</TableCell>
                  <TableCell className="max-w-[140px] truncate" title={t.counterparty}>
                    {t.counterparty}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
