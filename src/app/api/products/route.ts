import { NextRequest, NextResponse } from "next/server";
import { filterProducts, getProductById } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");
  if (id) {
    const product = await getProductById(id);
    if (!product)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  }

  const results = await filterProducts({
    subcategory: searchParams.get("subcategory") || undefined,
    gender: searchParams.get("gender") || undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    colors: searchParams.get("colors")?.split(",") || undefined,
    occasion: searchParams.get("occasion")?.split(",") || undefined,
  });

  return NextResponse.json(results);
}
