"use client";

import Link from "next/link";
import { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const hasImage = product.images.length > 0;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
      data-testid={`product-card-${product.id}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-parchment border border-hairline mb-3 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
        {hasImage ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-smoke/40">
            <div className="text-center p-4">
              <span className="text-4xl">
                {product.category === "women"
                  ? "👗"
                  : product.category === "men"
                    ? "👔"
                    : product.category === "footwear"
                      ? "👟"
                      : "💎"}
              </span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.tryOnCompatible && (
          <span className="absolute top-2.5 right-2.5 bg-ink text-cream font-mono text-[9px] uppercase tracking-[0.18em] px-2 py-1">
            Try On
          </span>
        )}
      </div>
      <div className="space-y-1 px-0.5">
        <h3 className="text-sm font-medium text-ink group-hover:text-gold-dark transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm tracking-tight text-ink">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <div className="flex gap-1.5">
            {product.colors.slice(0, 3).map((color) => (
              <span
                key={color}
                className="font-mono text-[10px] uppercase tracking-wider text-smoke/70"
              >
                {color}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
