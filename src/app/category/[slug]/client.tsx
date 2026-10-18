"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/data/products";
import { getCategoryBySlug } from "@/data/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const colorOptions = [
  "black", "white", "navy", "blue", "red", "green", "pink", "beige",
  "brown", "grey", "gold", "silver", "purple", "orange", "yellow",
];

const occasionOptions = [
  "casual", "office", "party", "dinner", "date-night", "wedding-guest",
  "beach", "vacation", "formal", "festive", "brunch",
];

export function CategoryPageClient({ slug }: { slug: string }) {
  const category = getCategoryBySlug(slug);

  const [sortBy, setSortBy] = useState("relevance");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  const categoryProducts = useMemo(() => {
    let filtered = products.filter((p) => p.subcategory === slug);

    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) =>
        selectedColors.some((c) => p.colors.some((pc) => pc.includes(c)))
      );
    }
    if (selectedOccasions.length > 0) {
      filtered = filtered.filter((p) =>
        selectedOccasions.some((o) => p.occasion.includes(o))
      );
    }
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case "price-asc":
        return [...filtered].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...filtered].sort((a, b) => b.price - a.price);
      default:
        return filtered;
    }
  }, [slug, sortBy, selectedColors, selectedOccasions, priceRange]);

  function toggleColor(color: string) {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  }

  function toggleOccasion(occ: string) {
    setSelectedOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  }

  function clearFilters() {
    setSelectedColors([]);
    setSelectedOccasions([]);
    setPriceRange([0, 10000]);
  }

  const hasActiveFilters =
    selectedColors.length > 0 || selectedOccasions.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000;

  const displayName = category?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{displayName}</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
            <p className="text-sm text-gray-500 mt-1">{categoryProducts.length} products</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Select value={sortBy} onValueChange={(v) => { if (v) setSortBy(v); }}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-56 shrink-0`}>
            <div className="bg-white rounded-xl p-5 shadow-sm space-y-6 sticky top-20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-violet-600 hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {/* Price */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-3">Price Range</h4>
                <div className="flex gap-2">
                  <select
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full text-sm border rounded px-2 py-1.5"
                  >
                    <option value={0}>₹0</option>
                    <option value={1000}>₹1,000</option>
                    <option value={2000}>₹2,000</option>
                    <option value={3000}>₹3,000</option>
                    <option value={5000}>₹5,000</option>
                  </select>
                  <span className="text-gray-400 self-center">-</span>
                  <select
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full text-sm border rounded px-2 py-1.5"
                  >
                    <option value={3000}>₹3,000</option>
                    <option value={5000}>₹5,000</option>
                    <option value={7000}>₹7,000</option>
                    <option value={10000}>₹10,000</option>
                  </select>
                </div>
              </div>

              {/* Colors */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-3">Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors capitalize ${
                        selectedColors.includes(color)
                          ? "bg-violet-600 text-white border-violet-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-3">Occasion</h4>
                <div className="flex flex-wrap gap-2">
                  {occasionOptions.map((occ) => (
                    <button
                      key={occ}
                      onClick={() => toggleOccasion(occ)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-colors capitalize ${
                        selectedOccasions.includes(occ)
                          ? "bg-violet-600 text-white border-violet-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
                      }`}
                    >
                      {occ.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedColors.map((c) => (
                  <Badge key={c} variant="secondary" className="gap-1 capitalize cursor-pointer" onClick={() => toggleColor(c)}>
                    {c} <X className="h-3 w-3" />
                  </Badge>
                ))}
                {selectedOccasions.map((o) => (
                  <Badge key={o} variant="secondary" className="gap-1 capitalize cursor-pointer" onClick={() => toggleOccasion(o)}>
                    {o.replace("-", " ")} <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}

            {categoryProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-4">No products found matching your filters.</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
