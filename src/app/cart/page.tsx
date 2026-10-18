"use client";

import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">Start shopping to add items to your cart.</p>
          <Link href="/">
            <Button className="bg-violet-600 hover:bg-violet-700">
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.size}-${item.color}`} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
                <div className="w-20 h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {item.product.images[0] && (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{item.product.brand}</p>
                  <Link href={`/product/${item.product.id}`} className="font-medium text-gray-900 hover:text-violet-600 text-sm line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    Size: {item.size} &middot; Color: {item.color}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    ₹{item.product.price.toLocaleString("en-IN")}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-fit sticky top-20">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <Button className="w-full mt-6 bg-violet-600 hover:bg-violet-700">
              Proceed to Checkout
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full mt-2 text-sm">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
