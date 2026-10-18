import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./client-layout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Style Oracle — Describe the Vibe. See the Look. Buy it All.",
  description:
    "AI-powered conversational visual commerce. Describe your style, see complete looks on a model, and shop with confidence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
