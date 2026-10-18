import { writeFileSync, mkdirSync } from "fs";
import { products } from "../src/data/products";

const colorMap: Record<string, string> = {
  navy: "#1e3a5f",
  black: "#1a1a2e",
  emerald: "#065f46",
  green: "#166534",
  pink: "#db2777",
  red: "#dc2626",
  white: "#e5e7eb",
  ivory: "#fdf6e3",
  beige: "#d4a574",
  blue: "#2563eb",
  gold: "#b8860b",
  silver: "#94a3b8",
  brown: "#78350f",
  grey: "#6b7280",
  charcoal: "#374151",
  burgundy: "#7f1d1d",
  olive: "#556b2f",
  tan: "#c4a35a",
  purple: "#7c3aed",
  mustard: "#ca8a04",
  indigo: "#312e81",
  coral: "#f97316",
  blush: "#f9a8d4",
  nude: "#d4a574",
  khaki: "#a3956b",
  multicolor: "#ec4899",
  natural: "#c4a35a",
  crystal: "#a5b4fc",
  pearl: "#f5f0e8",
  "rose-gold": "#b76e79",
  tortoiseshell: "#8b6914",
  "forest-green": "#14532d",
  "light-blue": "#93c5fd",
};

const categoryEmoji: Record<string, string> = {
  "women-dresses": "👗",
  "women-tops": "👚",
  "women-skirts": "🩱",
  "men-shirts": "👔",
  "men-tshirts": "👕",
  "men-trousers": "👖",
  "men-blazers": "🧥",
  "accessories-jewelry": "💍",
  "accessories-bags": "👜",
  "accessories-watches": "⌚",
  "footwear-women": "👠",
  "footwear-men": "👞",
};

function getGradientColors(colors: string[]): [string, string] {
  const primary = colorMap[colors[0]] || "#6366f1";
  const secondary = colors[1]
    ? colorMap[colors[1]] || primary
    : adjustBrightness(primary, 30);
  return [primary, secondary];
}

function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function generateSVG(
  name: string,
  colors: string[],
  subcategory: string,
  price: number
): string {
  const [c1, c2] = getGradientColors(colors);
  const emoji = categoryEmoji[subcategory] || "🛍️";
  const shortName =
    name.length > 24 ? name.substring(0, 22) + "..." : name;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1};stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:${c2};stop-opacity:0.25"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${c1};stop-opacity:0.8"/>
      <stop offset="100%" style="stop-color:${c2};stop-opacity:0.6"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="#fafafa"/>
  <rect width="600" height="800" fill="url(#bg)"/>
  <rect x="0" y="0" width="600" height="4" fill="url(#accent)"/>
  <circle cx="300" cy="320" r="100" fill="${c1}" opacity="0.12"/>
  <text x="300" y="340" text-anchor="middle" font-size="80">${emoji}</text>
  <text x="300" y="460" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" font-weight="600" fill="#1f2937">${escapeXml(shortName)}</text>
  <text x="300" y="500" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="#6b7280">₹${price.toLocaleString("en-IN")}</text>
  <rect x="225" y="530" width="150" height="3" rx="1.5" fill="${c1}" opacity="0.3"/>
  <text x="300" y="580" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#9ca3af" letter-spacing="2">STYLE AGENT</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const dir = "public/images/products";
mkdirSync(dir, { recursive: true });

let count = 0;
for (const p of products) {
  const svg = generateSVG(p.name, p.colors, p.subcategory, p.price);
  const filename = `${dir}/${p.id}.svg`;
  writeFileSync(filename, svg);
  count++;
}

console.log(`Generated ${count} placeholder SVGs in ${dir}/`);
