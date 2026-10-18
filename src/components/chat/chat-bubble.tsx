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
          data-testid="chat-popup-tooltip"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-md shadow-[0_12px_28px_rgba(18,18,18,0.12)] border border-hairline px-4 py-3 flex items-center gap-2.5 max-w-[220px]">
            <span className="font-heading italic text-gold-dark text-lg leading-none">&Agrave;</span>
            <p className="text-sm text-ink font-medium leading-tight">
              Hi! I&apos;m your shopper agent
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPopup(false);
              }}
              className="text-smoke/60 hover:text-ink shrink-0"
              aria-label="Dismiss greeting"
              data-testid="chat-popup-dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white border-r border-b border-hairline rotate-45" />
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowPopup(false);
        }}
        data-testid="chat-toggle-button"
        aria-label={isOpen ? "Close style chat" : "Open style chat"}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 shadow-[0_12px_28px_rgba(18,18,18,0.2)] flex items-center justify-center transition-all duration-300 hover:scale-105 motion-reduce:hover:scale-100",
          isOpen
            ? "bg-ink-soft text-cream"
            : "bg-ink text-cream hover:bg-ink-soft"
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
        <div
          className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[560px] bg-white/95 backdrop-blur-xl rounded-md shadow-[0_24px_60px_rgba(18,18,18,0.18)] border border-hairline flex flex-col overflow-hidden animate-bounce-in"
          data-testid="chat-panel"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-ink text-cream flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-gold-light" />
            <div>
              <h3 className="font-heading text-lg tracking-tight leading-none">
                Style <span className="italic text-gold-light">Oracle</span>
              </h3>
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-cream/50 mt-1">
                Powered by Gemini + Vertex AI
              </p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-cream/60" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.isWelcome ? (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 border border-hairline bg-white mb-3">
                        <Sparkles className="h-5 w-5 text-gold" />
                      </div>
                      <h3 className="font-heading text-xl italic tracking-tight text-ink mb-1">
                        {msg.content}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-smoke/70 mt-1">
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
                        "max-w-[85%] px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed",
                        msg.role === "user"
                          ? "bg-ink text-cream"
                          : "bg-white border border-hairline text-ink"
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
                        className="flex items-center gap-2 px-3 py-2 bg-parchment border border-hairline hover:border-gold/50 transition-colors group"
                      >
                        <Eye className="h-4 w-4 text-gold-dark" />
                        <span className="text-xs font-medium text-gold-dark group-hover:text-gold">
                          See how these look on you — try Style Studio
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-hairline px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-smoke">
                      Styling your look...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-hairline bg-white">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your ideal look..."
                className="text-sm border-hairline bg-cream/60"
                disabled={isLoading}
                data-testid="chat-input"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-ink text-cream hover:bg-ink-soft shrink-0 rounded-none sm:rounded-sm"
                disabled={!input.trim() || isLoading}
                data-testid="chat-send-button"
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
    <div className="bg-white border border-hairline hover:border-gold/60 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(18,18,18,0.08)] transition-all duration-300">
      <Link
        href={`/product/${product.id}`}
        className="flex items-center gap-3 p-2.5 group"
        data-testid={`chat-product-card-${product.id}`}
      >
        <div className="w-12 h-12 bg-parchment flex items-center justify-center shrink-0 overflow-hidden border border-hairline-soft">
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
          <p className="text-sm font-medium text-ink truncate group-hover:text-gold-dark transition-colors">
            {product.name}
          </p>
          {product.brand && (
            <p className="font-mono text-[10px] text-smoke">{product.brand}</p>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-sm text-gold-dark">
              &rupee;{product.price.toLocaleString("en-IN")}
            </span>
            {product.tryOnCompatible && (
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] px-1.5 py-0.5 bg-parchment text-gold-dark border border-hairline">
                Try On
              </span>
            )}
          </div>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-smoke/40 group-hover:text-gold shrink-0" />
      </Link>
      <div className="px-2.5 pb-2 flex gap-2">
        <button
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider bg-ink text-cream hover:bg-ink-soft transition-colors"
        >
          <ShoppingCart className="h-3 w-3" />
          Add to Bag
        </button>
        <Link
          href={`/product/${product.id}`}
          className="flex items-center justify-center gap-1 px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider border border-hairline text-smoke hover:border-gold hover:text-gold-dark transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
