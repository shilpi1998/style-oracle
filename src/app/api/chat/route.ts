import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenAI,
  Type,
  FunctionCallingConfigMode,
  Content,
  FunctionDeclaration,
} from "@google/genai";
import {
  searchProducts,
  filterProducts,
  getProductById,
  products,
} from "@/data/products";
import { Product } from "@/lib/types";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });
// Lite models answer in seconds; larger ones can take 30s+ per call under load
const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-3.5-flash-lite";

const SYSTEM_PROMPT = `You are StyleAgent — an enthusiastic, knowledgeable AI fashion stylist for an Indian e-commerce platform called StyleAgent.

YOUR PERSONALITY:
- Warm, confident, and fashion-savvy
- You speak like a knowledgeable friend, not a corporate chatbot
- Use casual but professional language
- Be concise — 2-3 sentences max unless the user wants detail
- Use ₹ for prices (Indian Rupees)

YOUR CAPABILITIES:
1. SEARCH products by text query (name, brand, color, occasion, style, fabric, tags)
2. FILTER products by category, gender, price range, colors, occasion, sizes
3. CURATE complete looks — assemble multi-item outfits for an occasion/vibe
4. RECOMMEND specific products for a user's needs
5. Suggest visiting the Style Studio to virtually try on outfits

RULES:
- ALWAYS use the available functions to search/filter products. Never make up products.
- When recommending a look, include items from different categories (top + bottom + footwear + accessory)
- Include product IDs so the frontend can link to them
- If the user asks about a specific occasion or vibe, search for relevant products and curate a look
- Mention the Style Studio when recommending complete looks — users can see the outfit on a model there
- Keep prices in ₹ and format them nicely (e.g., ₹4,500)
- Mention the brand with each product, and the discount when a product has an mrp (original price)
- For festive, traditional or wedding occasions, prefer ethnic wear (women-ethnic: kurtas, kurtis, sarees; men-ethnic: kurtas, Nehru jackets)
- If asked about something outside fashion/shopping, politely redirect

RESPONSE FORMAT:
When showing products, format them clearly:
- Product name, price, and a brief why-it-works note
- When curating a full look, label each piece (Top, Bottom, Shoes, Accessory)
- End look recommendations with the total price and a Style Studio CTA`;

const searchProductsDecl: FunctionDeclaration = {
  name: "search_products",
  description:
    "Search products by text query. Matches against name, description, tags, colors, occasion, style. Use this for natural language queries like 'red party dress' or 'casual summer outfit'.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description:
          "Search query — can include colors, occasions, styles, product types",
      },
    },
    required: ["query"],
  },
};

const filterProductsDecl: FunctionDeclaration = {
  name: "filter_products",
  description:
    "Filter products by structured criteria. Use when you need specific category, price range, gender, or occasion filtering.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      subcategory: {
        type: Type.STRING,
        description:
          "Product subcategory slug: women-dresses, women-tops, women-skirts, women-jeans, women-ethnic, men-shirts, men-tshirts, men-trousers, men-blazers, men-ethnic, accessories-jewelry, accessories-bags, accessories-watches, footwear-women, footwear-men",
      },
      gender: {
        type: Type.STRING,
        description: "Filter by gender: men, women, or unisex",
      },
      minPrice: {
        type: Type.NUMBER,
        description: "Minimum price in INR",
      },
      maxPrice: {
        type: Type.NUMBER,
        description: "Maximum price in INR",
      },
      colors: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Filter by colors, e.g., ['navy', 'black']",
      },
      occasion: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description:
          "Filter by occasion, e.g., ['party', 'dinner', 'date-night']",
      },
    },
  },
};

const getProductDetailsDecl: FunctionDeclaration = {
  name: "get_product_details",
  description:
    "Get full details of a specific product by its ID. Use when the user asks about a specific product.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      productId: {
        type: Type.STRING,
        description: "The product ID, e.g., 'w-dress-001', 'm-shirt-003'",
      },
    },
    required: ["productId"],
  },
};

const curateLookDecl: FunctionDeclaration = {
  name: "curate_look",
  description:
    "Curate a complete outfit for an occasion. Assembles a cohesive look with top/dress, bottom, footwear, and accessory. Use when the user wants a full outfit recommendation.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      occasion: {
        type: Type.STRING,
        description:
          "The occasion or vibe, e.g., 'beach dinner', 'office formal', 'casual weekend'",
      },
      gender: {
        type: Type.STRING,
        description: "Target gender: men or women",
      },
      budget: {
        type: Type.NUMBER,
        description: "Optional total budget in INR for the complete look",
      },
      style: {
        type: Type.STRING,
        description:
          "Optional style preference, e.g., 'elegant', 'boho', 'minimal', 'bold'",
      },
    },
    required: ["occasion", "gender"],
  },
};

const tools = [
  {
    functionDeclarations: [
      searchProductsDecl,
      filterProductsDecl,
      getProductDetailsDecl,
      curateLookDecl,
    ],
  },
];

function handleFunctionCall(
  name: string,
  args: Record<string, unknown>
): unknown {
  switch (name) {
    case "search_products": {
      const results = searchProducts(args.query as string);
      return results.slice(0, 8).map(productSummary);
    }
    case "filter_products": {
      const results = filterProducts({
        subcategory: args.subcategory as string | undefined,
        gender: args.gender as string | undefined,
        minPrice: args.minPrice as number | undefined,
        maxPrice: args.maxPrice as number | undefined,
        colors: args.colors as string[] | undefined,
        occasion: args.occasion as string[] | undefined,
      });
      return results.slice(0, 8).map(productSummary);
    }
    case "get_product_details": {
      const product = getProductById(args.productId as string);
      if (!product) return { error: "Product not found" };
      return productSummary(product);
    }
    case "curate_look": {
      return curateLook(
        args.occasion as string,
        args.gender as string,
        args.budget as number | undefined,
        args.style as string | undefined
      );
    }
    default:
      return { error: "Unknown function" };
  }
}

function productSummary(p: Product) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    price: p.price,
    mrp: p.mrp,
    category: p.category,
    subcategory: p.subcategory,
    colors: p.colors,
    occasion: p.occasion,
    style: p.style,
    attributes: p.attributes,
    description: p.description,
    tryOnCompatible: p.tryOnCompatible,
    image: p.images[0] || null,
  };
}

function curateLook(
  occasion: string,
  gender: string,
  budget?: number,
  style?: string
) {
  const query = [occasion, style].filter(Boolean).join(" ");
  const candidates = searchProducts(query).filter(
    (p) => p.gender === gender || p.gender === "unisex"
  );

  const topCategories =
    gender === "women"
      ? ["women-dresses", "women-tops", "women-ethnic"]
      : ["men-shirts", "men-tshirts", "men-ethnic"];
  const bottomCategories =
    gender === "women" ? ["women-skirts", "women-jeans"] : ["men-trousers"];
  const shoeCategories =
    gender === "women" ? ["footwear-women"] : ["footwear-men"];
  const accessoryCategories = [
    "accessories-jewelry",
    "accessories-bags",
    "accessories-watches",
  ];

  function pickBest(subcats: string[]) {
    return candidates.find((p) => subcats.includes(p.subcategory)) || null;
  }

  const top = pickBest(topCategories);
  // Dresses and sarees are complete outfits, so they don't need a bottom
  const isDress = top?.subcategory === "women-dresses" || !!top?.tags.includes("sarees");
  const bottom = isDress ? null : pickBest(bottomCategories);
  const shoes = pickBest(shoeCategories);
  const accessory =
    candidates.find(
      (p) =>
        accessoryCategories.includes(p.subcategory) &&
        (p.gender === gender || p.gender === "unisex")
    ) || null;

  const look = [top, bottom, shoes, accessory].filter(Boolean) as Product[];
  const totalPrice = look.reduce((sum, p) => sum + p.price, 0);

  if (budget && totalPrice > budget) {
    const cheaperCandidates = products
      .filter((p) => p.gender === gender || p.gender === "unisex")
      .filter((p) => p.occasion.some((o) => occasion.includes(o)))
      .sort((a, b) => a.price - b.price);

    const cheapTop = cheaperCandidates.find((p) =>
      topCategories.includes(p.subcategory)
    );
    const cheapBottom = isDress
      ? null
      : cheaperCandidates.find((p) =>
          bottomCategories.includes(p.subcategory)
        );
    const cheapShoes = cheaperCandidates.find((p) =>
      shoeCategories.includes(p.subcategory)
    );
    const cheapAcc = cheaperCandidates.find((p) =>
      accessoryCategories.includes(p.subcategory)
    );

    const cheapLook = [cheapTop, cheapBottom, cheapShoes, cheapAcc].filter(
      Boolean
    ) as Product[];
    const cheapTotal = cheapLook.reduce((sum, p) => sum + p.price, 0);

    if (cheapTotal <= budget) {
      return {
        items: cheapLook.map(productSummary),
        totalPrice: cheapTotal,
        withinBudget: true,
      };
    }
  }

  return {
    items: look.map(productSummary),
    totalPrice,
    withinBudget: budget ? totalPrice <= budget : true,
  };
}

interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

async function callGemini(contents: Content[]) {
  return ai.models.generateContent({
    model: CHAT_MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      tools,
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.AUTO,
        },
      },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = (await req.json()) as {
      message: string;
      history: ChatHistoryMessage[];
    };

    const contents: Content[] = [
      ...history.map(
        (h: ChatHistoryMessage): Content => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        })
      ),
      { role: "user", parts: [{ text: message }] },
    ];

    let response = await callGemini(contents);

    let maxIterations = 5;
    while (maxIterations > 0) {
      const parts = response.candidates?.[0]?.content?.parts || [];

      const functionCalls = parts.filter((p) => p.functionCall);
      if (functionCalls.length === 0) break;

      const functionResponses = functionCalls.map((fc) => {
        const result = handleFunctionCall(
          fc.functionCall!.name!,
          (fc.functionCall!.args as Record<string, unknown>) || {}
        );
        return {
          functionResponse: {
            name: fc.functionCall!.name!,
            // Gemini requires function responses to be objects, not arrays
            response: Array.isArray(result) ? { items: result } : result,
          },
        };
      });

      contents.push({
        role: "model",
        parts: parts as Content["parts"],
      });
      contents.push({
        role: "user",
        parts: functionResponses as Content["parts"],
      });

      response = await callGemini(contents);
      maxIterations--;
    }

    const textParts =
      response.candidates?.[0]?.content?.parts?.filter((p) => p.text) || [];
    const text =
      textParts.map((p) => p.text).join("") ||
      "Hmm, I couldn't put that together. Could you try rephrasing?";

    const allFunctionResults: Product[] = [];
    for (const content of contents) {
      for (const part of content.parts || []) {
        const fr = part as { functionResponse?: { response?: unknown } };
        if (fr.functionResponse?.response) {
          const resp = fr.functionResponse.response as
            | { items?: { id: string }[] }
            | { id: string }[];
          if (Array.isArray(resp)) {
            for (const item of resp) {
              const p = getProductById(item.id);
              if (p) allFunctionResults.push(p);
            }
          } else if (resp.items) {
            for (const item of resp.items) {
              const p = getProductById(item.id);
              if (p) allFunctionResults.push(p);
            }
          }
        }
      }
    }

    const uniqueProducts = Array.from(
      new Map(allFunctionResults.map((p) => [p.id, p])).values()
    );

    return NextResponse.json({
      message: text,
      products: uniqueProducts.slice(0, 8),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        message:
          "Sorry, I'm having trouble connecting. Please try again!",
        products: [],
      },
      { status: 500 }
    );
  }
}
