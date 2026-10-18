import { Firestore } from "@google-cloud/firestore";
import { Product } from "./types";
import { products as localProducts } from "@/data/products";

const IMAGE_BASE = "/images/products";
const FIRESTORE_PROBE_TIMEOUT_MS = 3000;

let db: Firestore;
// null = untested, true = Firestore reachable, false = fall back to local catalog.
// The local catalog (src/data/products.ts) mirrors the Firestore "products"
// collection, so dev/preview environments without GCP credentials still work.
let firestoreAvailable: boolean | null = null;

function getDb() {
  if (!db) {
    db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT || "styleagent-hackathon",
    });
  }
  return db;
}

async function withLocalFallback<T>(
  op: () => Promise<T>,
  local: () => T
): Promise<T> {
  if (firestoreAvailable === false) return local();
  try {
    const result = await Promise.race([
      op(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("firestore-unreachable")),
          FIRESTORE_PROBE_TIMEOUT_MS
        )
      ),
    ]);
    firestoreAvailable = true;
    return result;
  } catch (err) {
    // Only latch to fallback on the first probe; once Firestore is known
    // good (deployed env), transient errors shouldn't disable it.
    if (firestoreAvailable === null) firestoreAvailable = false;
    return local();
  }
}

export async function getAllProducts(): Promise<Product[]> {
  return withLocalFallback(
    async () => {
      const snapshot = await getDb().collection("products").get();
      return snapshot.docs.map((doc) => doc.data() as Product);
    },
    () => localProducts
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  return withLocalFallback(
    async () => {
      const doc = await getDb().collection("products").doc(id).get();
      if (!doc.exists) return null;
      return doc.data() as Product;
    },
    () => localProducts.find((p) => p.id === id) || null
  );
}

export async function getProductsByCategory(subcategory: string): Promise<Product[]> {
  return withLocalFallback(
    async () => {
      const snapshot = await getDb()
        .collection("products")
        .where("subcategory", "==", subcategory)
        .get();
      return snapshot.docs.map((doc) => doc.data() as Product);
    },
    () => localProducts.filter((p) => p.subcategory === subcategory)
  );
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

export function getProductImageUrl(productId: string): string {
  return `${IMAGE_BASE}/${productId}.jpg`;
}
