"use client";

import Link from "next/link";
import { ArrowRight, Eye, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/motion/reveal";
import { products } from "@/data/products";

const topCategories = [
  { name: "Women", slug: "women", image: "/images/categories/women-dresses.jpg" },
  { name: "Men", slug: "men", image: "/images/categories/men-shirts.jpg" },
  { name: "Accessories", slug: "accessories", image: "/images/categories/accessories-jewelry.jpg" },
  { name: "Footwear", slug: "footwear", image: "/images/categories/footwear-women.jpg" },
];

const steps = [
  {
    number: "01",
    icon: MessageCircle,
    title: "Describe Your Vibe",
    description:
      "Tell our AI agent what you're looking for — an occasion, a mood, a budget. It understands natural language like a personal stylist.",
  },
  {
    number: "02",
    icon: Eye,
    title: "See the Complete Look",
    description:
      "Style Studio generates a full outfit on a model using the exact products from our catalog. Not stock photos — your actual items.",
  },
  {
    number: "03",
    icon: ShoppingBag,
    title: "Buy with Confidence",
    description:
      "Love what you see? Swap items, tweak the look, and add everything to cart when you're happy. No more guessing.",
  },
];

export default function HomePage() {
  const trending = products.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* ============ HERO — asymmetric editorial split ============ */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div className="absolute inset-0 texture-grain" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left — headline block */}
            <div className="lg:col-span-7">
              <Reveal>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-dark mb-6 flex items-center gap-3">
                  <span className="inline-block w-10 h-px bg-gold" />
                  AI-Powered Visual Commerce
                </p>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] text-ink mb-8">
                  Describe the vibe.
                  <br />
                  <span className="italic text-gold">See the look.</span>
                  <br />
                  Buy it all.
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="text-lg text-smoke leading-relaxed max-w-xl mb-10">
                  Stop scrolling through endless product lists. Tell our AI what
                  you need and see the complete look on you wearing real products.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="flex flex-wrap gap-4 items-center">
                  <Link href="/style-studio">
                    <Button
                      size="lg"
                      className="bg-ink text-cream hover:bg-ink-soft rounded-none sm:rounded-md px-8 h-12 text-sm tracking-wide"
                      data-testid="hero-cta-style-studio"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Open Style Studio
                    </Button>
                  </Link>
                  <Link href="/category/women-dresses">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-ink text-ink bg-transparent hover:bg-ink hover:text-cream rounded-none sm:rounded-md px-8 h-12 text-sm tracking-wide"
                      data-testid="hero-cta-browse"
                    >
                      Browse Collection
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={320}>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-smoke/60 mt-12">
                  Powered by Gemini · Vertex AI · Firestore
                </p>
              </Reveal>
            </div>

            {/* Right — layered editorial imagery */}
            <div className="lg:col-span-5 relative">
              <Reveal delay={200}>
                <div className="relative">
                  <div className="p-2.5 bg-white border border-hairline shadow-[0_16px_40px_rgba(18,18,18,0.08)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?crop=entropy&cs=srgb&fm=jpg&q=85"
                      alt="Editorial model in tailored blazer and trousers, warm studio lighting"
                      className="w-full aspect-[3/4] object-cover"
                    />
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-smoke mt-3 flex justify-between">
                    <span>Look 01 — The Tailored Edit</span>
                    <span className="text-gold-dark">FW Collection</span>
                  </p>

                  {/* Overlapping glass card */}
                  <Link
                    href="/style-studio"
                    className="absolute -bottom-6 -left-6 sm:-left-10 glass-panel rounded-md px-5 py-4 flex items-center gap-3 hover:shadow-[0_12px_28px_rgba(18,18,18,0.10)] transition-all duration-300 hover:-translate-y-1"
                    data-testid="hero-tryon-card"
                  >
                    <span className="w-9 h-9 flex items-center justify-center bg-parchment text-gold-dark rounded-full shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-ink">
                        Virtual Try-On Studio
                      </span>
                      <span className="block font-mono text-[10px] uppercase tracking-[0.15em] text-smoke mt-0.5">
                        See it on you →
                      </span>
                    </span>
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS — numbered editorial ledger ============ */}
      <section className="py-20 lg:py-28 bg-white border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-dark mb-3">
                  The Process
                </p>
                <h2 className="font-heading text-4xl sm:text-5xl tracking-tight text-ink leading-[1.1]">
                  How It Works
                </h2>
              </div>
              <p className="text-sm text-smoke max-w-xs sm:text-right">
                Three steps to your perfect outfit — powered by Google Gemini AI
              </p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <Reveal key={step.number} delay={i * 120}>
                <div className="border-t border-ink pt-6 h-full">
                  <div className="flex items-baseline justify-between mb-6">
                    <span className="font-mono text-3xl text-gold tracking-tight">
                      {step.number}
                    </span>
                    <step.icon className="h-5 w-5 text-ink/30" />
                  </div>
                  <h3 className="font-heading text-2xl tracking-tight text-ink mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-smoke leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SHOP BY CATEGORY — parchment lookbook ============ */}
      <section className="py-20 lg:py-28 bg-parchment border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-dark mb-3">
                The Collections
              </p>
              <h2 className="font-heading text-4xl sm:text-5xl tracking-tight text-ink">
                Shop by Category
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {topCategories.map((cat, i) => {
              const count = products.filter((p) => p.category === cat.slug).length;
              return (
                <Reveal key={cat.slug} delay={i * 100}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="group block"
                    data-testid={`category-tile-${cat.slug}`}
                  >
                    <div className="relative h-72 overflow-hidden bg-hairline-soft border border-hairline">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transform-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-heading text-2xl text-cream tracking-tight">
                          {cat.name}
                        </h3>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/70 mt-1">
                          {count} pieces
                        </p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ TRENDING ============ */}
      <section className="py-20 lg:py-28 bg-cream border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-dark mb-3">
                  Most Coveted
                </p>
                <h2 className="font-heading text-4xl sm:text-5xl tracking-tight text-ink">
                  Trending Now
                </h2>
              </div>
              <Link
                href="/category/women-dresses"
                className="font-mono text-xs uppercase tracking-[0.15em] text-ink border-b border-ink pb-0.5 hover:text-gold-dark hover:border-gold-dark transition-colors"
                data-testid="trending-view-all"
              >
                View All
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {trending.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 80}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STYLE STUDIO CTA — ink inverse band ============ */}
      <section className="py-24 lg:py-32 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 texture-grain opacity-40" aria-hidden />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <Sparkles className="h-8 w-8 text-gold-light mx-auto mb-8" />
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight text-cream leading-[1.08] mb-6">
              Ready to See Your Look
              <br />
              <span className="italic text-gold-light">Come to Life?</span>
            </h2>
            <p className="text-cream/70 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
              Upload a selfie or pick a model, choose your products, and watch
              AI dress them in your exact picks. It&apos;s like having a
              personal stylist with a magic mirror.
            </p>
            <Link href="/style-studio">
              <Button
                size="lg"
                className="bg-cream text-ink hover:bg-white rounded-none sm:rounded-md px-10 h-12 text-sm tracking-wide"
                data-testid="home-studio-cta"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Try Style Studio
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-ink border-t border-[#2a2825] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="font-heading text-xl text-cream tracking-tight">
              Style<span className="italic text-gold-light">Oracle</span>
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/50 text-center">
              Built with Gemini, Imagen 3, Vertex AI &amp; Firebase — AI Builder
              Cup 2026
            </p>
            <div className="flex gap-6 font-mono text-[11px] uppercase tracking-[0.15em]">
              <Link href="/category/women-dresses" className="text-cream/70 hover:text-gold-light transition-colors">
                Women
              </Link>
              <Link href="/category/men-shirts" className="text-cream/70 hover:text-gold-light transition-colors">
                Men
              </Link>
              <Link href="/style-studio" className="text-cream/70 hover:text-gold-light transition-colors">
                Style Studio
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
