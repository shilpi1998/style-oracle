"use client";

import { CartProvider } from "@/lib/cart-context";
import { Navbar } from "@/components/layout/navbar";
import { ChatBubble } from "@/components/chat/chat-bubble";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <ChatBubble />
    </CartProvider>
  );
}
