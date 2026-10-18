"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { searchProducts } from "@/data/products";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const results = query ? searchProducts(query) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Search results for &quot;{query}&quot;
          </h1>
          <p className="text-sm text-gray-500">{results.length} products found</p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">No products found</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Try a different search term, or ask Style Oracle for personalized recommendations.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/">
                <Button variant="outline">Browse All</Button>
              </Link>
              <Button className="bg-violet-600 hover:bg-violet-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask Style Oracle
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>}>
      <SearchResults />
    </Suspense>
  );
}
