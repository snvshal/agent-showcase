import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";

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

const departments = [
  "Engineering",
  "Sales",
  "Marketing",
  "Operations",
  "HR",
  "Finance",
];
const paymentMethods = ["Bank Transfer", "Credit Card", "ACH", "Check", "Wire Transfer"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const incomeTemplates = [
  { cat: "Consulting", desc: "Client payment — Q{q} consulting", min: 5000, max: 50000 },
  { cat: "Consulting", desc: "Strategy advisory fee", min: 8000, max: 35000 },
  { cat: "Consulting", desc: "Technical consulting engagement", min: 10000, max: 60000 },
  { cat: "Subscriptions", desc: "SaaS platform revenue", min: 3000, max: 15000 },
  { cat: "Subscriptions", desc: "Enterprise license renewals", min: 5000, max: 25000 },
  { cat: "Subscriptions", desc: "Monthly subscription pool", min: 4000, max: 12000 },
  { cat: "Product Sales", desc: "Software license sale", min: 2000, max: 30000 },
  { cat: "Product Sales", desc: "API usage billing", min: 1000, max: 8000 },
  { cat: "Partnerships", desc: "Partner referral commission", min: 2000, max: 15000 },
  { cat: "Partnerships", desc: "Co-marketing revenue share", min: 3000, max: 10000 },
  { cat: "Investments", desc: "Interest income", min: 500, max: 3000 },
  { cat: "Investments", desc: "Dividend payment", min: 1000, max: 5000 },
];

const expenseTemplates = [
  { cat: "Payroll", desc: "Employee salaries — {month} {year}", min: 35000, max: 55000 },
  { cat: "Payroll", desc: "Contractor payments", min: 5000, max: 20000 },
  { cat: "Payroll", desc: "Bonuses — {month} {year}", min: 5000, max: 15000 },
  { cat: "Rent", desc: "Office rent — {month} {year}", min: 4000, max: 6000 },
  { cat: "Rent", desc: "Co-working space fees", min: 500, max: 2000 },
  { cat: "Software", desc: "Cloud infrastructure (AWS/GCP)", min: 2000, max: 8000 },
  { cat: "Software", desc: "SaaS tools subscription", min: 500, max: 3000 },
  { cat: "Software", desc: "Development tool licenses", min: 200, max: 2000 },
  { cat: "Marketing", desc: "Google Ads campaign", min: 1000, max: 5000 },
  { cat: "Marketing", desc: "Content marketing — blog/video", min: 500, max: 3000 },
  { cat: "Marketing", desc: "Conference sponsorship", min: 2000, max: 10000 },
  { cat: "Marketing", desc: "Social media advertising", min: 500, max: 4000 },
  { cat: "Travel", desc: "Team travel — {event}", min: 1000, max: 8000 },
  { cat: "Travel", desc: "Client visit expenses", min: 500, max: 3000 },
  { cat: "Office", desc: "Office supplies & equipment", min: 200, max: 2000 },
  { cat: "Office", desc: "Furniture & fixtures", min: 500, max: 5000 },
  { cat: "Utilities", desc: "Electricity & internet", min: 300, max: 1500 },
  { cat: "Utilities", desc: "Phone & communication", min: 200, max: 1000 },
  { cat: "Insurance", desc: "Health insurance premiums", min: 2000, max: 5000 },
  { cat: "Insurance", desc: "Liability insurance", min: 500, max: 2000 },
  { cat: "Professional Services", desc: "Legal retainers", min: 1000, max: 5000 },
  { cat: "Professional Services", desc: "Accounting & audit fees", min: 1000, max: 4000 },
  { cat: "Professional Services", desc: "External consulting", min: 3000, max: 10000 },
];

const categoryCounterparties: Record<string, string[]> = {
  Consulting: ["McKinsey Digital", "Deloitte Consulting", "PwC Strategy", "Accenture"],
  Subscriptions: ["Monthly Subscribers", "Enterprise Clients", "Annual Subscribers"],
  "Product Sales": ["Acme Corp", "Globex Inc", "Initech", "Hooli", "Stark Industries", "Wayne Enterprises", "Oscorp", "Cyberdyne Systems"],
  Partnerships: ["Tech Partners Inc", "Solution Resellers", "Channel Partners"],
  Investments: ["Treasury Bills", "Money Market Fund", "Corporate Bonds"],
  Payroll: ["Employees", "Contractors", "Staff"],
  Rent: ["Property Management LLC", "WeWork", "Regus"],
  Software: ["Amazon Web Services", "Google Cloud", "Microsoft Azure", "Datadog", "Atlassian", "Slack", "Linear", "Vercel"],
  Marketing: ["Google Ads", "Meta Platforms", "LinkedIn", "HubSpot", "MarketTo"],
  Travel: ["Delta Air Lines", "United Airlines", "Marriott", "Hilton", "Airbnb"],
  Office: ["Staples", "Amazon Business", "IKEA", "Herman Miller"],
  Utilities: ["PowerGrid Corp", "Comcast", "AT&T", "Verizon"],
  Insurance: ["BlueCross", "Aetna", "MetLife", "State Farm"],
  "Professional Services": ["Lawson & Associates", "Pricewaterhouse", "KPMG", "Deloitte Tax"],
};

const counterpartyIncome = ["Acme Corp", "Globex Inc", "Initech", "Hooli", "Stark Industries", "Wayne Enterprises", "Oscorp", "Cyberdyne Systems", "Monthly Subscribers", "Enterprise Clients", "Annual Subscribers", "McKinsey Digital", "Deloitte Consulting", "PwC Strategy", "Accenture"];

export function generateTransactions(): Transaction[] {
  const records: Transaction[] = [];
  let id = 1;

  for (let month = 1; month <= 6; month++) {
    const year = 2025;
    const daysInMonth = new Date(year, month, 0).getDate();

    const incomeCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < incomeCount; i++) {
      const template = rand(incomeTemplates);
      const day = Math.min(1 + Math.floor(Math.random() * 28), daysInMonth);
      records.push({
        id: id++,
        date: formatDate(year, month, day),
        description: template.desc.replace("{q}", String(Math.ceil(month / 3))),
        type: "income",
        category: template.cat,
        amount: randBetween(template.min, template.max),
        department: rand(departments),
        payment_method: rand(paymentMethods),
        counterparty: rand(counterpartyIncome),
        notes: "",
      });
    }

    const expenseCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < expenseCount; i++) {
      const template = rand(expenseTemplates);
      const day = Math.min(1 + Math.floor(Math.random() * 28), daysInMonth);
      const events = ["QBR summit", "team offsite", "customer meetings", "conference Q" + Math.ceil(month / 3)];
      records.push({
        id: id++,
        date: formatDate(year, month, day),
        description: template.desc
          .replace("{month}", ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][month - 1])
          .replace("{year}", String(year))
          .replace("{event}", rand(events)),
        type: "expense",
        category: template.cat,
        amount: randBetween(template.min, template.max),
        department: rand(departments),
        payment_method: rand(paymentMethods),
        counterparty: rand(categoryCounterparties[template.cat] ?? ["Vendor"]),
        notes: "",
      });
    }
  }

  records.sort((a, b) => a.date.localeCompare(b.date));
  return records;
}
