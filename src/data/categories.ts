import { CategoryConfig } from "@/lib/types";

export const categories: CategoryConfig[] = [
  {
    slug: "women-dresses",
    name: "Dresses",
    gender: "women",
    subcategories: ["midi-dress", "maxi-dress", "mini-dress", "party-dress", "casual-dress", "wrap-dress"],
    image: "/images/categories/women-dresses.jpg",
  },
  {
    slug: "women-tops",
    name: "Tops & Blouses",
    gender: "women",
    subcategories: ["blouse", "crop-top", "t-shirt", "tank-top", "tunic"],
    image: "/images/categories/women-tops.jpg",
  },
  {
    slug: "women-skirts",
    name: "Skirts",
    gender: "women",
    subcategories: ["mini-skirt", "midi-skirt", "maxi-skirt", "pleated-skirt", "a-line-skirt"],
    image: "/images/categories/women-skirts.jpg",
  },
  {
    slug: "women-jeans",
    name: "Jeans & Trousers",
    gender: "women",
    subcategories: ["skinny-jeans", "wide-leg", "straight-fit", "palazzo", "culottes"],
    image: "/images/categories/women-jeans.jpg",
  },
  {
    slug: "women-ethnic",
    name: "Ethnic Wear",
    gender: "women",
    subcategories: ["kurta", "saree", "lehenga", "salwar-suit", "anarkali"],
    image: "/images/categories/women-ethnic.jpg",
  },
  {
    slug: "men-shirts",
    name: "Shirts",
    gender: "men",
    subcategories: ["formal-shirt", "casual-shirt", "linen-shirt", "oxford-shirt", "printed-shirt"],
    image: "/images/categories/men-shirts.jpg",
  },
  {
    slug: "men-tshirts",
    name: "T-Shirts",
    gender: "men",
    subcategories: ["polo", "round-neck", "v-neck", "henley", "graphic-tee"],
    image: "/images/categories/men-tshirts.jpg",
  },
  {
    slug: "men-trousers",
    name: "Trousers & Jeans",
    gender: "men",
    subcategories: ["chinos", "formal-trousers", "jeans", "joggers", "shorts"],
    image: "/images/categories/men-trousers.jpg",
  },
  {
    slug: "men-blazers",
    name: "Blazers & Jackets",
    gender: "men",
    subcategories: ["blazer", "bomber-jacket", "denim-jacket", "leather-jacket", "sport-coat"],
    image: "/images/categories/men-blazers.jpg",
  },
  {
    slug: "men-ethnic",
    name: "Ethnic Wear",
    gender: "men",
    subcategories: ["kurta", "sherwani", "nehru-jacket", "dhoti-kurta"],
    image: "/images/categories/men-ethnic.jpg",
  },
  {
    slug: "accessories-jewelry",
    name: "Jewelry",
    gender: "unisex",
    subcategories: ["necklace", "earrings", "bracelet", "ring", "pendant"],
    image: "/images/categories/accessories-jewelry.jpg",
  },
  {
    slug: "accessories-bags",
    name: "Bags",
    gender: "unisex",
    subcategories: ["handbag", "clutch", "tote", "backpack", "sling-bag"],
    image: "/images/categories/accessories-bags.jpg",
  },
  {
    slug: "accessories-watches",
    name: "Watches & Sunglasses",
    gender: "unisex",
    subcategories: ["analog-watch", "digital-watch", "sunglasses", "aviators"],
    image: "/images/categories/accessories-watches.jpg",
  },
  {
    slug: "footwear-women",
    name: "Women's Footwear",
    gender: "women",
    subcategories: ["heels", "flats", "sandals", "sneakers", "wedges", "boots"],
    image: "/images/categories/footwear-women.jpg",
  },
  {
    slug: "footwear-men",
    name: "Men's Footwear",
    gender: "men",
    subcategories: ["formal-shoes", "sneakers", "loafers", "sandals", "boots"],
    image: "/images/categories/footwear-men.jpg",
  },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoriesByGender(gender: "men" | "women" | "unisex"): CategoryConfig[] {
  return categories.filter((c) => c.gender === gender || c.gender === "unisex");
}
