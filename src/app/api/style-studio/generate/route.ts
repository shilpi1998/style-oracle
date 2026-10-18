import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import {
  generateImage,
  tryOnProducts,
  generateAvatar,
  ProductImage,
} from "@/lib/imagen";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

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
    const itemDesc = items.map((item) => `${item.colors?.[0] || ""} ${item.name}`.trim()).join(", ");
    return `VIRTUAL TRY-ON EDITORIAL: Edit the reference person photo to show them wearing: ${itemDesc}. Keep their face, hair, skin tone IDENTICAL. Style the scene in ${bg}. Cinematic lighting, shallow depth of field, Vogue India editorial quality. Full body shot.`;
  }

  const personRef = isAvatar ? "avatar" : "person";
  const itemDesc = items.map((item) => `${item.colors?.[0] || ""} ${item.name}`.trim()).join(", ");
  return `VIRTUAL TRY-ON: Edit the reference ${personRef} photo to show them wearing: ${itemDesc}.

Keep the ${personRef}'s face, hair, skin tone, and body IDENTICAL — only change their clothes to match the product image${itemCount > 1 ? "s" : ""} provided below. The clothing must look exactly like the catalog photo (same color, pattern, design). Full body, ${occasion} styling, clean studio background.`;
}

async function fetchProductImage(
  url: string
): Promise<ProductImage | null> {
  try {
    if (url.startsWith("/")) {
      const filePath = join(process.cwd(), "public", url);
      const buffer = await readFile(filePath);
      const ext = url.split(".").pop()?.toLowerCase();
      const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      return { data: buffer.toString("base64"), mimeType };
    }
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

    console.log("[generate] request:", {
      modelMode,
      hasPersonImage: !!personImage,
      personImageLen: personImage?.length,
      personMimeType,
      itemCount: items?.length,
      items: items?.map((i) => ({ name: i.name, hasImageUrl: !!i.imageUrl })),
      gender,
      occasion,
      mode,
    });

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
          console.log("[generate] fetching product image:", item.imageUrl);
          const img = await fetchProductImage(item.imageUrl);
          if (img) {
            console.log("[generate] product image fetched, size:", img.data.length, "mime:", img.mimeType);
            productImages.push(img);
          } else {
            console.log("[generate] FAILED to fetch product image:", item.imageUrl);
          }
        }
      }

      const prompt = buildTryOnPrompt(
        items,
        gender,
        occ,
        mode,
        modelMode === "avatar"
      );
      console.log("[generate] tryOn prompt:", prompt);
      console.log("[generate] personImage size:", personImage.length, "productImages:", productImages.length);

      if (productImages.length === 0) {
        console.log("[generate] no product images, using text-only with person");
        const result = await tryOnProducts({
          personImage,
          personMimeType: personMimeType || "image/jpeg",
          productImages: [],
          prompt: buildTryOnPrompt(items, gender, occ, mode, modelMode === "avatar"),
        });
        console.log("[generate] tryOn result (no products):", { mimeType: result.mimeType, imageLen: result.image.length });
        return NextResponse.json({
          image: `data:${result.mimeType};base64,${result.image}`,
          prompt,
        });
      }

      console.log("[generate] calling tryOnProducts with", productImages.length, "product images");
      const result = await tryOnProducts({
        personImage,
        personMimeType: personMimeType || "image/jpeg",
        productImages,
        prompt,
      });
      console.log("[generate] tryOn result:", { mimeType: result.mimeType, imageLen: result.image.length });

      return NextResponse.json({
        image: `data:${result.mimeType};base64,${result.image}`,
        prompt,
      });
    }

    // --- PRESET MODE: text-only generation (no person photo) ---
    console.log("[generate] preset mode — text-only generation");
    const prompt = buildTextPrompt(items, gender, occ, mode);
    console.log("[generate] prompt:", prompt);
    const result = await generateImage({
      prompt,
      negativePrompt:
        "deformed, blurry, low quality, distorted face, extra limbs, bad anatomy, cropped, watermark, text, logo",
    });
    console.log("[generate] preset result:", { mimeType: result.mimeType, imageLen: result.image.length });

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
