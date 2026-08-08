import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"

export interface PdfTable {
  headers: string[]
  rows: string[][]
}

export interface PdfSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  table?: PdfTable
}

export interface PdfDocumentSpec {
  title: string
  subtitle?: string
  author?: string
  accentColor?: string
  sections: PdfSection[]
}

const DEFAULT_ACCENT = "#2563eb"

function normalizeColor(color: string | undefined): string {
  if (typeof color !== "string") return DEFAULT_ACCENT
  const trimmed = color.trim()
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed : DEFAULT_ACCENT
}

const BASE_STYLES = {
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    backgroundColor: "#ffffff",
  },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 12, marginBottom: 4 },
  author: { fontSize: 10, marginBottom: 20 },
  sectionHeading: { fontSize: 15, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  rule: { height: 2, marginTop: 6, marginBottom: 16 },
  paragraph: { fontSize: 11, lineHeight: 1.6, marginBottom: 6 },
  bullet: { fontSize: 11, lineHeight: 1.6, marginBottom: 3, paddingLeft: 12 },
  table: {
    width: "100%",
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#cbd5e1",
  },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#cbd5e1" },
  tableRowLast: { borderBottomWidth: 0, borderBottomColor: "#ffffff" },
  tableHeaderCell: {
    flex: 1,
    padding: 6,
    fontSize: 10,
    fontWeight: 700,
    backgroundColor: "#f1f5f9",
  },
  tableCell: { flex: 1, padding: 6, fontSize: 10 },
} as const

function buildStyles(accent: string) {
  return StyleSheet.create({
    page: { ...BASE_STYLES.page },
    title: { ...BASE_STYLES.title, color: accent },
    subtitle: { ...BASE_STYLES.subtitle, color: "#334155" },
    author: { ...BASE_STYLES.author, color: "#64748b" },
    sectionHeading: { ...BASE_STYLES.sectionHeading, color: "#0f172a" },
    rule: { ...BASE_STYLES.rule, backgroundColor: accent },
    paragraph: { ...BASE_STYLES.paragraph, color: "#1e293b" },
    bullet: { ...BASE_STYLES.bullet, color: "#1e293b" },
    table: { ...BASE_STYLES.table },
    tableRow: { ...BASE_STYLES.tableRow },
    tableRowLast: { ...BASE_STYLES.tableRowLast },
    tableHeaderCell: { ...BASE_STYLES.tableHeaderCell, color: "#0f172a" },
    tableCell: { ...BASE_STYLES.tableCell, color: "#1e293b" },
  })
}

function renderSections(sections: PdfSection[], styles: ReturnType<typeof buildStyles>) {
  return sections
    .filter((section) => section.heading || section.paragraphs || section.bullets || section.table)
    .map((section) => {
      return (
        <View key={section.heading} wrap={false}>
          <Text style={styles.sectionHeading}>{section.heading}</Text>
          {section.paragraphs?.map((paragraph, i) => (
            <Text key={`${section.heading}-p${i}`} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
          {section.bullets?.map((bullet, i) => (
            <Text key={`${section.heading}-b${i}`} style={styles.bullet}>
              {"\u2022  "}
              {bullet}
            </Text>
          ))}
          {section.table ? (
            <View style={styles.table}>
              <View style={styles.tableRow}>
                {section.table.headers.map((header, i) => (
                  <View key={`${section.heading}-h${i}`} style={styles.tableHeaderCell}>
                    <Text>{header}</Text>
                  </View>
                ))}
              </View>
              {section.table.rows.map((row, rowIndex) => (
                <View
                  key={`${section.heading}-r${rowIndex}`}
                  style={
                    rowIndex === section.table!.rows.length - 1
                      ? [styles.tableRow, styles.tableRowLast]
                      : styles.tableRow
                  }
                >
                  {row.map((cell, cellIndex) => (
                    <View
                      key={`${section.heading}-c${rowIndex}-${cellIndex}`}
                      style={styles.tableCell}
                    >
                      <Text>{cell}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      )
    })
}

function buildDocument(spec: PdfDocumentSpec) {
  const accent = normalizeColor(spec.accentColor)
  const styles = buildStyles(accent)

  return (
    <Document
      title={spec.title}
      author={spec.author}
      subject={spec.subtitle}
      creator="Agent Showcase PDF Generator"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{spec.title}</Text>
        {spec.subtitle ? <Text style={styles.subtitle}>{spec.subtitle}</Text> : null}
        {spec.author ? <Text style={styles.author}>{spec.author}</Text> : null}
        <View style={styles.rule} />
        {renderSections(spec.sections, styles)}
      </Page>
    </Document>
  )
}

function sanitizeFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  return `${slug || "document"}.pdf`
}

export async function renderPdf(spec: PdfDocumentSpec): Promise<{ pdf: string; filename: string }> {
  const buffer = await renderToBuffer(buildDocument(spec))
  return { pdf: buffer.toString("base64"), filename: sanitizeFilename(spec.title) }
}
