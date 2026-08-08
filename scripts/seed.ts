import { generateTransactions } from "../lib/seed"
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs"
import path from "node:path"

const dataDir = process.env.DATA_PATH
  ? path.resolve(process.env.DATA_PATH)
  : path.join(process.cwd(), "data", "transactions.json")
const dir = path.dirname(dataDir)
if (dir && !existsSync(dir)) {
  mkdirSync(dir, { recursive: true })
}

if (existsSync(dataDir)) {
  const content = readFileSync(dataDir, "utf-8")
  const existing = JSON.parse(content)
  if (existing.length > 0) {
    console.log(`Data file already has ${existing.length} records.`)
    process.exit(0)
  }
}

const transactions = generateTransactions()
writeFileSync(dataDir, JSON.stringify(transactions, null, 2))
console.log(`Written ${transactions.length} transactions to ${dataDir}`)
