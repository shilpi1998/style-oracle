import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || "";
const MODEL = "gemini-nano-banana-2.1";

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface ImagenRequest {
  prompt: string;
  negativePrompt?: string;
}

export interface ImagenResponse {
  image: string;
  mimeType: string;
}

export interface ProductImage {
  data: string;
  mimeType: string;
}

export interface TryOnRequest {
  personImage: string;
  personMimeType: string;
  productImages: ProductImage[];
  prompt: string;
}

function extractImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
): ImagenResponse {
  const candidate = response.candidates?.[0];
  if (!candidate) {
    throw new Error("No response from image generation model");
  }
  for (const part of candidate.content?.parts || []) {
    if (part.inlineData) {
      return {
        image: part.inlineData.data!,
        mimeType: part.inlineData.mimeType || "image/png",
      };
    }
  }
  throw new Error("No image in response — model returned text only");
}

// Text-only generation (preset model mode)
export async function generateImage(
  request: ImagenRequest
): Promise<ImagenResponse> {
  const fullPrompt = request.negativePrompt
    ? `${request.prompt}\n\nAvoid: ${request.negativePrompt}`
    : request.prompt;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: fullPrompt,
    config: {
      responseModalities: ["IMAGE", "TEXT"],
    },
  });

  return extractImage(response);
}

// Image editing: person photo + product images → person wearing those products
export async function tryOnProducts(
  request: TryOnRequest
): Promise<ImagenResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [];

  parts.push({ text: request.prompt });

  parts.push({ text: "\n\nREFERENCE PERSON (keep this person's face, hair, body exactly):" });
  parts.push({
    inlineData: {
      mimeType: request.personMimeType,
      data: request.personImage,
    },
  });

  request.productImages.forEach((product, i) => {
    parts.push({
      text: `\nCLOTHING ITEM ${i + 1} TO PUT ON THE PERSON ABOVE:`,
    });
    parts.push({
      inlineData: { mimeType: product.mimeType, data: product.data },
    });
  });

  parts.push({ text: "\nGenerate ONE image of the reference person wearing the clothing items shown above. The person's face and body must be clearly recognizable." });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts }],
    config: { responseModalities: ["IMAGE", "TEXT"] },
  });

  return extractImage(response);
}

// Generate a stylized fashion avatar from a selfie
export async function generateAvatar(
  selfieBase64: string,
  mimeType: string
): Promise<ImagenResponse> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: selfieBase64 } },
          {
            text: "Create a stylized fashion illustration avatar of this person. Keep their facial features, skin tone, and hairstyle clearly recognizable but render in a trendy fashion illustration style — clean lines, slightly stylized proportions, fashion magazine sketch quality. Full body, standing pose, wearing simple neutral clothing (plain white top and beige pants). Clean white background. The avatar should look like this specific person, not a generic figure.",
          },
        ],
      },
    ],
    config: { responseModalities: ["IMAGE", "TEXT"] },
  });

  return extractImage(response);
}
