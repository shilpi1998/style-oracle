"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Loader2,
  ExternalLink,
  ShoppingCart,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  timestamp: number;
  isWelcome?: boolean;
}

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: "Hey! I'm your Style Oracle",
      isWelcome: true,
      timestamp: 0,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setShowPopup(false);
      return;
    }
    const timer = setTimeout(() => setShowPopup(true), 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        products: data.products?.length > 0 ? data.products : undefined,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Oops, something went wrong. Please try again!",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Popup Tooltip */}
      {showPopup && !isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 animate-bounce-in cursor-pointer"
          onClick={() => {
            setShowPopup(false);
            setIsOpen(true);
          }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-2.5 max-w-[220px]">
            <span className="text-xl">👋</span>
            <p className="text-sm text-gray-700 font-medium leading-tight">
              Hi! I&apos;m your shopper agent
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPopup(false);
              }}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45" />
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowPopup(false);
        }}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105",
          isOpen
            ? "bg-gray-800 text-white"
            : "bg-violet-600 text-white hover:bg-violet-700"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <div>
              <h3 className="font-semibold text-sm">Style Oracle</h3>
              <p className="text-xs text-violet-200">
                Powered by Gemini + Vertex AI
              </p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.isWelcome ? (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 mb-3">
                        <Sparkles className="h-6 w-6 text-violet-600" />
                      </div>
                      <h3 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-1">
                        {msg.content}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Tell me an occasion, a vibe, or a budget
                      </p>
                    </div>
                  ) : (
                  <div
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed",
                        msg.role === "user"
                          ? "bg-violet-600 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                  )}
                  {/* Product Cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.products.slice(0, 6).map((product) => (
                        <ProductMiniCard
                          key={product.id}
                          product={product}
                        />
                      ))}
                      <Link
                        href="/style-studio"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-colors group"
                      >
                        <Eye className="h-4 w-4 text-violet-600" />
                        <span className="text-xs font-medium text-violet-700 group-hover:text-violet-800">
                          See how these look on you — try Style Studio
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                    <span className="text-xs text-gray-500">
                      Styling your look...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your ideal look..."
                className="text-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="bg-violet-600 hover:bg-violet-700 shrink-0"
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function ProductMiniCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.sizes[0] || "M", product.colors[0] || "");
  }

  return (
    <div className="rounded-xl bg-white border border-gray-200 hover:border-violet-300 hover:shadow-sm transition-all overflow-hidden">
      <Link
        href={`/product/${product.id}`}
        className="flex items-center gap-3 p-2.5 group"
      >
        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg">
              {product.category === "women"
                ? "👗"
                : product.category === "men"
                  ? "👔"
                  : product.category === "footwear"
                    ? "👟"
                    : "💎"}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-violet-600">
            {product.name}
          </p>
          {product.brand && (
            <p className="text-[10px] text-gray-500">{product.brand}</p>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-semibold text-gray-900">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.colors[0] && (
              <span className="text-[10px] text-gray-400 capitalize">{product.colors[0]}</span>
            )}
          </div>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-violet-500 shrink-0" />
      </Link>
      <div className="px-2.5 pb-2 flex gap-2">
        <button
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          <ShoppingCart className="h-3 w-3" />
          Add to Cart
        </button>
        <Link
          href={`/product/${product.id}`}
          className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
