export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  category: "men" | "women" | "accessories" | "footwear";
  subcategory: string;
  occasion: string[];
  style: string[];
  price: number;
  /** Original price, set only when the product is discounted */
  mrp?: number;
  colors: string[];
  pattern: string;
  sizes: string[];
  gender: "men" | "women" | "unisex";
  images: string[];
  tags: string[];
  /** Display-ready details, e.g. { Fabric: "Cotton", Fit: "Slim Fit" } */
  attributes: Record<string, string>;
  care?: string;
  tryOnCompatible: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  lookRecommendation?: {
    title: string;
    products: Product[];
    totalPrice: number;
  };
  timestamp: number;
}

export type ModelMode = "selfie" | "avatar" | "preset";

export interface StudioSession {
  modelMode: ModelMode;
  modelImage: string | null;
  size: string;
  gender: "men" | "women";
  slots: {
    top: Product | null;
    bottom: Product | null;
    footwear: Product | null;
    accessory1: Product | null;
    accessory2: Product | null;
  };
  generatedLook: string | null;
}

export interface CategoryConfig {
  slug: string;
  name: string;
  gender: "men" | "women" | "unisex";
  subcategories: string[];
  image: string;
}
