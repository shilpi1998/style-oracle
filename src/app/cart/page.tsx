"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="absolute inset-0 texture-grain pointer-events-none" aria-hidden />
        <div className="relative text-center px-4">
          <ShoppingBag className="h-12 w-12 text-hairline mx-auto mb-6" strokeWidth={1} />
          <h1 className="font-heading text-4xl tracking-tight text-ink mb-3">
            Your bag is <span className="italic text-gold">empty</span>
          </h1>
          <p className="text-smoke mb-8">
            Start shopping to add items to your bag.
          </p>
          <Link href="/">
            <Button className="bg-ink text-cream hover:bg-ink-soft rounded-none sm:rounded-md px-8 h-11" data-testid="cart-empty-continue-button">
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-dark mb-3">
            Your Selection
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl tracking-tight text-ink">
            Shopping Bag
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cart Items — ledger rows */}
          <div className="lg:col-span-2">
            <div className="border-t border-ink">
              {items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="py-6 border-b border-hairline flex gap-5"
                  data-testid={`cart-item-row-${index}`}
                >
                  <div className="w-20 h-24 bg-parchment border border-hairline overflow-hidden shrink-0 flex items-center justify-center">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={80}
                        height={96}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-2xl">
                        {item.product.category === "women" ? "👗" : item.product.category === "men" ? "👔" : "💎"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          href={`/product/${item.product.id}`}
                          className="font-medium text-ink hover:text-gold-dark text-sm"
                          data-testid={`cart-item-name-${index}`}
                        >
                          {item.product.name}
                        </Link>
                        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-smoke mt-1.5">
                          Size: {item.size} &middot; Color: {item.color}
                        </p>
                        <p className="font-mono text-sm text-ink mt-2">
                          ₹{item.product.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-smoke/50 hover:text-wine transition-colors p-1"
                        data-testid={`cart-item-remove-${index}`}
                        aria-label={`Remove ${item.product.name} from bag`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 border border-hairline bg-white flex items-center justify-center hover:border-gold transition-colors"
                        data-testid={`cart-item-quantity-minus-${index}`}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 border border-hairline bg-white flex items-center justify-center hover:border-gold transition-colors"
                        data-testid={`cart-item-quantity-plus-${index}`}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary — the ledger total */}
          <div className="bg-white border border-hairline p-7 h-fit sticky top-24">
            <h2 className="font-heading text-2xl tracking-tight text-ink mb-6">
              Order Summary
            </h2>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-smoke">Subtotal</span>
                <span className="font-mono text-ink">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-smoke">Shipping</span>
                <span className="font-mono text-forest">Free</span>
              </div>
              <Separator className="bg-hairline" />
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-smoke">Total</span>
                <span className="font-mono text-xl tracking-tight text-ink">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <Button className="w-full mt-7 bg-ink text-cream hover:bg-ink-soft h-12 rounded-none sm:rounded-md text-sm tracking-wide" data-testid="cart-checkout-button">
              Proceed to Checkout
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full mt-2 text-sm text-smoke hover:text-ink" data-testid="cart-continue-shopping-button">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
