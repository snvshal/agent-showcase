import type { Transaction } from "./data"

const departments = [
  "Engineering",
  "Sales",
  "Marketing",
  "Operations",
  "HR",
  "Finance",
  "Product",
  "Legal",
]

const paymentMethods = ["Bank Transfer", "Credit Card", "ACH", "Check", "Wire Transfer"]

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

const incomeTemplates = [
  {
    cat: "Consulting",
    desc: "Client payment — Q{q} consulting",
    min: 12000,
    max: 65000,
    dept: "Sales",
  },
  {
    cat: "Consulting",
    desc: "Enterprise strategy advisory fee",
    min: 15000,
    max: 48000,
    dept: "Sales",
  },
  {
    cat: "Consulting",
    desc: "Technical architecture consulting engagement",
    min: 20000,
    max: 75000,
    dept: "Engineering",
  },
  {
    cat: "Subscriptions",
    desc: "SaaS platform monthly recurring revenue",
    min: 18000,
    max: 38000,
    dept: "Sales",
  },
  {
    cat: "Subscriptions",
    desc: "Enterprise annual license renewal",
    min: 25000,
    max: 95000,
    dept: "Sales",
  },
  {
    cat: "Subscriptions",
    desc: "Tier-1 subscription seat expansion",
    min: 8000,
    max: 24000,
    dept: "Customer Success",
  },
  {
    cat: "Product Sales",
    desc: "Custom software license delivery",
    min: 10000,
    max: 45000,
    dept: "Product",
  },
  {
    cat: "Product Sales",
    desc: "High-volume API usage billing",
    min: 3500,
    max: 14500,
    dept: "Engineering",
  },
  {
    cat: "Partnerships",
    desc: "Global partner referral commission",
    min: 4000,
    max: 18000,
    dept: "Marketing",
  },
  {
    cat: "Partnerships",
    desc: "Co-marketing revenue share payout",
    min: 5000,
    max: 22000,
    dept: "Marketing",
  },
  {
    cat: "Investments",
    desc: "Corporate treasury bill yield",
    min: 1200,
    max: 4800,
    dept: "Finance",
  },
  {
    cat: "Investments",
    desc: "Money market fund dividend distribution",
    min: 800,
    max: 3500,
    dept: "Finance",
  },
  {
    cat: "Grants & Subsidies",
    desc: "Government R&D tax credit disbursement",
    min: 20000,
    max: 60000,
    dept: "Finance",
  },
  {
    cat: "Training & Workshops",
    desc: "Corporate AI & Cloud workshop delivery",
    min: 6000,
    max: 16000,
    dept: "Operations",
  },
]

const expenseTemplates = [
  {
    cat: "Payroll",
    desc: "Full-time employee salaries — {month} {year}",
    min: 45000,
    max: 68000,
    dept: "HR",
  },
  {
    cat: "Payroll",
    desc: "Specialist contractor & contractor payouts",
    min: 8000,
    max: 24000,
    dept: "Engineering",
  },
  {
    cat: "Payroll",
    desc: "Quarterly performance bonuses — {month} {year}",
    min: 12000,
    max: 28000,
    dept: "HR",
  },
  {
    cat: "Rent",
    desc: "HQ office lease — {month} {year}",
    min: 5500,
    max: 7500,
    dept: "Operations",
  },
  {
    cat: "Rent",
    desc: "Regional satellite co-working spaces",
    min: 1200,
    max: 3200,
    dept: "Operations",
  },
  {
    cat: "Cloud Infrastructure",
    desc: "Cloud compute & database clusters (AWS)",
    min: 6500,
    max: 16500,
    dept: "Engineering",
  },
  {
    cat: "Cloud Infrastructure",
    desc: "Multi-region replication & storage (GCP)",
    min: 3000,
    max: 9500,
    dept: "Engineering",
  },
  {
    cat: "Software",
    desc: "Developer tools & CI/CD pipeline licenses",
    min: 1500,
    max: 4800,
    dept: "Engineering",
  },
  {
    cat: "Software",
    desc: "Productivity & collaboration SaaS suite",
    min: 1200,
    max: 3800,
    dept: "Operations",
  },
  {
    cat: "Software",
    desc: "AI model API usage & token compute",
    min: 2500,
    max: 11000,
    dept: "Product",
  },
  {
    cat: "Marketing",
    desc: "Search engine & paid acquisition campaign",
    min: 3500,
    max: 9000,
    dept: "Marketing",
  },
  {
    cat: "Marketing",
    desc: "Global industry summit booth sponsorship",
    min: 6000,
    max: 18000,
    dept: "Marketing",
  },
  {
    cat: "Marketing",
    desc: "Content syndication & video production",
    min: 2000,
    max: 6500,
    dept: "Marketing",
  },
  {
    cat: "Travel",
    desc: "Executive & engineering offsite summit travel",
    min: 3500,
    max: 12500,
    dept: "Operations",
  },
  {
    cat: "Travel",
    desc: "Client on-site pitch & partnership travel",
    min: 1200,
    max: 5500,
    dept: "Sales",
  },
  {
    cat: "Hardware & Equipment",
    desc: "High-spec developer laptop fleet refresh",
    min: 4000,
    max: 16000,
    dept: "Engineering",
  },
  {
    cat: "Office",
    desc: "Workspace supplies, monitors & ergonomics",
    min: 800,
    max: 3200,
    dept: "Operations",
  },
  {
    cat: "Utilities",
    desc: "Fiber gigabit internet & telephony",
    min: 600,
    max: 1900,
    dept: "Operations",
  },
  {
    cat: "Insurance",
    desc: "Comprehensive group healthcare premiums",
    min: 4500,
    max: 7800,
    dept: "HR",
  },
  {
    cat: "Insurance",
    desc: "Cyber risk & commercial liability policy",
    min: 1500,
    max: 3600,
    dept: "Finance",
  },
  {
    cat: "Professional Services",
    desc: "Outside legal counsel & IP retainers",
    min: 2500,
    max: 9500,
    dept: "Legal",
  },
  {
    cat: "Professional Services",
    desc: "Quarterly tax accounting & audit review",
    min: 3000,
    max: 8500,
    dept: "Finance",
  },
  {
    cat: "Security & Compliance",
    desc: "SOC2 Type II external compliance audit",
    min: 8000,
    max: 22000,
    dept: "Engineering",
  },
  {
    cat: "Recruiting & HR",
    desc: "Technical recruiter search & placement fee",
    min: 5000,
    max: 18000,
    dept: "HR",
  },
]

const categoryCounterparties: Record<string, string[]> = {
  Consulting: [
    "McKinsey Digital",
    "Deloitte Consulting",
    "PwC Strategy",
    "Accenture",
    "Bain & Company",
    "Boston Consulting Group",
  ],
  Subscriptions: [
    "Enterprise Clients",
    "Monthly Subscribers",
    "Annual Subscribers",
    "Apex Global",
    "SaaS Consortium",
  ],
  "Product Sales": [
    "Acme Corp",
    "Globex Inc",
    "Initech",
    "Hooli",
    "Stark Industries",
    "Wayne Enterprises",
    "Oscorp",
    "Cyberdyne Systems",
    "Umbrella Corp",
    "Massive Dynamic",
    "Pied Piper",
  ],
  Partnerships: [
    "Tech Partners Inc",
    "Solution Resellers",
    "Channel Partners Global",
    "Cloud Alliance Network",
  ],
  Investments: [
    "US Treasury Bills",
    "Vanguard Treasury Fund",
    "Fidelity Money Market",
    "Corporate Yield Portfolio",
  ],
  "Grants & Subsidies": [
    "National Science Foundation",
    "State Innovation Authority",
    "Clean Tech Initiative Fund",
  ],
  "Training & Workshops": [
    "Enterprise AI Institute",
    "DevAcademy Guild",
    "Fortune 500 Workforce Summit",
  ],
  Payroll: [
    "Direct Deposit / Employees",
    "Contractors International",
    "Engineering Staff Payouts",
    "Gusto Payroll",
  ],
  Rent: [
    "Property Management LLC",
    "WeWork Global",
    "Regus Business Centers",
    "Beacon Capital Partners",
  ],
  "Cloud Infrastructure": [
    "Amazon Web Services",
    "Google Cloud Platform",
    "Microsoft Azure",
    "Cloudflare Networks",
  ],
  Software: [
    "GitHub Enterprise",
    "Datadog Inc",
    "Atlassian JIRA",
    "Slack Technologies",
    "Linear Software",
    "Vercel Inc",
    "OpenAI Platform",
    "Figma Design",
    "Snowflake Data",
  ],
  Marketing: [
    "Google Ads",
    "Meta Platforms Ads",
    "LinkedIn Marketing Solutions",
    "HubSpot",
    "Marketo",
    "G2 Crowd",
  ],
  Travel: [
    "Delta Air Lines",
    "United Airlines",
    "American Airlines",
    "Marriott Hotels",
    "Hilton Worldwide",
    "Airbnb for Work",
  ],
  "Hardware & Equipment": ["Apple Inc", "Dell Technologies", "B&H Photo Video", "CDW Corporation"],
  Office: ["Amazon Business", "Staples Supplies", "Herman Miller Workspaces", "IKEA Business"],
  Utilities: ["PowerGrid Metro", "Comcast Business", "AT&T Business Fiber", "ConEdison"],
  Insurance: [
    "BlueCross BlueShield",
    "Aetna Health",
    "MetLife Group",
    "Travelers Commercial Insurance",
  ],
  "Professional Services": [
    "Lawson & Associates LLP",
    "PricewaterhouseCoopers",
    "KPMG Audit & Assurance",
    "Deloitte Tax LLP",
    "Ernst & Young",
  ],
  "Security & Compliance": [
    "Vanta Security",
    "Bishop Fox Testing",
    "CrowdStrike Cybersecurity",
    "Okta Identity",
  ],
  "Recruiting & HR": [
    "Hired Inc",
    "LinkedIn Recruiter Enterprise",
    "Robert Half Technology",
    "Turing Talent",
  ],
}

const incomeCounterparties = [
  "Acme Corp",
  "Globex Inc",
  "Initech",
  "Hooli",
  "Stark Industries",
  "Wayne Enterprises",
  "Oscorp",
  "Cyberdyne Systems",
  "Umbrella Corp",
  "Massive Dynamic",
  "Pied Piper",
  "Soylent Corp",
  "Aperture Science",
  "Enterprise Clients",
  "Monthly Subscribers",
  "Annual Subscribers",
  "McKinsey Digital",
  "Deloitte Consulting",
  "PwC Strategy",
  "Accenture",
]

const sampleNotes = [
  "Invoice verified and cleared by accounting",
  "Approved under Q{q} operating budget",
  "Contract PO #{po}",
  "Recurring monthly billing cycle",
  "Annual renewal discount applied",
  "Milestone delivery sign-off completed",
  "Direct deposit executed via ACH batch",
  "Priority delivery expedited",
  "Cross-department shared expense",
  "Wire transfer reference #{ref}",
]

function getNote(q: number, id: number): string {
  const template = rand(sampleNotes)
  return template
    .replace("{q}", String(q))
    .replace("{po}", String(2025000 + id * 17))
    .replace("{ref}", String(800000 + id * 23))
}

export function generateTransactions(): Transaction[] {
  const records: Transaction[] = []
  let id = 1
  const year = 2025
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = new Date(year, month, 0).getDate()
    const quarter = Math.ceil(month / 3)
    const monthName = monthNames[month - 1]

    // 4 to 6 income transactions per month
    const incomeCount = 4 + Math.floor(Math.random() * 3)
    for (let i = 0; i < incomeCount; i++) {
      const template = rand(incomeTemplates)
      const day = Math.min(1 + Math.floor(Math.random() * 28), daysInMonth)
      const counterpartyList = categoryCounterparties[template.cat] || incomeCounterparties
      const currentId = id++

      records.push({
        id: currentId,
        date: formatDate(year, month, day),
        description: template.desc
          .replace("{q}", String(quarter))
          .replace("{month}", monthName)
          .replace("{year}", String(year)),
        type: "income",
        category: template.cat,
        amount: randBetween(template.min, template.max),
        department: template.dept || rand(departments),
        payment_method: rand(paymentMethods),
        counterparty: rand(counterpartyList),
        notes: getNote(quarter, currentId),
      })
    }

    // 9 to 13 expense transactions per month
    const expenseCount = 9 + Math.floor(Math.random() * 5)
    for (let i = 0; i < expenseCount; i++) {
      const template = rand(expenseTemplates)
      const day = Math.min(1 + Math.floor(Math.random() * 28), daysInMonth)
      const events = [
        "Executive Leadership QBR",
        "Engineering Hackathon Summit",
        "Global Sales Kickoff",
        "Customer Advisory Board",
        "TechCon Industry Expo",
      ]
      const counterpartyList = categoryCounterparties[template.cat] || ["Premier Vendor Network"]
      const currentId = id++

      records.push({
        id: currentId,
        date: formatDate(year, month, day),
        description: template.desc
          .replace("{month}", monthName)
          .replace("{year}", String(year))
          .replace("{event}", rand(events)),
        type: "expense",
        category: template.cat,
        amount: randBetween(template.min, template.max),
        department: template.dept || rand(departments),
        payment_method: rand(paymentMethods),
        counterparty: rand(counterpartyList),
        notes: getNote(quarter, currentId),
      })
    }
  }

  records.sort((a, b) => a.date.localeCompare(b.date))
  // Re-index IDs consecutively after sorting by date
  return records.map((t, idx) => ({
    ...t,
    id: idx + 1,
  }))
}
