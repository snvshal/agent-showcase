import { getAll } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const data = getAll({
    query: searchParams.get("query") || undefined,
    type: searchParams.get("type") || undefined,
    sortBy: searchParams.get("sortBy") || "date",
    sortOrder: searchParams.get("sortOrder") || "desc",
    limit: Math.min(Number(searchParams.get("limit")) || 200, 500),
  });

  return Response.json(data);
}
