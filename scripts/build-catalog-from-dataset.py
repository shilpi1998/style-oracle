"""
Build the StyleAgent product catalog from the Myntra/Fashion dataset.
Picks the best images per category, copies them, and generates products.ts.
"""
import csv
import json
import os
import shutil
import random

DATASET_CSV = "/tmp/fashion-dataset/styles.csv"
DATASET_IMAGES = "/tmp/fashion-dataset/extracted/images"
OUTPUT_IMAGES = "public/images/products"
OUTPUT_TS = "src/data/products.ts"

os.makedirs(OUTPUT_IMAGES, exist_ok=True)

# Read dataset
with open(DATASET_CSV, "r", errors="replace") as f:
    reader = csv.DictReader(f)
    all_rows = [r for r in reader]

# Filter to only rows with images that exist and are decent size (>5KB = not broken)
def has_good_image(row):
    path = os.path.join(DATASET_IMAGES, f"{row['id']}.jpg")
    return os.path.exists(path) and os.path.getsize(path) > 5000

rows = [r for r in all_rows if has_good_image(r)]
print(f"Total products with good images: {len(rows)}")

# Define our store categories and what dataset articleTypes map to them
CATEGORY_MAP = {
    "women-dresses": {
        "gender": ["Women"],
        "articleType": ["Dresses"],
        "count": 15,
        "category": "women",
        "tryOn": True,
    },
    "women-tops": {
        "gender": ["Women"],
        "articleType": ["Tops", "Tunics", "Shirts"],
        "count": 10,
        "category": "women",
        "tryOn": True,
    },
    "women-skirts": {
        "gender": ["Women"],
        "articleType": ["Skirts"],
        "count": 5,
        "category": "women",
        "tryOn": True,
    },
    "men-shirts": {
        "gender": ["Men"],
        "articleType": ["Shirts"],
        "count": 10,
        "category": "men",
        "tryOn": True,
    },
    "men-tshirts": {
        "gender": ["Men"],
        "articleType": ["Tshirts"],
        "count": 8,
        "category": "men",
        "tryOn": True,
    },
    "men-trousers": {
        "gender": ["Men"],
        "articleType": ["Trousers", "Jeans"],
        "count": 8,
        "category": "men",
        "tryOn": True,
    },
    "men-blazers": {
        "gender": ["Men"],
        "articleType": ["Blazers", "Jackets", "Sweaters", "Sweatshirts"],
        "count": 5,
        "category": "men",
        "tryOn": True,
    },
    "accessories-jewelry": {
        "gender": ["Women", "Men", "Unisex"],
        "articleType": ["Earrings", "Necklace and Chains", "Pendant", "Bracelet", "Ring"],
        "count": 8,
        "category": "accessories",
        "tryOn": False,
    },
    "accessories-bags": {
        "gender": ["Women", "Men", "Unisex"],
        "articleType": ["Handbags", "Clutches", "Backpacks", "Messenger Bag", "Laptop Bag"],
        "count": 7,
        "category": "accessories",
        "tryOn": False,
    },
    "accessories-watches": {
        "gender": ["Women", "Men", "Unisex"],
        "articleType": ["Watches", "Sunglasses"],
        "count": 5,
        "category": "accessories",
        "tryOn": False,
    },
    "footwear-women": {
        "gender": ["Women"],
        "articleType": ["Heels", "Flats", "Casual Shoes", "Sports Shoes", "Sandals"],
        "count": 8,
        "category": "footwear",
        "tryOn": False,
    },
    "footwear-men": {
        "gender": ["Men"],
        "articleType": ["Casual Shoes", "Formal Shoes", "Sports Shoes", "Sandals"],
        "count": 7,
        "category": "footwear",
        "tryOn": False,
    },
}

# Colour mapping to our standard colors
COLOR_MAP = {
    "Navy Blue": "navy",
    "Blue": "blue",
    "Black": "black",
    "White": "white",
    "Red": "red",
    "Green": "green",
    "Pink": "pink",
    "Beige": "beige",
    "Brown": "brown",
    "Grey": "grey",
    "Silver": "silver",
    "Gold": "gold",
    "Purple": "purple",
    "Orange": "orange",
    "Yellow": "yellow",
    "Maroon": "burgundy",
    "Olive": "olive",
    "Teal": "teal",
    "Charcoal": "charcoal",
    "Cream": "cream",
    "Khaki": "khaki",
    "Tan": "tan",
    "Burgundy": "burgundy",
    "Magenta": "magenta",
    "Peach": "peach",
    "Coral": "coral",
    "Turquoise Blue": "turquoise",
    "Lavender": "lavender",
    "Rust": "rust",
    "Mauve": "mauve",
    "Multi": "multicolor",
    "Off White": "off-white",
    "Nude": "nude",
    "Rose": "rose",
    "Mustard": "mustard",
    "Sea Green": "sea-green",
    "Fluorescent Green": "neon-green",
    "Lime Green": "lime",
    "Grey Melange": "grey",
    "Steel": "steel",
    "Copper": "copper",
    "Taupe": "taupe",
}

# Usage to occasion mapping
USAGE_OCCASION = {
    "Casual": ["casual", "weekend", "everyday"],
    "Formal": ["office", "formal", "interview"],
    "Sports": ["sport", "outdoor", "active"],
    "Ethnic": ["festive", "traditional", "wedding-guest"],
    "Party": ["party", "night-out", "date-night"],
    "Smart Casual": ["smart-casual", "brunch", "dinner"],
    "Travel": ["travel", "vacation", "outdoor"],
}

# Price ranges by category
PRICE_RANGES = {
    "women-dresses": (2500, 6500),
    "women-tops": (1200, 3500),
    "women-skirts": (1500, 4000),
    "men-shirts": (1500, 4500),
    "men-tshirts": (800, 2000),
    "men-trousers": (1500, 3500),
    "men-blazers": (3500, 9500),
    "accessories-jewelry": (1200, 4500),
    "accessories-bags": (1500, 5500),
    "accessories-watches": (1500, 6500),
    "footwear-women": (1500, 5000),
    "footwear-men": (1400, 5200),
}

# Sizes by category
SIZES = {
    "women-dresses": ["XS", "S", "M", "L", "XL"],
    "women-tops": ["XS", "S", "M", "L", "XL"],
    "women-skirts": ["XS", "S", "M", "L", "XL"],
    "men-shirts": ["S", "M", "L", "XL", "XXL"],
    "men-tshirts": ["S", "M", "L", "XL", "XXL"],
    "men-trousers": ["28", "30", "32", "34", "36"],
    "men-blazers": ["S", "M", "L", "XL"],
    "accessories-jewelry": ["one-size"],
    "accessories-bags": ["one-size"],
    "accessories-watches": ["one-size"],
    "footwear-women": ["36", "37", "38", "39", "40", "41"],
    "footwear-men": ["7", "8", "9", "10", "11", "12"],
}

random.seed(42)
products = []
product_count = 0

for subcat, config in CATEGORY_MAP.items():
    # Filter candidates
    candidates = [
        r for r in rows
        if r["gender"] in config["gender"]
        and r["articleType"] in config["articleType"]
    ]

    # Sort by image size (bigger = higher quality usually)
    candidates.sort(
        key=lambda r: os.path.getsize(os.path.join(DATASET_IMAGES, f"{r['id']}.jpg")),
        reverse=True,
    )

    # Try to get variety in colors
    selected = []
    seen_colors = set()
    for c in candidates:
        color = c.get("baseColour", "")
        if len(selected) < config["count"]:
            if color not in seen_colors or len(selected) >= config["count"] // 2:
                selected.append(c)
                seen_colors.add(color)
        if len(selected) >= config["count"]:
            break

    # If not enough, just take top remaining
    if len(selected) < config["count"]:
        for c in candidates:
            if c not in selected:
                selected.append(c)
            if len(selected) >= config["count"]:
                break

    print(f"\n{subcat}: {len(selected)}/{config['count']} products")

    for i, row in enumerate(selected):
        product_count += 1
        dataset_id = row["id"]

        # Determine our product ID
        prefix_map = {
            "women-dresses": "w-dress",
            "women-tops": "w-top",
            "women-skirts": "w-skirt",
            "men-shirts": "m-shirt",
            "men-tshirts": "m-tshirt",
            "men-trousers": "m-trouser",
            "men-blazers": "m-blazer",
            "accessories-jewelry": "acc-jew",
            "accessories-bags": "acc-bag",
            "accessories-watches": "acc-watch",
            "footwear-women": "fw-w",
            "footwear-men": "fw-m",
        }
        pid = f"{prefix_map[subcat]}-{str(i+1).zfill(3)}"

        # Copy image
        src = os.path.join(DATASET_IMAGES, f"{dataset_id}.jpg")
        dst = os.path.join(OUTPUT_IMAGES, f"{pid}.jpg")
        shutil.copy2(src, dst)

        # Build product
        raw_color = row.get("baseColour", "").strip()
        color = COLOR_MAP.get(raw_color, raw_color.lower().replace(" ", "-") if raw_color else "black")

        usage = row.get("usage", "Casual").strip()
        occasions = USAGE_OCCASION.get(usage, ["casual", "everyday"])

        gender_map = {"Men": "men", "Women": "women", "Unisex": "unisex", "Boys": "men", "Girls": "women"}
        gender = gender_map.get(row["gender"], "unisex")

        display_name = row.get("productDisplayName", "").strip()
        if not display_name:
            display_name = f"{raw_color} {row['articleType']}"

        price_range = PRICE_RANGES[subcat]
        price = random.randint(price_range[0] // 100, price_range[1] // 100) * 100

        product = {
            "id": pid,
            "name": display_name,
            "description": f"{display_name}. A versatile piece perfect for {', '.join(occasions[:2])} occasions.",
            "category": config["category"],
            "subcategory": subcat,
            "occasion": occasions,
            "style": [usage.lower().replace(" ", "-")] if usage else ["casual"],
            "price": price,
            "colors": [color] if color else ["black"],
            "pattern": "solid",
            "sizes": SIZES[subcat],
            "gender": gender,
            "images": [f"/images/products/{pid}.jpg"],
            "tags": [
                row["articleType"].lower().replace(" ", "-"),
                color,
                usage.lower(),
            ],
            "tryOnCompatible": config["tryOn"],
        }
        products.append(product)
        print(f"  {pid}: {display_name} ({raw_color})")

print(f"\n\nTotal products: {product_count}")

# Generate products.ts
ts_lines = ['import { Product } from "@/lib/types";\n']
ts_lines.append("export const products: Product[] = [")

for p in products:
    ts_lines.append("  {")
    ts_lines.append(f'    id: "{p["id"]}",')
    name_escaped = p["name"].replace('"', '\\"')
    ts_lines.append(f'    name: "{name_escaped}",')
    desc_escaped = p["description"].replace('"', '\\"')
    ts_lines.append(f'    description: "{desc_escaped}",')
    ts_lines.append(f'    category: "{p["category"]}",')
    ts_lines.append(f'    subcategory: "{p["subcategory"]}",')
    ts_lines.append(f'    occasion: {json.dumps(p["occasion"])},')
    ts_lines.append(f'    style: {json.dumps(p["style"])},')
    ts_lines.append(f'    price: {p["price"]},')
    ts_lines.append(f'    colors: {json.dumps(p["colors"])},')
    ts_lines.append(f'    pattern: "{p["pattern"]}",')
    ts_lines.append(f'    sizes: {json.dumps(p["sizes"])},')
    ts_lines.append(f'    gender: "{p["gender"]}",')
    ts_lines.append(f'    images: {json.dumps(p["images"])},')
    ts_lines.append(f'    tags: {json.dumps(p["tags"])},')
    ts_lines.append(f'    tryOnCompatible: {"true" if p["tryOnCompatible"] else "false"},')
    ts_lines.append("  },")

ts_lines.append("];\n")

# Add helper functions
ts_lines.append("""
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(subcategory: string): Product[] {
  return products.filter((p) => p.subcategory === subcategory);
}

export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  const terms = lower.split(/\\s+/);
  return products
    .map((p) => {
      const searchable = [
        p.name,
        p.description,
        ...p.tags,
        ...p.colors,
        ...p.occasion,
        ...p.style,
        p.pattern,
        p.subcategory,
        p.category,
      ]
        .join(" ")
        .toLowerCase();
      const score = terms.reduce((acc, term) => acc + (searchable.includes(term) ? 1 : 0), 0);
      return { product: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.product);
}

export function filterProducts(opts: {
  subcategory?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  occasion?: string[];
  sizes?: string[];
}): Product[] {
  return products.filter((p) => {
    if (opts.subcategory && p.subcategory !== opts.subcategory) return false;
    if (opts.gender && p.gender !== opts.gender && p.gender !== "unisex") return false;
    if (opts.minPrice && p.price < opts.minPrice) return false;
    if (opts.maxPrice && p.price > opts.maxPrice) return false;
    if (opts.colors?.length && !opts.colors.some((c) => p.colors.includes(c))) return false;
    if (opts.occasion?.length && !opts.occasion.some((o) => p.occasion.includes(o))) return false;
    if (opts.sizes?.length && !opts.sizes.some((s) => p.sizes.includes(s))) return false;
    return true;
  });
}
""")

with open(OUTPUT_TS, "w") as f:
    f.write("\n".join(ts_lines))

print(f"\nWrote {OUTPUT_TS} with {product_count} products")
print(f"Images copied to {OUTPUT_IMAGES}/")
