"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/lib/cart-context";
import { Navbar } from "@/components/layout/navbar";
import { ChatBubble } from "@/components/chat/chat-bubble";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMerchant = pathname.startsWith("/merchant");

  return (
    <CartProvider>
      {!isMerchant && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isMerchant && <ChatBubble />}
    </CartProvider>
  );
}
