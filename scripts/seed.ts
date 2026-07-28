import { generateTransactions } from "../lib/seed";
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";

const dataDir = process.env.DATA_PATH ?? "data/transactions.json";
const dir = dataDir.substring(0, dataDir.lastIndexOf("/"));
if (dir && !existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

if (existsSync(dataDir)) {
  const content = readFileSync(dataDir, "utf-8");
  const existing = JSON.parse(content);
  if (existing.length > 0) {
    console.log(`Data file already has ${existing.length} records.`);
    process.exit(0);
  }
}

const transactions = generateTransactions();
writeFileSync(dataDir, JSON.stringify(transactions, null, 2));
console.log(`Written ${transactions.length} transactions to ${dataDir}`);
