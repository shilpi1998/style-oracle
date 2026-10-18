import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/data/products";

export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams.get("q") || "";
  if (!query.trim()) return NextResponse.json([]);
  const results = searchProducts(query);
  return NextResponse.json(results);
}
