import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { generateTransactions } from "./seed";

export interface Transaction {
  id: number;
  date: string;
  description: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  department: string;
  payment_method: string;
  counterparty: string;
  notes: string;
}

export interface SearchParams {
  query?: string;
  type?: "income" | "expense";
  category?: string;
  department?: string;
  counterparty?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  groupBy?: "category" | "department" | "month" | "none";
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
  limit?: number;
}

export interface StatsResult {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  count: number;
}

const DATA_PATH = process.env.DATA_PATH ?? "data/transactions.json";

let cachedData: Transaction[] | null = null;

function loadData(): Transaction[] {
  if (cachedData) return cachedData;

  if (!existsSync(DATA_PATH)) {
    const dir = DATA_PATH.substring(0, DATA_PATH.lastIndexOf("/"));
    if (dir && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const data = generateTransactions();
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    console.log(`Generated ${data.length} seed transactions`);
    cachedData = data;
    return data;
  }

  const raw = readFileSync(DATA_PATH, "utf-8");
  cachedData = JSON.parse(raw) as Transaction[];
  return cachedData;
}

export function getAll(params: {
  query?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
}): Transaction[] {
  let data = loadData();

  if (params.query) {
    const q = params.query.toLowerCase();
    data = data.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.counterparty.toLowerCase().includes(q),
    );
  }
  if (params.type === "income" || params.type === "expense") {
    data = data.filter((t) => t.type === params.type);
  }

  const orderCol = params.sortBy === "amount" ? "amount" : "date";
  const orderDir = params.sortOrder === "asc" ? 1 : -1;

  data.sort((a, b) => {
    if (orderCol === "amount") return (a.amount - b.amount) * orderDir;
    return a.date.localeCompare(b.date) * orderDir;
  });

  const limit = params.limit ?? 500;
  return data.slice(0, limit);
}

export function searchTransactions(params: SearchParams): {
  transactions: Transaction[];
  total: number;
  stats?: StatsResult;
  breakdown?: { label: string; income: number; expense: number; count: number }[];
} {
  let data = loadData();

  if (params.query) {
    const q = params.query.toLowerCase();
    data = data.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.counterparty.toLowerCase().includes(q),
    );
  }
  if (params.type) data = data.filter((t) => t.type === params.type);
  if (params.category) data = data.filter((t) => t.category === params.category);
  if (params.department) data = data.filter((t) => t.department === params.department);
  if (params.counterparty) {
    const q = params.counterparty.toLowerCase();
    data = data.filter((t) => t.counterparty.toLowerCase().includes(q));
  }
  if (params.minAmount !== undefined) data = data.filter((t) => t.amount >= params.minAmount!);
  if (params.maxAmount !== undefined) data = data.filter((t) => t.amount <= params.maxAmount!);
  if (params.startDate) data = data.filter((t) => t.date >= params.startDate!);
  if (params.endDate) data = data.filter((t) => t.date <= params.endDate!);

  const total = data.length;

  const orderCol = params.sortBy === "amount" ? "amount" : "date";
  const orderDir = params.sortOrder === "desc" ? -1 : 1;

  data.sort((a, b) => {
    if (orderCol === "amount") return (a.amount - b.amount) * orderDir;
    return a.date.localeCompare(b.date) * orderDir;
  });

  const limit = params.limit ?? 50;
  const transactions = data.slice(0, limit);

  let stats: StatsResult | undefined;
  let breakdown:
    | { label: string; income: number; expense: number; count: number }[]
    | undefined;

  if (total >= 3 && !params.groupBy) {
    const totalIncome = data
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = data
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    stats = {
      totalIncome,
      totalExpense,
      netAmount: totalIncome - totalExpense,
      count: total,
    };
  }

  if (params.groupBy && params.groupBy !== "none") {
    const groups = new Map<string, { income: number; expense: number; count: number }>();

    for (const t of data) {
      const label =
        params.groupBy === "month"
          ? t.date.substring(0, 7)
          : t[params.groupBy as keyof Transaction] as string;

      const existing = groups.get(label) ?? { income: 0, expense: 0, count: 0 };
      if (t.type === "income") existing.income += t.amount;
      else existing.expense += t.amount;
      existing.count++;
      groups.set(label, existing);
    }

    breakdown = Array.from(groups.entries())
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  return { transactions, total, stats, breakdown };
}
