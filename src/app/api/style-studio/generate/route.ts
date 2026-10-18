import { NextRequest, NextResponse } from "next/server";
import {
  generateImage,
  tryOnProducts,
  generateAvatar,
  ProductImage,
} from "@/lib/imagen";

interface OutfitItem {
  name: string;
  colors: string[];
  subcategory: string;
  description: string;
  imageUrl?: string;
}

const editorialBackgrounds: Record<string, string> = {
  casual:
    "a sunlit Mumbai cafe with warm wooden interiors and lush green plants",
  party:
    "a glamorous rooftop bar at night with city skyline lights and fairy lights",
  formal:
    "a grand marble hotel lobby with chandeliers and elegant architecture",
  wedding:
    "a majestic Indian palace garden with fountains and marigold decorations",
  festive:
    "a beautifully lit Diwali celebration with diyas, rangoli, and warm golden lights",
  beach: "a stunning Goa beach at golden hour with palm trees and ocean waves",
  weekend:
    "a charming street in Jaipur with colorful buildings and bustling markets",
  everyday:
    "a modern coworking space with floor-to-ceiling windows and city views",
  date: "a romantic candlelit restaurant with soft ambient lighting",
  office: "a sleek modern office with glass walls and minimalist decor",
};

function buildTextPrompt(
  items: OutfitItem[],
  gender: string,
  occasion: string,
  mode: "studio" | "editorial" = "studio"
): string {
  const clothingDescriptions = items
    .map((item) => {
      const color = item.colors?.[0] || "";
      return `${color} ${item.name}`.trim();
    })
    .join(", ");

  const modelGender = gender === "men" ? "male" : "female";

  if (mode === "editorial") {
    const bg = editorialBackgrounds[occasion] || editorialBackgrounds.casual;
    return `A stunning fashion editorial photograph of a young Indian ${modelGender} model wearing: ${clothingDescriptions}. The model is posed confidently in ${bg}. Cinematic lighting, shallow depth of field with beautiful bokeh, golden hour warmth. The outfit is styled perfectly for a ${occasion} occasion. Fashion magazine cover quality, 8k resolution, Vogue India editorial style.`;
  }

  return `A professional full-body fashion photograph of a young Indian ${modelGender} model wearing: ${clothingDescriptions}. The model is posing naturally in a clean, minimal studio setting with soft lighting. The outfit is styled for a ${occasion} occasion. The clothing fits perfectly and looks elegant. High-fashion editorial photography, sharp focus, fashion magazine quality.`;
}

function buildTryOnPrompt(
  items: OutfitItem[],
  gender: string,
  occasion: string,
  mode: "studio" | "editorial",
  isAvatar: boolean
): string {
  const itemCount = items.length;
  const itemList = items
    .map((item, i) => `Image ${i + 2} (${item.colors?.[0] || ""} ${item.name})`)
    .join(", ");

  if (mode === "editorial") {
    const bg = editorialBackgrounds[occasion] || editorialBackgrounds.casual;
    return `Generate a new image showing the SAME person from Image 1 wearing ALL these exact catalog products: ${itemList}. Keep the person's identity (face, hair, skin tone) exactly the same. Style them in ${bg}. Cinematic lighting, shallow depth of field, Vogue India editorial quality. Full body shot.`;
  }

  const personRef = isAvatar ? "avatar" : "person";
  return `Generate a new image showing the SAME ${personRef} from Image 1 wearing ALL ${itemCount > 1 ? "these exact catalog products" : "this exact catalog product"}: ${itemList}. Keep the ${personRef}'s identity (face, hair, skin tone, body) exactly the same. Only change their clothing to match the catalog product${itemCount > 1 ? "s" : ""}. Combine all the products into one complete styled outfit for a ${occasion} occasion. Full body shot, professional fashion photography, clean white studio background.`;
}

async function fetchProductImage(
  url: string
): Promise<ProductImage | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return { data: base64, mimeType: contentType };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      gender,
      occasion,
      mode = "studio",
      personImage,
      personMimeType,
      modelMode,
    } = body as {
      items: OutfitItem[];
      gender: string;
      occasion?: string;
      mode?: "studio" | "editorial";
      personImage?: string;
      personMimeType?: string;
      modelMode?: "selfie" | "avatar" | "preset";
    };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    const occ = occasion || "casual";

    // --- SELFIE / AVATAR MODE: image editing with person photo + product images ---
    if (
      (modelMode === "selfie" || modelMode === "avatar") &&
      personImage
    ) {
      const productImages: ProductImage[] = [];
      for (const item of items) {
        if (item.imageUrl) {
          const img = await fetchProductImage(item.imageUrl);
          if (img) productImages.push(img);
        }
      }

      const prompt = buildTryOnPrompt(
        items,
        gender,
        occ,
        mode,
        modelMode === "avatar"
      );

      if (productImages.length === 0) {
        // Fallback: no product images available, use text-only with person image
        const result = await tryOnProducts({
          personImage,
          personMimeType: personMimeType || "image/jpeg",
          productImages: [],
          prompt: buildTryOnPrompt(items, gender, occ, mode, modelMode === "avatar"),
        });
        return NextResponse.json({
          image: `data:${result.mimeType};base64,${result.image}`,
          prompt,
        });
      }

      const result = await tryOnProducts({
        personImage,
        personMimeType: personMimeType || "image/jpeg",
        productImages,
        prompt,
      });

      return NextResponse.json({
        image: `data:${result.mimeType};base64,${result.image}`,
        prompt,
      });
    }

    // --- PRESET MODE: text-only generation (no person photo) ---
    const prompt = buildTextPrompt(items, gender, occ, mode);
    const result = await generateImage({
      prompt,
      negativePrompt:
        "deformed, blurry, low quality, distorted face, extra limbs, bad anatomy, cropped, watermark, text, logo",
    });

    return NextResponse.json({
      image: `data:${result.mimeType};base64,${result.image}`,
      prompt,
    });
  } catch (error) {
    console.error("Style Studio generate error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate look";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
