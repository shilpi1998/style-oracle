import { Suspense } from "react";
import { ProductDetailClient } from "./client";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <ProductDetailClient id={id} />
    </Suspense>
  );
}
