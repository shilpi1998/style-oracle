import { Suspense } from "react";
import { CategoryPageClient } from "./client";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>}>
      <CategoryPageClient key={slug} slug={slug} />
    </Suspense>
  );
}
