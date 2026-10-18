import { NextRequest, NextResponse } from "next/server";
import { semanticSearch } from "@/lib/vertex-search";
import { searchProducts } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams.get("q") || "";
  if (!query.trim()) return NextResponse.json([]);

  try {
    const results = await semanticSearch(query, 12);
    if (results.length > 0) return NextResponse.json(results);
  } catch (e) {
    console.warn("Vertex AI Search fallback:", e);
  }

  const results = await searchProducts(query);
  return NextResponse.json(results);
}
