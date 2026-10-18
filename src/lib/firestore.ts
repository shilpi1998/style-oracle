import { Firestore } from "@google-cloud/firestore";
import { Product } from "./types";

const GCS_BASE = "https://storage.googleapis.com/style-oracle-images/products";

let db: Firestore;

function getDb() {
  if (!db) {
    db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || "styleagent-hackathon",
    });
  }
  return db;
}

export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDb().collection("products").get();
  return snapshot.docs.map((doc) => doc.data() as Product);
}

export async function getProductById(id: string): Promise<Product | null> {
  const doc = await getDb().collection("products").doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as Product;
}

export async function getProductsByCategory(subcategory: string): Promise<Product[]> {
  const snapshot = await getDb()
    .collection("products")
    .where("subcategory", "==", subcategory)
    .get();
  return snapshot.docs.map((doc) => doc.data() as Product);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const all = await getAllProducts();
  const q = query.toLowerCase();
  const terms = q.split(/\s+/);

  return all
    .map((p) => {
      const searchable = [
        p.name,
        p.description,
        ...p.tags,
        ...p.colors,
        ...p.occasion,
        ...p.style,
        p.subcategory,
        p.gender,
        p.pattern,
      ]
        .join(" ")
        .toLowerCase();

      const score = terms.reduce(
        (s, term) => s + (searchable.includes(term) ? 1 : 0),
        0
      );
      return { product: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.product);
}

export async function filterProducts(filters: {
  subcategory?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  occasion?: string[];
}): Promise<Product[]> {
  const all = await getAllProducts();

  return all.filter((p) => {
    if (filters.subcategory && p.subcategory !== filters.subcategory) return false;
    if (filters.gender && p.gender !== filters.gender) return false;
    if (filters.minPrice && p.price < filters.minPrice) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    if (filters.colors?.length) {
      if (!filters.colors.some((c) => p.colors.includes(c))) return false;
    }
    if (filters.occasion?.length) {
      if (!filters.occasion.some((o) => p.occasion.includes(o))) return false;
    }
    return true;
  });
}

export function getGcsImageUrl(productId: string): string {
  return `${GCS_BASE}/${productId}.jpg`;
}
