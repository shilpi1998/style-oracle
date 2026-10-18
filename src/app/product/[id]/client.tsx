"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, ShoppingBag, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product/product-card";
import { useCart } from "@/lib/cart-context";
import { getProductById, products } from "@/data/products";

function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-heading text-3xl tracking-tight text-ink mb-3">Piece Not Found</h1>
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.15em] text-gold-dark underline underline-offset-4 hover:text-gold" data-testid="product-notfound-home-link">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export function ProductDetailClient({ id }: { id: string }) {
  const product = getProductById(id);
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) return <NotFound />;

  const p = product; // narrowed to Product

  const relatedProducts = products
    .filter((r) => r.subcategory === p.subcategory && r.id !== p.id)
    .slice(0, 4);

  function handleAddToCart() {
    const size = selectedSize || p.sizes[0];
    const color = selectedColor || p.colors[0];
    addItem(p, size, color);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-smoke mb-10">
          <Link href="/" className="hover:text-gold-dark transition-colors" data-testid="product-breadcrumb-home">Home</Link>
          <ChevronRight className="h-3 w-3 text-smoke/50" />
          <Link href={`/category/${product.subcategory}`} className="hover:text-gold-dark transition-colors">
            {product.subcategory.replace(/-/g, " ")}
          </Link>
          <ChevronRight className="h-3 w-3 text-smoke/50" />
          <span className="text-ink line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Placard image */}
          <div>
            <div className="aspect-[3/4] bg-parchment border border-hairline relative overflow-hidden sticky top-24">
              {product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8">
                  <span className="text-6xl">
                    {product.category === "women" ? "👗" : product.category === "men" ? "👔" : product.category === "footwear" ? "👟" : "💎"}
                  </span>
                </div>
              )}
              {product.tryOnCompatible && (
                <span className="absolute top-4 right-4 bg-ink text-cream font-mono text-[9px] uppercase tracking-[0.18em] px-2.5 py-1.5">
                  Try On Available
                </span>
              )}
            </div>
          </div>

          {/* Placard details */}
          <div className="space-y-7">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {product.occasion.slice(0, 3).map((occ) => (
                  <Badge
                    key={occ}
                    variant="secondary"
                    className="font-mono text-[10px] uppercase tracking-[0.12em] bg-parchment text-gold-dark border border-hairline"
                  >
                    {occ.replace("-", " ")}
                  </Badge>
                ))}
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl tracking-tight leading-[1.1] text-ink mb-4">
                {product.name}
              </h1>
              <p className="font-mono text-2xl tracking-tight text-ink">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            </div>

            <Separator className="bg-hairline" />

            <p className="text-smoke leading-relaxed">{product.description}</p>

            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-smoke mb-3">Color</h3>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    data-testid={`product-color-${color}`}
                    className={`px-4 py-2 text-sm border transition-colors capitalize ${
                      (selectedColor || product.colors[0]) === color
                        ? "border-gold bg-parchment text-ink"
                        : "border-hairline bg-white text-smoke hover:border-gold/50"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-smoke mb-3">Size</h3>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    data-testid={`product-size-${size.toLowerCase()}`}
                    className={`w-12 h-12 font-mono text-sm border transition-colors ${
                      (selectedSize || product.sizes[0]) === size
                        ? "border-gold bg-parchment text-ink"
                        : "border-hairline bg-white text-smoke hover:border-gold/50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-hairline" />

            <div className="flex gap-3">
              <Button
                size="lg"
                className={`flex-1 h-14 text-base font-medium tracking-wide rounded-none sm:rounded-md shadow-md ${
                  addedToCart
                    ? "bg-forest text-white hover:bg-forest/90"
                    : "bg-ink text-cream hover:bg-ink-soft"
                }`}
                onClick={handleAddToCart}
                data-testid="product-add-to-cart-button"
              >
                {addedToCart ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Add to Bag
                  </>
                )}
              </Button>
            </div>

            {product.tryOnCompatible && (
              <Link href={`/style-studio?product=${product.id}`} className="block">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-12 text-sm tracking-wide border-gold text-gold-dark hover:bg-gold hover:text-white rounded-none sm:rounded-md"
                  data-testid="product-try-studio-button"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try in Style Studio
                </Button>
              </Link>
            )}

            <div className="bg-parchment border border-hairline p-6 space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-gold-dark">Product Details</h3>
              <div className="grid grid-cols-2 gap-y-2.5 text-sm">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-smoke">Category</span>
                <span className="text-ink capitalize">{product.category}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-smoke">Pattern</span>
                <span className="text-ink capitalize">{product.pattern}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-smoke">Style</span>
                <span className="text-ink capitalize">{product.style.join(", ")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="font-mono text-[10px] uppercase tracking-wider border-hairline text-smoke"
                  >
                    {tag.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <div className="flex items-end justify-between mb-10 pb-5 border-b border-hairline">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-dark mb-3">
                  Complete the Look
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl tracking-tight text-ink">
                  You Might Also Like
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
