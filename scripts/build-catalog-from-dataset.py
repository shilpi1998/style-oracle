"""
Build the StyleAgent product catalog from the full Kaggle "Fashion Product Images Dataset"
(https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-dataset).

Picks good-quality products per category, copies + resizes their photos (plus extra
angles from the Myntra CDN), and generates src/data/products.ts.

Usage (from the project root, macOS — resizing uses the built-in `sips`):
    python3 scripts/build-catalog-from-dataset.py [path/to/fashion-dataset]

The dataset path defaults to $FASHION_DATASET or ~/datasets/fashion-dataset.
"""
import csv
import glob
import html
import json
import os
import random
import re
import subprocess
import sys
import tempfile
import urllib.request
from concurrent.futures import ThreadPoolExecutor

DATASET_DIR = os.path.expanduser(
    sys.argv[1] if len(sys.argv) > 1
    else os.environ.get("FASHION_DATASET", "~/datasets/fashion-dataset")
)
DATASET_CSV = os.path.join(DATASET_DIR, "styles.csv")
DATASET_STYLES = os.path.join(DATASET_DIR, "styles")
DATASET_IMAGES = os.path.join(DATASET_DIR, "images")

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_IMAGES = os.path.join(PROJECT_ROOT, "public/images/products")
OUTPUT_CATEGORY_IMAGES = os.path.join(PROJECT_ROOT, "public/images/categories")
OUTPUT_TS = os.path.join(PROJECT_ROOT, "src/data/products.ts")

MAX_IMAGES_PER_PRODUCT = 3
IMAGE_MAX_DIMENSION = 1067  # 800x1067 for the dataset's 3:4 photos
IMAGE_QUALITY = 75
MAX_PER_BRAND = 3  # per category, for variety

# Store categories and the dataset articleTypes that feed them
CATEGORY_MAP = {
    "women-dresses": {
        "prefix": "w-dress", "gender": ["Women"], "category": "women", "tryOn": True, "count": 30,
        "articleType": ["Dresses", "Jumpsuit"],
    },
    "women-tops": {
        "prefix": "w-top", "gender": ["Women"], "category": "women", "tryOn": True, "count": 30,
        "articleType": ["Tops", "Tshirts", "Shirts", "Tunics"],
    },
    "women-skirts": {
        "prefix": "w-skirt", "gender": ["Women"], "category": "women", "tryOn": True, "count": 15,
        "articleType": ["Skirts"],
    },
    "women-jeans": {
        "prefix": "w-jeans", "gender": ["Women"], "category": "women", "tryOn": True, "count": 24,
        "articleType": ["Jeans", "Trousers", "Jeggings", "Capris"],
    },
    "women-ethnic": {
        "prefix": "w-ethnic", "gender": ["Women"], "category": "women", "tryOn": True, "count": 30,
        "articleType": ["Kurtas", "Kurtis", "Sarees", "Kurta Sets"],
    },
    "men-shirts": {
        "prefix": "m-shirt", "gender": ["Men"], "category": "men", "tryOn": True, "count": 30,
        "articleType": ["Shirts"],
    },
    "men-tshirts": {
        "prefix": "m-tshirt", "gender": ["Men"], "category": "men", "tryOn": True, "count": 24,
        "articleType": ["Tshirts"],
    },
    "men-trousers": {
        "prefix": "m-trouser", "gender": ["Men"], "category": "men", "tryOn": True, "count": 24,
        "articleType": ["Trousers", "Jeans", "Shorts"],
    },
    "men-blazers": {
        "prefix": "m-blazer", "gender": ["Men"], "category": "men", "tryOn": True, "count": 18,
        "articleType": ["Blazers", "Jackets", "Sweaters", "Sweatshirts"],
    },
    "men-ethnic": {
        "prefix": "m-ethnic", "gender": ["Men"], "category": "men", "tryOn": True, "count": 18,
        "maxPerBrand": 14,  # nearly all men's ethnic wear in the dataset is Fabindia
        "articleType": ["Kurtas", "Nehru Jackets", "Sherwani"],
    },
    "accessories-jewelry": {
        "prefix": "acc-jew", "gender": ["Women", "Men", "Unisex"], "category": "accessories", "tryOn": False, "count": 24,
        "articleType": ["Earrings", "Necklace and Chains", "Pendant", "Bracelet", "Ring", "Bangle", "Jewellery Set"],
    },
    "accessories-bags": {
        "prefix": "acc-bag", "gender": ["Women", "Men", "Unisex"], "category": "accessories", "tryOn": False, "count": 24,
        "articleType": ["Handbags", "Clutches", "Backpacks", "Messenger Bag", "Laptop Bag", "Duffel Bag"],
    },
    "accessories-watches": {
        "prefix": "acc-watch", "gender": ["Women", "Men", "Unisex"], "category": "accessories", "tryOn": False, "count": 24,
        "articleType": ["Watches", "Sunglasses"],
    },
    "footwear-women": {
        "prefix": "fw-w", "gender": ["Women"], "category": "footwear", "tryOn": False, "count": 24,
        "articleType": ["Heels", "Flats", "Casual Shoes", "Sports Shoes", "Sandals"],
    },
    "footwear-men": {
        "prefix": "fw-m", "gender": ["Men"], "category": "footwear", "tryOn": False, "count": 24,
        "articleType": ["Casual Shoes", "Formal Shoes", "Sports Shoes", "Sandals"],
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
    "Bronze": "bronze",
    "Metallic": "metallic",
    "Mushroom Brown": "brown",
    "Coffee Brown": "brown",
    "Skin": "nude",
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

# Fallback sizes when the dataset has none
DEFAULT_SIZES = {
    "women": ["XS", "S", "M", "L", "XL"],
    "men": ["S", "M", "L", "XL", "XXL"],
    "accessories": ["One Size"],
    "footwear-women": ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7"],
    "footwear-men": ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
}

# articleAttributes shown in the product page's details table, in display order
ATTRIBUTE_KEYS = [
    "Fabric", "Material", "Fit", "Pattern", "Print or Pattern Type", "Sleeve Length", "Neck",
    "Collar", "Length", "Waist Rise", "Closure", "Fastening", "Ankle Height", "Heel Type",
    "Heel Height", "Dial Shape", "Strap Material", "Lens Colour", "Frame Material", "Type",
    "Occasion", "Wash Care", "Warranty",
]

# Pattern words in product names, for products without a Pattern attribute
NAME_PATTERNS = {
    "printed": "printed", "print": "printed", "striped": "striped", "stripes": "striped",
    "checked": "checked", "check": "checked", "floral": "floral", "embroidered": "embroidered",
    "polka": "polka-dots",
}

SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def clean_html(raw):
    text = html.unescape(re.sub(r"<[^>]+>", " ", raw or ""))
    return re.sub(r"\s+", " ", text).strip()


def truncate(text, limit=450):
    if len(text) <= limit:
        return text
    cut = text[:limit]
    end = cut.rfind(". ")
    return cut[: end + 1] if end > limit // 2 else cut.rsplit(" ", 1)[0] + "…"


INTRO_HEADINGS = ("composition", "features", "product details", "description", "style note")


# Headings that Myntra sometimes writes as a plain line instead of bold text
PLAIN_HEADING_RE = re.compile(
    r"^\s*(composition|features|fit|fitting|wash care|care|care instructions|material|fabric"
    r"|style note|model'?s? statistics)\s*:?\s*$",
    re.I | re.M,
)


def to_sentences(text):
    """Join the lines of a section into sentences, dropping repeated lines."""
    lines = [l.strip(" :-") for l in text.split("\n")]
    lines = list(dict.fromkeys(l for l in lines if l))
    return " ".join(l if l[-1] in ".!?" else l + "." for l in lines)


def parse_sections(raw):
    """Split Myntra's description HTML (bold or plain-line headings + <br> lines) into
    (intro sentences, care sentences, specs). Specs are short "Heading: value" sections."""
    bold = lambda m: f"\n§{clean_html(m.group(m.lastindex))}§\n"
    h = re.sub(r"<(strong|b)\b[^>]*>(.*?)</\1>", bold, raw or "", flags=re.S | re.I)
    h = re.sub(r"<span[^>]*font-weight:\s*bold[^>]*>(.*?)</span>", bold, h, flags=re.S | re.I)
    h = re.sub(r"<br\s*/?>|</p>|</li>", "\n", h, flags=re.I)
    text = html.unescape(re.sub(r"<[^>]+>", " ", h))
    text = re.sub(r"&\s*ndash;?", "–", text).replace("\xa0", " ").replace("\r", "\n")
    text = text.replace("Â", "")  # leftover from double-encoded non-breaking spaces
    text = re.sub(r"[ \t]+", " ", text)
    text = PLAIN_HEADING_RE.sub(lambda m: f"§{m.group(1)}§", text)

    parts = re.split(r"§([^§]*)§", text)
    intro, sections = [to_sentences(parts[0])], []
    for heading, body in zip(parts[1::2], parts[2::2]):
        heading = heading.strip(" :")
        if heading:
            sections.append([heading, body])
        elif sections:
            sections[-1][1] += body

    care, specs = [], {}
    for heading, body in sections:
        key = heading.lower()
        if key == "wash" and body.strip().lower().startswith("care"):
            key, body = "wash care", body.strip()[4:]
        if key == "model" or "statistics" in key or body.strip().lower().startswith("statistics"):
            continue  # "Model statistics: size M on a model of height 5'8"..."
        value = to_sentences(body)
        if not value:
            continue
        if key in INTRO_HEADINGS:
            intro.append(value)
        elif "care" in key or key == "wash":
            # Care lines are short; a long line after them is usually the style note
            lines = [l.strip() for l in body.split("\n") if l.strip()]
            care.append(to_sentences("\n".join(l for l in lines if len(l) <= 70)))
            intro.append(to_sentences("\n".join(l for l in lines if len(l) > 70)))
        elif key in ("fit", "fitting") and len(value) <= 60:
            specs["Fit"] = value.rstrip(".")
        elif len(value) <= 60 and len(heading) <= 25:
            specs[heading[0].upper() + heading[1:]] = value.rstrip(".")
        else:
            intro.append(f"{heading}: {value}")
    return [i for i in intro if i], [c for c in care if c], specs


def parse_description(raw):
    """Returns (description, care, specs) from a product's description HTML."""
    intro, care, specs = parse_sections(raw)
    description = truncate(" ".join(intro))
    description = description[:1].upper() + description[1:]
    return description, truncate(" ".join(care), 200), specs


def normalize_size(v):
    v = (v or "").strip()
    if not v or v.upper() == "NA":
        return None
    if v.upper() in ("ONESIZE", "ONE SIZE", "FREESIZE", "FREE SIZE", "FREE"):
        return "One Size"
    m = re.match(r"^(UK|US|EURO|EU)\s*(\d+(\.\d+)?)$", v, re.I)
    if m:
        scale = "EU" if m.group(1).upper() in ("EURO", "EU") else m.group(1).upper()
        return f"{scale} {m.group(2)}"
    return v.upper() if v.upper() in SIZE_ORDER else v


def size_sort_key(s):
    if s in SIZE_ORDER:
        return (0, SIZE_ORDER.index(s), 0.0)
    num = re.search(r"\d+(\.\d+)?", s)
    return (1, 0, float(num.group()) if num else 0.0)


def load_style(dataset_id):
    path = os.path.join(DATASET_STYLES, f"{dataset_id}.json")
    try:
        with open(path, errors="replace") as f:
            return json.load(f)["data"]
    except (OSError, ValueError, KeyError):
        return None


def extra_image_urls(data):
    """URLs of the non-default photo angles (front/back/left/right/top)."""
    urls = []
    style_images = data.get("styleImages") if isinstance(data.get("styleImages"), dict) else {}
    default = style_images.get("default")
    default_url = default.get("imageURL") if isinstance(default, dict) else None
    for key in ("front", "back", "left", "right", "top"):
        img = style_images.get(key)
        if not isinstance(img, dict) or not img.get("imageURL") or img["imageURL"] == default_url:
            continue
        res = img.get("resolutions") or {}
        urls.append(res.get("1080X1440") or img["imageURL"])
    return urls


def is_good_candidate(row, data):
    image = os.path.join(DATASET_IMAGES, f"{row['id']}.jpg")
    if not os.path.exists(image) or os.path.getsize(image) < 20_000:
        return False
    if not data or not data.get("brandName") or not data.get("price"):
        return False
    if not (data.get("ageGroup") or "Adults").startswith("Adults"):
        return False  # skip kids' products
    desc, _, _ = parse_description(((data.get("productDescriptors") or {}).get("description") or {}).get("value"))
    if len(desc) < 80 or "Ã" in desc or re.search(r"\bkids?\b|\bchildren\b", desc, re.I):
        return False
    return len(extra_image_urls(data)) >= 1


def select_products(rows, config, rng):
    """Round-robin across article types so mixed categories stay varied."""
    pools = {}
    for article_type in config["articleType"]:
        candidates = [
            r for r in rows
            if r["gender"] in config["gender"] and r["articleType"] == article_type
        ]
        rng.shuffle(candidates)
        good = []
        for r in candidates:
            data = load_style(r["id"])
            if is_good_candidate(r, data):
                good.append((r, data))
            if len(good) >= config["count"] * 3:
                break
        pools[article_type] = good

    selected, brand_counts, seen_colors = [], {}, set()
    # First pass prefers unseen colours; second pass fills up regardless
    for prefer_new_colors in (True, False):
        progress = True
        while len(selected) < config["count"] and progress:
            progress = False
            for article_type in config["articleType"]:
                pool = pools[article_type]
                for i, (r, data) in enumerate(pool):
                    brand = data["brandName"]
                    if brand_counts.get(brand, 0) >= config.get("maxPerBrand", MAX_PER_BRAND):
                        continue
                    if prefer_new_colors and r["baseColour"] in seen_colors:
                        continue
                    selected.append((r, data))
                    brand_counts[brand] = brand_counts.get(brand, 0) + 1
                    seen_colors.add(r["baseColour"])
                    pool.pop(i)
                    progress = True
                    break
                if len(selected) >= config["count"]:
                    break
            if prefer_new_colors and len(seen_colors) >= config["count"] // 2:
                break
    return selected


def resize_image(src, dst):
    subprocess.run(
        ["sips", "-Z", str(IMAGE_MAX_DIMENSION), "-s", "format", "jpeg",
         "-s", "formatOptions", str(IMAGE_QUALITY), src, "--out", dst],
        check=True, capture_output=True,
    )


def download(url, dst):
    req = urllib.request.Request(url.replace("http://", "https://"), headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp, open(dst, "wb") as f:
        f.write(resp.read())


def build_images(pid, row, data):
    """Copy the main photo and download extra angles. Returns public image paths."""
    images = []
    main = os.path.join(OUTPUT_IMAGES, f"{pid}.jpg")
    resize_image(os.path.join(DATASET_IMAGES, f"{row['id']}.jpg"), main)
    images.append(f"/images/products/{pid}.jpg")

    for url in extra_image_urls(data):
        if len(images) >= MAX_IMAGES_PER_PRODUCT:
            break
        n = len(images) + 1
        with tempfile.NamedTemporaryFile(suffix=".jpg") as tmp:
            try:
                download(url, tmp.name)
                resize_image(tmp.name, os.path.join(OUTPUT_IMAGES, f"{pid}-{n}.jpg"))
            except Exception as e:
                print(f"  ! {pid}: skipped extra image ({e})")
                continue
        images.append(f"/images/products/{pid}-{n}.jpg")
    return images


def build_product(pid, subcat, config, row, data, images):
    raw_color = (data.get("baseColour") or row.get("baseColour") or "").strip()
    colors = [COLOR_MAP.get(raw_color, slugify(raw_color) or "black")]
    secondary = (data.get("colour1") or "").strip()
    if secondary and secondary != "NA" and COLOR_MAP.get(secondary, slugify(secondary)) not in colors:
        colors.append(COLOR_MAP.get(secondary, slugify(secondary)))

    descriptors = data.get("productDescriptors") or {}
    description, care, specs = parse_description((descriptors.get("description") or {}).get("value"))
    # Some products keep care instructions in a separate field, with or without headings
    care_intro, care_sections, care_specs = parse_sections((descriptors.get("materials_care_desc") or {}).get("value"))
    care = care or truncate(" ".join(care_sections or care_intro), 200)
    specs = {**care_specs, **specs}
    # That field usually starts with the material: "100% viscose. Gentle handwash..."
    m = re.match(r"^([^.]{2,25})\. (.+)$", care)
    if m and len(m.group(1).split()) <= 3 and not re.search(r"wash|wipe|clean|iron|dry", m.group(1), re.I):
        specs.setdefault("Material", m.group(1)[:1].upper() + m.group(1)[1:])
        care = m.group(2)

    attrs = data.get("articleAttributes") or {}
    attributes = {
        k: attrs[k].strip() for k in ATTRIBUTE_KEYS
        if isinstance(attrs.get(k), str) and attrs[k].strip() and attrs[k].strip().upper() != "NA"
    }
    # Fill gaps from "Heading: value" specs in the description (e.g. Fit, Case diameter)
    for k, v in specs.items():
        if k not in attributes and k.lower() not in (a.lower() for a in attributes):
            attributes[k] = v

    usage = (data.get("usage") or row.get("usage") or "Casual").strip()
    occasions = list(USAGE_OCCASION.get(usage, ["casual", "everyday"]))
    if attributes.get("Occasion"):
        occ = slugify(attributes["Occasion"])
        if occ and occ not in occasions:
            occasions.append(occ)

    sizes = sorted(
        {s for s in (normalize_size(o.get("value")) for o in data.get("styleOptions") or []) if s},
        key=size_sort_key,
    )
    if not sizes:
        sizes = DEFAULT_SIZES.get(subcat) or DEFAULT_SIZES[config["category"]]

    mrp = int(data["price"])
    price = int(data.get("discountedPrice") or mrp)
    name = data.get("productDisplayName") or row["productDisplayName"]
    name_pattern = re.search(r"\b(printed|print|striped|stripes|checked|check|floral|embroidered|polka)\b", name, re.I)
    pattern = slugify(
        attributes.get("Pattern") or attributes.get("Print or Pattern Type")
        or (NAME_PATTERNS[name_pattern.group(1).lower()] if name_pattern else "solid")
    )

    brand = data["brandName"].strip()
    if brand.isupper() and len(brand) > 4:
        brand = brand.title()  # "AURELIA" -> "Aurelia"; short acronyms like "UCB" stay

    gender = {"Men": "men", "Women": "women"}.get(row["gender"], "unisex")
    tags = [slugify(row["articleType"]), slugify(brand), *colors, slugify(usage), pattern]
    for k in ("Fabric", "Material", "Fit", "Sleeve Length", "Neck"):
        if attributes.get(k):
            tags.append(slugify(attributes[k]))

    product = {
        "id": pid,
        "name": name,
        "brand": brand,
        "description": description,
        "category": config["category"],
        "subcategory": subcat,
        "occasion": occasions,
        "style": [slugify(usage)],
        "price": price,
        "colors": colors,
        "pattern": pattern,
        "sizes": sizes,
        "gender": gender,
        "images": images,
        "tags": list(dict.fromkeys(t for t in tags if t)),
        "attributes": attributes,
        "tryOnCompatible": config["tryOn"],
    }
    if mrp > price:
        product["mrp"] = mrp
    if care:
        product["care"] = care
    return product


def main():
    if not os.path.exists(DATASET_CSV):
        sys.exit(f"Dataset not found at {DATASET_DIR} (expected styles.csv, styles/, images/)")

    with open(DATASET_CSV, errors="replace") as f:
        rows = list(csv.DictReader(f))
    print(f"Dataset rows: {len(rows)}")

    rng = random.Random(42)
    selections = []
    for subcat, config in CATEGORY_MAP.items():
        chosen = select_products(rows, config, rng)
        print(f"{subcat}: {len(chosen)}/{config['count']} products")
        for i, (row, data) in enumerate(chosen):
            selections.append((f"{config['prefix']}-{i + 1:03d}", subcat, config, row, data))

    # Replace previously generated images
    os.makedirs(OUTPUT_IMAGES, exist_ok=True)
    os.makedirs(OUTPUT_CATEGORY_IMAGES, exist_ok=True)
    for old in glob.glob(os.path.join(OUTPUT_IMAGES, "*.jpg")) + glob.glob(os.path.join(OUTPUT_CATEGORY_IMAGES, "*.jpg")):
        os.remove(old)

    print(f"\nBuilding images for {len(selections)} products...")
    with ThreadPoolExecutor(max_workers=12) as pool:
        all_images = list(pool.map(lambda s: build_images(s[0], s[3], s[4]), selections))

    products = [
        build_product(pid, subcat, config, row, data, images)
        for (pid, subcat, config, row, data), images in zip(selections, all_images)
    ]

    # Category cover = first product photo of each category
    for subcat in CATEGORY_MAP:
        cover = next(p for p in products if p["subcategory"] == subcat)
        src = os.path.join(PROJECT_ROOT, "public", cover["images"][0].lstrip("/"))
        subprocess.run(["cp", src, os.path.join(OUTPUT_CATEGORY_IMAGES, f"{subcat}.jpg")], check=True)

    write_products_ts(products)
    total_images = sum(len(p["images"]) for p in products)
    print(f"\nWrote {OUTPUT_TS}: {len(products)} products, {total_images} images")


def write_products_ts(products):
    def js(v):
        return json.dumps(v, ensure_ascii=False)

    ts_lines = ['import { Product } from "@/lib/types";\n']
    ts_lines.append("// Generated by scripts/build-catalog-from-dataset.py — do not edit by hand.")
    ts_lines.append("export const products: Product[] = [")
    for p in products:
        ts_lines.append("  {")
        for key, value in p.items():
            ts_lines.append(f"    {key}: {js(value)},")
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
        p.brand,
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


if __name__ == "__main__":
    main()
