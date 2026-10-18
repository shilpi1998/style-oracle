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
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 pb-6 border-b border-hairline">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-dark mb-3">
            The Archive
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl tracking-tight text-ink mb-2">
            {query ? (
              <>
                Results for <span className="italic text-gold">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              "Search the archive"
            )}
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-smoke">
            {results.length} pieces found
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Search className="h-10 w-10 text-hairline mx-auto mb-6" strokeWidth={1} />
            <h2 className="font-heading text-3xl tracking-tight text-ink mb-3">
              Nothing in the <span className="italic text-gold">archive</span>
            </h2>
            <p className="text-smoke mb-8 max-w-md mx-auto">
              Try a different search term, or ask Style Oracle for personalized
              recommendations.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/">
                <Button variant="outline" className="border-ink text-ink hover:bg-ink hover:text-cream rounded-none sm:rounded-md" data-testid="search-empty-browse-button">
                  Browse All
                </Button>
              </Link>
              <Button className="bg-ink text-cream hover:bg-ink-soft rounded-none sm:rounded-md" data-testid="search-empty-ask-button">
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="w-64 space-y-4">
            <div className="h-8 shimmer" />
            <div className="grid grid-cols-2 gap-6">
              <div className="aspect-[3/4] shimmer" />
              <div className="aspect-[3/4] shimmer" />
            </div>
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
