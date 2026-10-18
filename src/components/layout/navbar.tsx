"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";

const navLinks = [
  {
    label: "Women",
    children: [
      { label: "Dresses", href: "/category/women-dresses" },
      { label: "Tops & Blouses", href: "/category/women-tops" },
      { label: "Skirts", href: "/category/women-skirts" },
      { label: "Jeans & Trousers", href: "/category/women-jeans" },
      { label: "Ethnic Wear", href: "/category/women-ethnic" },
    ],
  },
  {
    label: "Men",
    children: [
      { label: "Shirts", href: "/category/men-shirts" },
      { label: "T-Shirts", href: "/category/men-tshirts" },
      { label: "Trousers & Jeans", href: "/category/men-trousers" },
      { label: "Blazers & Jackets", href: "/category/men-blazers" },
      { label: "Ethnic Wear", href: "/category/men-ethnic" },
    ],
  },
  {
    label: "Accessories",
    children: [
      { label: "Jewelry", href: "/category/accessories-jewelry" },
      { label: "Bags", href: "/category/accessories-bags" },
      { label: "Watches & Sunglasses", href: "/category/accessories-watches" },
    ],
  },
  {
    label: "Footwear",
    children: [
      { label: "Women's Footwear", href: "/category/footwear-women" },
      { label: "Men's Footwear", href: "/category/footwear-men" },
    ],
  },
];

export function Navbar() {
  const router = useRouter();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link href="/" className="flex items-baseline gap-2 shrink-0" data-testid="navbar-home-link">
            <span className="font-heading text-2xl tracking-tight text-ink">
              Style<span className="italic text-gold">Oracle</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 ml-10">
            {navLinks.map((group) => (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(group.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  data-testid={`navbar-menu-${group.label.toLowerCase()}`}
                  className="px-1 py-2 font-mono text-xs uppercase tracking-[0.15em] text-smoke hover:text-gold transition-colors"
                >
                  {group.label}
                </button>
                {activeDropdown === group.label && (
                  <div className="absolute top-full left-0 w-52 bg-white/95 backdrop-blur-xl border border-hairline rounded-md shadow-xl py-2 z-50 animate-bounce-in">
                    {group.children.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2 text-sm text-smoke hover:bg-parchment hover:text-ink transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/style-studio"
              data-testid="navbar-style-studio-link"
              className="px-1 py-2 font-mono text-xs uppercase tracking-[0.15em] text-gold-dark hover:text-gold transition-colors border-b border-gold/40 hover:border-gold"
            >
              Style Studio
            </Link>
          </div>

          {/* Search + Cart */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-smoke/60" />
                <Input
                  type="text"
                  placeholder="Search the archive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-52 lg:w-64 h-9 text-sm bg-white/70 border-hairline rounded-full"
                  data-testid="navbar-search-input"
                />
              </div>
            </form>

            <Link
              href="/cart"
              className="relative p-2 text-ink hover:text-gold transition-colors"
              data-testid="navbar-cart-link"
              aria-label="Open shopping bag"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  className="absolute -top-0.5 -right-0.5 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-[10px] font-mono bg-ink text-cream rounded-full"
                  data-testid="navbar-cart-badge"
                >
                  {totalItems}
                </Badge>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-ink"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="navbar-mobile-menu-button"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-smoke/60" />
              <Input
                type="text"
                placeholder="Search the archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-white/70 border-hairline rounded-full"
                data-testid="navbar-search-input-mobile"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-hairline bg-cream/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((group) => (
              <div key={group.label}>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-dark mb-1.5">
                  {group.label}
                </p>
                {group.children.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-1.5 text-sm text-smoke"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
            <Link
              href="/style-studio"
              className="flex items-center gap-2 py-2 font-mono text-xs uppercase tracking-[0.15em] text-gold-dark border-t border-hairline pt-4"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="navbar-style-studio-link-mobile"
            >
              Style Studio
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
