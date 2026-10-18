"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingBag, Sparkles, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Sparkles className="h-6 w-6 text-violet-600" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Style<span className="text-violet-600">Oracle</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 ml-8">
            {navLinks.map((group) => (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(group.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 transition-colors">
                  {group.label}
                </button>
                {activeDropdown === group.label && (
                  <div className="absolute top-full left-0 w-52 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
                    {group.children.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors"
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
              className="px-3 py-2 text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              <Sparkles className="h-4 w-4" />
              Style Studio
            </Link>
          </div>

          {/* Search + Cart */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-56 lg:w-72 h-9 text-sm"
                />
              </div>
            </form>

            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-violet-600">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-violet-600">
                  {totalItems}
                </Badge>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-3">
            {navLinks.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {group.label}
                </p>
                {group.children.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-1.5 text-sm text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
            <Link
              href="/style-studio"
              className="flex items-center gap-2 py-2 text-sm font-semibold text-violet-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sparkles className="h-4 w-4" />
              Style Studio
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
