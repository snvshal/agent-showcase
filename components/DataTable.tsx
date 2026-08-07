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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import type { Transaction } from "@/lib/data"

type SortKey = "date" | "amount"
type SortDir = "asc" | "desc"

export default function DataTable() {
  const [data, setData] = useState<Transaction[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("date")
  const [sortOrder, setSortOrder] = useState<SortDir>("desc")

  const loading = data === null && error === null

  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set("query", query)
    if (typeFilter) params.set("type", typeFilter)
    params.set("sortBy", sortBy)
    params.set("sortOrder", sortOrder)

    let cancelled = false

    fetch(`/api/transactions?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed with status ${r.status}`)
        return r.json()
      })
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })

    return () => {
      cancelled = true
      setData(null)
    }
  }, [query, typeFilter, sortBy, sortOrder, reloadKey])

  function handleQueryChange(value: string) {
    setQuery(value)
    setError(null)
  }

  function handleTypeChange(value: string) {
    setTypeFilter(value)
    setError(null)
  }

  function toggleSort(key: SortKey) {
    setError(null)
    if (sortBy === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(key)
      setSortOrder("desc")
    }
  }

  function handleRetry() {
    setError(null)
    setReloadKey((k) => k + 1)
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
          onChange={(e) => handleQueryChange(e.target.value)}
          className="flex-1"
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="h-8 shrink-0">
                {typeFilter
                  ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)
                  : "All types"}
                <ChevronDown className="size-3.5 opacity-60" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={typeFilter} onValueChange={handleTypeChange}>
              <DropdownMenuRadioItem value="">All types</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="income">Income</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="expense">Expense</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div data-slot="table-scroll" className="min-h-0 flex-1 overflow-auto rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-background">
              <TableHead
                className="hover:text-foreground cursor-pointer"
                aria-sort={
                  sortBy === "date" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"
                }
                onClick={() => toggleSort("date")}
              >
                Date {sortBy === "date" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead
                className="hover:text-foreground cursor-pointer text-right"
                aria-sort={
                  sortBy === "amount" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"
                }
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
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-muted-foreground text-sm">{error}</span>
                    <Button variant="outline" size="sm" onClick={handleRetry}>
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : !data || data.length === 0 ? (
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
