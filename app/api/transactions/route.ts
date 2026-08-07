import { getAll } from "@/lib/data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const data = getAll({
      query: searchParams.get("query") || undefined,
      type: searchParams.get("type") || undefined,
      sortBy: searchParams.get("sortBy") || "date",
      sortOrder: searchParams.get("sortOrder") || "desc",
      limit: Math.min(Number(searchParams.get("limit")) || 200, 500),
    })

    return Response.json(data)
  } catch (error) {
    console.error("Failed to load transactions", error)
    return Response.json({ error: "Failed to load transactions" }, { status: 500 })
  }
}
