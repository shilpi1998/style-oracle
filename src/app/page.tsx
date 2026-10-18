"use client";

import Link from "next/link";
import { Sparkles, MessageCircle, Eye, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/data/products";

const topCategories = [
  { name: "Women", slug: "women", image: "/images/categories/women-dresses.jpg" },
  { name: "Men", slug: "men", image: "/images/categories/men-shirts.jpg" },
  { name: "Accessories", slug: "accessories", image: "/images/categories/accessories-jewelry.jpg" },
  { name: "Footwear", slug: "footwear", image: "/images/categories/footwear-women.jpg" },
];

const steps = [
  {
    icon: MessageCircle,
    title: "Describe Your Vibe",
    description: "Tell our AI agent what you're looking for — an occasion, a mood, a budget. It understands natural language like a personal stylist.",
  },
  {
    icon: Eye,
    title: "See the Complete Look",
    description: "Style Studio generates a full outfit on a model using the exact products from our catalog. Not stock photos — your actual items.",
  },
  {
    icon: ShoppingBag,
    title: "Buy with Confidence",
    description: "Love what you see? Swap items, tweak the look, and add everything to cart when you're happy. No more guessing.",
  },
];

export default function HomePage() {
  const trending = products.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Visual Commerce
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Describe the vibe.{" "}
              <span className="text-violet-600">See the look.</span>{" "}
              Buy it all.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl">
              Stop scrolling through endless product lists. Tell our AI what you need —
              &quot;beach anniversary dinner, elegant but relaxed, under ₹15,000&quot; —
              and see the complete look on a model wearing real products.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/style-studio">
                <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-base px-8">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Open Style Studio
                </Button>
              </Link>
              <Link href="/category/women-dresses">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Browse Collection
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Three steps to your perfect outfit — powered by Google Gemini AI
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-5">
                    <step.icon className="h-7 w-7 text-violet-600" />
                  </div>
                  <div className="text-sm font-medium text-violet-600 mb-2">Step {i + 1}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Shop by Category</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {topCategories.map((cat) => {
              const count = products.filter((p) => p.category === cat.slug).length;
              return (
                <Link key={cat.slug} href={`/category/${cat.slug}`}>
                  <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <CardContent className="p-0">
                      <div className="h-48 relative overflow-hidden bg-gray-100">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-semibold text-white text-lg">{cat.name}</h3>
                          <p className="text-sm text-white/80">{count} products</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
            <Link href="/category/women-dresses" className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Style Studio CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="h-12 w-12 text-violet-200 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to See Your Look Come to Life?
          </h2>
          <p className="text-lg text-violet-200 mb-8 max-w-2xl mx-auto">
            Upload a selfie or pick a model, choose your products, and watch AI dress them in your exact picks. It&apos;s like having a personal stylist with a magic mirror.
          </p>
          <Link href="/style-studio">
            <Button size="lg" className="bg-white text-violet-700 hover:bg-violet-50 text-base px-8">
              <Sparkles className="h-5 w-5 mr-2" />
              Try Style Studio
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <span className="text-white font-semibold">Style Oracle</span>
            </div>
            <p className="text-sm">
              Built with Google Gemini, Imagen 3, Vertex AI &amp; Firebase for AI Builder Cup 2026
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/category/women-dresses" className="hover:text-white">Women</Link>
              <Link href="/category/men-shirts" className="hover:text-white">Men</Link>
              <Link href="/style-studio" className="hover:text-white">Style Studio</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
