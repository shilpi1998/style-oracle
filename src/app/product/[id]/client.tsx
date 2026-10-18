"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { ChevronRight, ShoppingBag, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product/product-card";
import { Price } from "@/components/product/price";
import { useCart } from "@/lib/cart-context";
import { getProductById, products } from "@/data/products";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
        <Link href="/" className="text-violet-600 hover:underline">Back to Home</Link>
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
  const [activeImage, setActiveImage] = useState(0);

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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/category/${product.subcategory}`} className="hover:text-violet-600 capitalize">
            {product.subcategory.replace(/-/g, " ")}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-2xl bg-gray-50 flex items-center justify-center relative overflow-hidden">
              {product.images.length > 0 ? (
                <img
                  src={product.images[activeImage] ?? product.images[0]}
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
                <Badge className="absolute top-4 right-4 bg-violet-600">Try On Available</Badge>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`w-20 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === i ? "border-violet-600" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.occasion.slice(0, 3).map((occ) => (
                  <Badge key={occ} variant="secondary" className="capitalize text-xs">
                    {occ.replace("-", " ")}
                  </Badge>
                ))}
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-600 mb-1">{product.brand}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <Price product={product} size="lg" />
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>

            <Separator />

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors capitalize ${
                      (selectedColor || product.colors[0]) === color
                        ? "border-violet-600 bg-violet-50 text-violet-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-12 h-12 px-3 text-sm rounded-lg border transition-colors font-medium ${
                      (selectedSize || product.sizes[0]) === size
                        ? "border-violet-600 bg-violet-50 text-violet-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button
                size="lg"
                className={`flex-1 text-base ${addedToCart ? "bg-green-600 hover:bg-green-700" : "bg-violet-600 hover:bg-violet-700"}`}
                onClick={handleAddToCart}
              >
                {addedToCart ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              {product.tryOnCompatible && (
                <Link href={`/style-studio?product=${product.id}`}>
                  <Button size="lg" variant="outline" className="text-base">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Try in Style Studio
                  </Button>
                </Link>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <h3 className="font-medium text-gray-900 text-sm">Product Details</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">Brand</span>
                <span className="text-gray-900">{product.brand}</span>
                {Object.entries(product.attributes).map(([label, value]) => (
                  <Fragment key={label}>
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-900">{value}</span>
                  </Fragment>
                ))}
                {!("Pattern" in product.attributes) && (
                  <>
                    <span className="text-gray-500">Pattern</span>
                    <span className="text-gray-900 capitalize">{product.pattern.replace(/-/g, " ")}</span>
                  </>
                )}
              </div>
              {product.care && (
                <div className="pt-2 text-sm">
                  <h4 className="font-medium text-gray-900 mb-1">Care</h4>
                  <p className="text-gray-600">{product.care}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs capitalize">
                    {tag.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
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
