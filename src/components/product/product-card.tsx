"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: Product }) {
  const hasImage = product.images.length > 0;

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 mb-3">
        {hasImage ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {product.tryOnCompatible && (
          <Badge className="absolute top-2 right-2 bg-violet-600 text-xs">
            Try On
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {product.colors.slice(0, 3).map((color) => (
            <span key={color} className="text-xs text-gray-500 capitalize">
              {color}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
