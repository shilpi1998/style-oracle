"use client";

import { useState } from "react";
import {
  BarChart3,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MousePointerClick,
  IndianRupee,
} from "lucide-react";

const timeRanges = ["Today", "7 Days", "30 Days", "All Time"] as const;
type TimeRange = (typeof timeRanges)[number];

interface MetricCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
}

interface FunnelStep {
  label: string;
  count: number;
  pct: number;
}

const dataByRange: Record<
  TimeRange,
  {
    metrics: MetricCard[];
    chatFunnel: FunnelStep[];
    studioFunnel: FunnelStep[];
    topProducts: { name: string; views: number; tryOns: number; purchases: number; revenue: number }[];
  }
> = {
  Today: {
    metrics: [
      { label: "Total Visitors", value: "342", change: "+12%", positive: true, icon: <Users className="h-5 w-5" /> },
      { label: "Style Agent Chats", value: "87", change: "+18%", positive: true, icon: <MessageCircle className="h-5 w-5" /> },
      { label: "Style Studio Sessions", value: "54", change: "+24%", positive: true, icon: <Sparkles className="h-5 w-5" /> },
      { label: "Revenue", value: "₹1,24,500", change: "+8%", positive: true, icon: <IndianRupee className="h-5 w-5" /> },
    ],
    chatFunnel: [
      { label: "Opened Chat", count: 87, pct: 100 },
      { label: "Asked a Question", count: 72, pct: 83 },
      { label: "Viewed Product", count: 48, pct: 55 },
      { label: "Added to Cart", count: 21, pct: 24 },
      { label: "Purchased", count: 14, pct: 16 },
    ],
    studioFunnel: [
      { label: "Entered Studio", count: 54, pct: 100 },
      { label: "Uploaded Photo", count: 48, pct: 89 },
      { label: "Generated Look", count: 36, pct: 67 },
      { label: "Added to Cart", count: 18, pct: 33 },
      { label: "Purchased", count: 11, pct: 20 },
    ],
    topProducts: [
      { name: "Elle Women Blue Dress", views: 84, tryOns: 22, purchases: 8, revenue: 15960 },
      { name: "Latin Quarters Green Dress", views: 67, tryOns: 18, purchases: 6, revenue: 11940 },
      { name: "Anouk Red Kurta Set", views: 52, tryOns: 14, purchases: 5, revenue: 12450 },
      { name: "Peter England Blazer", views: 45, tryOns: 11, purchases: 4, revenue: 13960 },
      { name: "Mast & Harbour Sneakers", views: 38, tryOns: 9, purchases: 3, revenue: 5370 },
    ],
  },
  "7 Days": {
    metrics: [
      { label: "Total Visitors", value: "2,148", change: "+15%", positive: true, icon: <Users className="h-5 w-5" /> },
      { label: "Style Agent Chats", value: "524", change: "+22%", positive: true, icon: <MessageCircle className="h-5 w-5" /> },
      { label: "Style Studio Sessions", value: "312", change: "+31%", positive: true, icon: <Sparkles className="h-5 w-5" /> },
      { label: "Revenue", value: "₹8,42,000", change: "+19%", positive: true, icon: <IndianRupee className="h-5 w-5" /> },
    ],
    chatFunnel: [
      { label: "Opened Chat", count: 524, pct: 100 },
      { label: "Asked a Question", count: 436, pct: 83 },
      { label: "Viewed Product", count: 285, pct: 54 },
      { label: "Added to Cart", count: 126, pct: 24 },
      { label: "Purchased", count: 84, pct: 16 },
    ],
    studioFunnel: [
      { label: "Entered Studio", count: 312, pct: 100 },
      { label: "Uploaded Photo", count: 274, pct: 88 },
      { label: "Generated Look", count: 198, pct: 63 },
      { label: "Added to Cart", count: 102, pct: 33 },
      { label: "Purchased", count: 65, pct: 21 },
    ],
    topProducts: [
      { name: "Elle Women Blue Dress", views: 520, tryOns: 142, purchases: 48, revenue: 95760 },
      { name: "Latin Quarters Green Dress", views: 410, tryOns: 108, purchases: 36, revenue: 71640 },
      { name: "Anouk Red Kurta Set", views: 345, tryOns: 86, purchases: 28, revenue: 69720 },
      { name: "Peter England Blazer", views: 290, tryOns: 72, purchases: 24, revenue: 83760 },
      { name: "Mast & Harbour Sneakers", views: 248, tryOns: 58, purchases: 19, revenue: 34010 },
    ],
  },
  "30 Days": {
    metrics: [
      { label: "Total Visitors", value: "8,924", change: "+28%", positive: true, icon: <Users className="h-5 w-5" /> },
      { label: "Style Agent Chats", value: "2,186", change: "+35%", positive: true, icon: <MessageCircle className="h-5 w-5" /> },
      { label: "Style Studio Sessions", value: "1,342", change: "+42%", positive: true, icon: <Sparkles className="h-5 w-5" /> },
      { label: "Revenue", value: "₹34,80,000", change: "+24%", positive: true, icon: <IndianRupee className="h-5 w-5" /> },
    ],
    chatFunnel: [
      { label: "Opened Chat", count: 2186, pct: 100 },
      { label: "Asked a Question", count: 1814, pct: 83 },
      { label: "Viewed Product", count: 1180, pct: 54 },
      { label: "Added to Cart", count: 524, pct: 24 },
      { label: "Purchased", count: 350, pct: 16 },
    ],
    studioFunnel: [
      { label: "Entered Studio", count: 1342, pct: 100 },
      { label: "Uploaded Photo", count: 1180, pct: 88 },
      { label: "Generated Look", count: 845, pct: 63 },
      { label: "Added to Cart", count: 443, pct: 33 },
      { label: "Purchased", count: 282, pct: 21 },
    ],
    topProducts: [
      { name: "Elle Women Blue Dress", views: 2180, tryOns: 584, purchases: 196, revenue: 390840 },
      { name: "Latin Quarters Green Dress", views: 1720, tryOns: 448, purchases: 152, revenue: 302480 },
      { name: "Anouk Red Kurta Set", views: 1380, tryOns: 356, purchases: 118, revenue: 293820 },
      { name: "Peter England Blazer", views: 1190, tryOns: 298, purchases: 98, revenue: 341860 },
      { name: "Mast & Harbour Sneakers", views: 1024, tryOns: 242, purchases: 78, revenue: 139620 },
    ],
  },
  "All Time": {
    metrics: [
      { label: "Total Visitors", value: "24,580", change: "+45%", positive: true, icon: <Users className="h-5 w-5" /> },
      { label: "Style Agent Chats", value: "6,124", change: "+52%", positive: true, icon: <MessageCircle className="h-5 w-5" /> },
      { label: "Style Studio Sessions", value: "3,842", change: "+61%", positive: true, icon: <Sparkles className="h-5 w-5" /> },
      { label: "Revenue", value: "₹98,40,000", change: "+38%", positive: true, icon: <IndianRupee className="h-5 w-5" /> },
    ],
    chatFunnel: [
      { label: "Opened Chat", count: 6124, pct: 100 },
      { label: "Asked a Question", count: 5083, pct: 83 },
      { label: "Viewed Product", count: 3307, pct: 54 },
      { label: "Added to Cart", count: 1470, pct: 24 },
      { label: "Purchased", count: 980, pct: 16 },
    ],
    studioFunnel: [
      { label: "Entered Studio", count: 3842, pct: 100 },
      { label: "Uploaded Photo", count: 3381, pct: 88 },
      { label: "Generated Look", count: 2420, pct: 63 },
      { label: "Added to Cart", count: 1268, pct: 33 },
      { label: "Purchased", count: 807, pct: 21 },
    ],
    topProducts: [
      { name: "Elle Women Blue Dress", views: 6240, tryOns: 1680, purchases: 562, revenue: 1120620 },
      { name: "Latin Quarters Green Dress", views: 4920, tryOns: 1284, purchases: 436, revenue: 867640 },
      { name: "Anouk Red Kurta Set", views: 3960, tryOns: 1020, purchases: 338, revenue: 841620 },
      { name: "Peter England Blazer", views: 3410, tryOns: 854, purchases: 282, revenue: 983580 },
      { name: "Mast & Harbour Sneakers", views: 2936, tryOns: 694, purchases: 224, revenue: 400960 },
    ],
  },
};

function ConversionFunnel({ title, icon, steps, accentColor }: { title: string; icon: React.ReactNode; steps: FunnelStep[]; accentColor: string }) {
  const conversionRate = steps.length >= 2 ? steps[steps.length - 1].pct : 0;
  return (
    <div className="bg-white border border-hairline p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          {icon}
          <h3 className="font-heading text-lg tracking-tight text-ink">{title}</h3>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl tracking-tight text-ink">{conversionRate}%</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-smoke">Conversion Rate</p>
        </div>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={step.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-ink">{step.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-smoke">{step.count.toLocaleString("en-IN")}</span>
                <span className="font-mono text-[10px] text-smoke/60">{step.pct}%</span>
              </div>
            </div>
            <div className="h-2 bg-cream rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${accentColor}`}
                style={{ width: `${step.pct}%` }}
              />
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-0.5">
                <span className="font-mono text-[9px] text-smoke/40">
                  {steps[i + 1].count > 0 ? `${Math.round((steps[i + 1].count / step.count) * 100)}% →` : ""}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MerchantDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7 Days");
  const data = dataByRange[timeRange];

  return (
    <div className="min-h-screen bg-cream">
      <div className="absolute inset-0 texture-grain pointer-events-none" aria-hidden />
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-hairline">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-dark mb-1">Merchant Portal</p>
            <h1 className="font-heading text-3xl tracking-tight text-ink">
              Analytics <span className="italic text-gold">Dashboard</span>
            </h1>
            <p className="text-sm text-smoke mt-1">Conversion insights for AI-powered features</p>
          </div>
          <div className="flex gap-1.5 bg-white border border-hairline p-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`font-mono text-[10px] uppercase tracking-wider px-3 py-2 transition-all ${
                  timeRange === range
                    ? "bg-ink text-cream"
                    : "text-smoke hover:text-ink"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {data.metrics.map((metric) => (
            <div key={metric.label} className="bg-white border border-hairline p-5 hover:border-gold/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="text-gold-dark">{metric.icon}</div>
                <div className={`flex items-center gap-0.5 font-mono text-xs ${metric.positive ? "text-forest" : "text-wine"}`}>
                  {metric.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {metric.change}
                </div>
              </div>
              <p className="font-mono text-2xl tracking-tight text-ink">{metric.value}</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-smoke mt-1">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Conversion Comparison */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-hairline p-6 flex flex-col items-center justify-center">
            <BarChart3 className="h-8 w-8 text-gold mb-3" />
            <h3 className="font-heading text-lg tracking-tight text-ink mb-4">Conversion Comparison</h3>
            <div className="w-full space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-3.5 w-3.5 text-gold-dark" />
                    <span className="text-xs text-ink">Style Agent</span>
                  </div>
                  <span className="font-mono text-lg text-ink">{data.chatFunnel[data.chatFunnel.length - 1].pct}%</span>
                </div>
                <div className="h-3 bg-cream rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: `${data.chatFunnel[data.chatFunnel.length - 1].pct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-gold-dark" />
                    <span className="text-xs text-ink">Style Studio</span>
                  </div>
                  <span className="font-mono text-lg text-ink">{data.studioFunnel[data.studioFunnel.length - 1].pct}%</span>
                </div>
                <div className="h-3 bg-cream rounded-full overflow-hidden">
                  <div className="h-full bg-forest rounded-full" style={{ width: `${data.studioFunnel[data.studioFunnel.length - 1].pct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-smoke" />
                    <span className="text-xs text-ink">Organic Browse</span>
                  </div>
                  <span className="font-mono text-lg text-ink">3%</span>
                </div>
                <div className="h-3 bg-cream rounded-full overflow-hidden">
                  <div className="h-full bg-smoke/40 rounded-full" style={{ width: "3%" }} />
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-hairline w-full">
              <div className="flex items-center gap-2 justify-center">
                <TrendingUp className="h-4 w-4 text-forest" />
                <p className="text-xs text-ink">
                  AI features drive <span className="font-mono font-bold text-forest">{Math.round(data.studioFunnel[data.studioFunnel.length - 1].pct / 3)}x</span> higher conversions
                </p>
              </div>
            </div>
          </div>

          {/* Chat Funnel */}
          <ConversionFunnel
            title="Style Agent Funnel"
            icon={<MessageCircle className="h-5 w-5 text-gold-dark" />}
            steps={data.chatFunnel}
            accentColor="bg-gold"
          />

          {/* Studio Funnel */}
          <ConversionFunnel
            title="Style Studio Funnel"
            icon={<Sparkles className="h-5 w-5 text-gold-dark" />}
            steps={data.studioFunnel}
            accentColor="bg-forest"
          />
        </div>

        {/* Top Products */}
        <div className="bg-white border border-hairline p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <ShoppingBag className="h-5 w-5 text-gold-dark" />
            <h3 className="font-heading text-lg tracking-tight text-ink">Top Products by AI-Driven Sales</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left font-mono text-[9px] uppercase tracking-[0.15em] text-smoke pb-3 pr-4">Product</th>
                  <th className="text-right font-mono text-[9px] uppercase tracking-[0.15em] text-smoke pb-3 px-4">
                    <div className="flex items-center justify-end gap-1"><Eye className="h-3 w-3" />Views</div>
                  </th>
                  <th className="text-right font-mono text-[9px] uppercase tracking-[0.15em] text-smoke pb-3 px-4">
                    <div className="flex items-center justify-end gap-1"><Sparkles className="h-3 w-3" />Try-Ons</div>
                  </th>
                  <th className="text-right font-mono text-[9px] uppercase tracking-[0.15em] text-smoke pb-3 px-4">
                    <div className="flex items-center justify-end gap-1"><MousePointerClick className="h-3 w-3" />Purchases</div>
                  </th>
                  <th className="text-right font-mono text-[9px] uppercase tracking-[0.15em] text-smoke pb-3 px-4">
                    <div className="flex items-center justify-end gap-1"><IndianRupee className="h-3 w-3" />Revenue</div>
                  </th>
                  <th className="text-right font-mono text-[9px] uppercase tracking-[0.15em] text-smoke pb-3 pl-4">Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((product, i) => {
                  const convRate = ((product.purchases / product.views) * 100).toFixed(1);
                  return (
                    <tr key={product.name} className="border-b border-hairline-soft last:border-0 hover:bg-parchment/50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[10px] text-smoke w-4">{i + 1}.</span>
                          <span className="text-sm text-ink">{product.name}</span>
                        </div>
                      </td>
                      <td className="text-right font-mono text-sm text-ink py-3 px-4">{product.views.toLocaleString("en-IN")}</td>
                      <td className="text-right font-mono text-sm text-ink py-3 px-4">{product.tryOns.toLocaleString("en-IN")}</td>
                      <td className="text-right font-mono text-sm text-ink py-3 px-4">{product.purchases.toLocaleString("en-IN")}</td>
                      <td className="text-right font-mono text-sm text-gold-dark py-3 px-4">₹{product.revenue.toLocaleString("en-IN")}</td>
                      <td className="text-right py-3 pl-4">
                        <span className="font-mono text-xs bg-forest/10 text-forest px-2 py-0.5">{convRate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer insight */}
        <div className="mt-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-smoke/60">
            Style Oracle Merchant Analytics &middot; Powered by Google Cloud
          </p>
        </div>
      </div>
    </div>
  );
}
