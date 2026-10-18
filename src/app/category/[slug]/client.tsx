"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
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

const TOP_LEVEL = ["women", "men", "accessories", "footwear"] as const;

const parentDisplayNames: Record<string, string> = {
  women: "Women",
  men: "Men",
  accessories: "Accessories",
  footwear: "Footwear",
};

function getParentCategory(slug: string): string {
  if (slug.startsWith("women-")) return "women";
  if (slug.startsWith("men-")) return "men";
  if (slug.startsWith("accessories-")) return "accessories";
  if (slug.startsWith("footwear-")) return "footwear";
  return slug;
}

export function CategoryPageClient({ slug }: { slug: string }) {
  const isTopLevel = (TOP_LEVEL as readonly string[]).includes(slug);
  const parentCategory = isTopLevel ? slug : getParentCategory(slug);

  const subcategoriesForParent = categories.filter((c) => {
    if (parentCategory === "accessories") return c.slug.startsWith("accessories-");
    if (parentCategory === "footwear") return c.slug.startsWith("footwear-");
    return c.slug.startsWith(parentCategory + "-");
  });

  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    isTopLevel ? null : slug
  );
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);

  const categoryProducts = useMemo(() => {
    let filtered: typeof products;

    if (isTopLevel) {
      filtered = products.filter((p) => p.category === parentCategory);
      if (activeSubcategory) {
        filtered = filtered.filter((p) => p.subcategory === activeSubcategory);
      }
    } else {
      filtered = products.filter((p) => p.subcategory === slug);
    }

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
  }, [slug, isTopLevel, parentCategory, activeSubcategory, sortBy, selectedColors, selectedOccasions, priceRange]);

  const allCount = products.filter((p) => p.category === parentCategory).length;

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

  const displayName = isTopLevel
    ? activeSubcategory
      ? categories.find((c) => c.slug === activeSubcategory)?.name || activeSubcategory
      : parentDisplayNames[parentCategory] || parentCategory
    : categories.find((c) => c.slug === slug)?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-smoke mb-8">
          <Link href="/" className="hover:text-gold-dark transition-colors" data-testid="category-breadcrumb-home">Home</Link>
          <ChevronRight className="h-3 w-3 text-smoke/50" />
          {isTopLevel ? (
            <>
              {activeSubcategory ? (
                <>
                  <button
                    onClick={() => setActiveSubcategory(null)}
                    className="hover:text-gold-dark transition-colors"
                  >
                    {parentDisplayNames[parentCategory]}
                  </button>
                  <ChevronRight className="h-3 w-3 text-smoke/50" />
                  <span className="text-ink">
                    {categories.find((c) => c.slug === activeSubcategory)?.name}
                  </span>
                </>
              ) : (
                <span className="text-ink">{parentDisplayNames[parentCategory]}</span>
              )}
            </>
          ) : (
            <>
              <Link href={`/category/${parentCategory}`} className="hover:text-gold-dark transition-colors">
                {parentDisplayNames[parentCategory]}
              </Link>
              <ChevronRight className="h-3 w-3 text-smoke/50" />
              <span className="text-ink">{displayName}</span>
            </>
          )}
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-8 pb-6 border-b border-hairline">
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl tracking-tight text-ink">
              {displayName}
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-smoke mt-2">
              {categoryProducts.length} pieces
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden border-ink text-ink hover:bg-ink hover:text-cream rounded-none sm:rounded-sm"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="category-filters-toggle"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Select value={sortBy} onValueChange={(v) => { if (v) setSortBy(v); }}>
              <SelectTrigger className="w-44 h-9 text-xs font-mono uppercase tracking-wider bg-white border-hairline" data-testid="category-sort-select">
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

        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-60 shrink-0 space-y-6`}>
            {/* Subcategory list — only on top-level pages */}
            {isTopLevel && (
              <div className="bg-white border border-hairline p-5">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-dark mb-3">Categories</h3>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setActiveSubcategory(null)}
                    data-testid="category-subcategory-all"
                    className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between border-l-2 ${
                      !activeSubcategory
                        ? "border-gold bg-parchment text-ink font-medium"
                        : "border-transparent text-smoke hover:bg-parchment/60"
                    }`}
                  >
                    <span>All</span>
                    <span className="font-mono text-[10px] text-smoke/60">{allCount}</span>
                  </button>
                  {subcategoriesForParent.map((sub) => {
                    const count = products.filter((p) => p.subcategory === sub.slug).length;
                    return (
                      <button
                        key={sub.slug}
                        onClick={() => setActiveSubcategory(sub.slug)}
                        data-testid={`category-subcategory-${sub.slug}`}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between border-l-2 ${
                          activeSubcategory === sub.slug
                            ? "border-gold bg-parchment text-ink font-medium"
                            : "border-transparent text-smoke hover:bg-parchment/60"
                        }`}
                      >
                        <span>{sub.name}</span>
                        <span className="font-mono text-[10px] text-smoke/60">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filters — always shown */}
            <div className="bg-white border border-hairline p-5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-dark">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="font-mono text-[10px] uppercase tracking-wider text-gold-dark underline underline-offset-2 hover:text-gold"
                    data-testid="category-clear-filters"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Price */}
              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.15em] text-smoke mb-2.5">Price Range</h4>
                <div className="flex gap-2">
                  <select
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full text-xs border border-hairline bg-white px-2 py-2 focus:border-gold outline-none"
                    data-testid="category-price-min-select"
                  >
                    <option value={0}>₹0</option>
                    <option value={1000}>₹1,000</option>
                    <option value={2000}>₹2,000</option>
                    <option value={3000}>₹3,000</option>
                    <option value={5000}>₹5,000</option>
                  </select>
                  <span className="text-smoke/50 self-center">—</span>
                  <select
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full text-xs border border-hairline bg-white px-2 py-2 focus:border-gold outline-none"
                    data-testid="category-price-max-select"
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
                <h4 className="font-mono text-[10px] uppercase tracking-[0.15em] text-smoke mb-2.5">Colors</h4>
                <div className="flex flex-wrap gap-1.5">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      data-testid={`category-color-filter-${color}`}
                      className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                        selectedColors.includes(color)
                          ? "bg-ink text-cream border-ink"
                          : "bg-white text-smoke border-hairline hover:border-gold"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion */}
              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.15em] text-smoke mb-2.5">Occasion</h4>
                <div className="flex flex-wrap gap-1.5">
                  {occasionOptions.map((occ) => (
                    <button
                      key={occ}
                      onClick={() => toggleOccasion(occ)}
                      data-testid={`category-occasion-filter-${occ}`}
                      className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                        selectedOccasions.includes(occ)
                          ? "bg-ink text-cream border-ink"
                          : "bg-white text-smoke border-hairline hover:border-gold"
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
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedColors.map((c) => (
                  <Badge
                    key={c}
                    variant="secondary"
                    className="gap-1 font-mono text-[10px] uppercase tracking-wider bg-parchment text-ink border border-hairline cursor-pointer hover:border-gold"
                    onClick={() => toggleColor(c)}
                    data-testid={`category-active-color-${c}`}
                  >
                    {c} <X className="h-3 w-3" />
                  </Badge>
                ))}
                {selectedOccasions.map((o) => (
                  <Badge
                    key={o}
                    variant="secondary"
                    className="gap-1 font-mono text-[10px] uppercase tracking-wider bg-parchment text-ink border border-hairline cursor-pointer hover:border-gold"
                    onClick={() => toggleOccasion(o)}
                    data-testid={`category-active-occasion-${o}`}
                  >
                    {o.replace("-", " ")} <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}

            {categoryProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:gap-8">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="font-heading text-2xl italic tracking-tight text-ink/70 mb-3">
                  Nothing matches your filters
                </p>
                <p className="text-smoke text-sm mb-6">Adjust the filters to see more pieces.</p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-ink text-ink hover:bg-ink hover:text-cream rounded-none sm:rounded-md"
                  data-testid="category-empty-clear-button"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
