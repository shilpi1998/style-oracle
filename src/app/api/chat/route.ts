import { NextRequest, NextResponse } from "next/server";
import {
  VertexAI,
  FunctionDeclarationSchemaType,
  type FunctionDeclaration,
  type Content,
  type Part,
} from "@google-cloud/vertexai";
import {
  searchProducts as firestoreSearch,
  filterProducts,
  getProductById,
  getAllProducts,
} from "@/lib/firestore";
import { semanticSearch } from "@/lib/vertex-search";
import { Product } from "@/lib/types";

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || "styleagent-hackathon";
const LOCATION = "us-central1";
const MODEL = "gemini-2.5-flash";

const vertexAI = new VertexAI({ project: PROJECT, location: LOCATION });

const SYSTEM_PROMPT = `You are Style Oracle — an enthusiastic, knowledgeable AI fashion stylist for an Indian e-commerce platform called Style Oracle.

YOUR PERSONALITY:
- Warm, confident, and fashion-savvy
- You speak like a knowledgeable friend, not a corporate chatbot
- Use casual but professional language
- Be concise — 2-3 sentences max unless the user wants detail
- Use ₹ for prices (Indian Rupees)

YOUR CAPABILITIES:
1. SEARCH products by text query (name, color, occasion, style, tags)
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
- If asked about something outside fashion/shopping, politely redirect

RESPONSE FORMAT:
When showing products, format them clearly:
- Product name, price, and a brief why-it-works note
- When curating a full look, label each piece (Top, Bottom, Shoes, Accessory)
- End look recommendations with the total price and a Style Studio CTA`;

const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "search_products",
    description:
      "Search products by text query. Matches against name, description, tags, colors, occasion, style. Use this for natural language queries like 'red party dress' or 'casual summer outfit'.",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        query: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Search query — can include colors, occasions, styles, product types",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "filter_products",
    description:
      "Filter products by structured criteria. Use when you need specific category, price range, gender, or occasion filtering.",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        subcategory: {
          type: FunctionDeclarationSchemaType.STRING,
          description:
            "Product subcategory slug: women-dresses, women-tops, women-skirts, men-shirts, men-tshirts, men-trousers, men-blazers, accessories-jewelry, accessories-bags, accessories-watches, footwear-women, footwear-men",
        },
        gender: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Filter by gender: men, women, or unisex",
        },
        minPrice: {
          type: FunctionDeclarationSchemaType.NUMBER,
          description: "Minimum price in INR",
        },
        maxPrice: {
          type: FunctionDeclarationSchemaType.NUMBER,
          description: "Maximum price in INR",
        },
      },
    },
  },
  {
    name: "get_product_details",
    description: "Get full details of a specific product by its ID.",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        productId: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "The product ID, e.g., 'w-dress-001', 'm-shirt-003'",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "curate_look",
    description:
      "Curate a complete outfit for an occasion. Assembles a cohesive look with top/dress, bottom, footwear, and accessory.",
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        occasion: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "The occasion or vibe, e.g., 'beach dinner', 'office formal', 'casual weekend'",
        },
        gender: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Target gender: men or women",
        },
        budget: {
          type: FunctionDeclarationSchemaType.NUMBER,
          description: "Optional total budget in INR for the complete look",
        },
        style: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Optional style preference, e.g., 'elegant', 'boho', 'minimal', 'bold'",
        },
      },
      required: ["occasion", "gender"],
    },
  },
];

function productSummary(p: Product) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    subcategory: p.subcategory,
    colors: p.colors,
    occasion: p.occasion,
    style: p.style,
    description: p.description,
    tryOnCompatible: p.tryOnCompatible,
    image: p.images[0] || null,
  };
}

async function handleFunctionCall(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "search_products": {
      let results: Product[] = [];
      try {
        results = await semanticSearch(args.query as string, 8);
      } catch { /* fallback below */ }
      if (results.length === 0) {
        results = await firestoreSearch(args.query as string);
      }
      return results.slice(0, 8).map(productSummary);
    }
    case "filter_products": {
      const results = await filterProducts({
        subcategory: args.subcategory as string | undefined,
        gender: args.gender as string | undefined,
        minPrice: args.minPrice as number | undefined,
        maxPrice: args.maxPrice as number | undefined,
      });
      return results.slice(0, 8).map(productSummary);
    }
    case "get_product_details": {
      const product = await getProductById(args.productId as string);
      if (!product) return { error: "Product not found" };
      return productSummary(product);
    }
    case "curate_look": {
      return await curateLook(
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

async function curateLook(
  occasion: string,
  gender: string,
  budget?: number,
  style?: string
) {
  const query = [occasion, style].filter(Boolean).join(" ");
  let searchResults: Product[] = [];
  try {
    searchResults = await semanticSearch(query, 20);
  } catch { /* fallback below */ }
  if (searchResults.length === 0) {
    searchResults = await firestoreSearch(query);
  }
  const candidates = searchResults.filter(
    (p) => p.gender === gender || p.gender === "unisex"
  );

  const topCategories =
    gender === "women"
      ? ["women-dresses", "women-tops"]
      : ["men-shirts", "men-tshirts"];
  const bottomCategories =
    gender === "women" ? ["women-skirts"] : ["men-trousers"];
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
  const isDress = top?.subcategory === "women-dresses";
  const bottom = isDress ? null : pickBest(bottomCategories);
  const shoes = pickBest(shoeCategories);
  const accessory =
    candidates.find(
      (p) =>
        accessoryCategories.includes(p.subcategory) &&
        (p.gender === gender || p.gender === "unisex")
    ) || null;

  let look = [top, bottom, shoes, accessory].filter(Boolean) as Product[];
  let totalPrice = look.reduce((sum, p) => sum + p.price, 0);

  if (budget && totalPrice > budget) {
    const allProducts = await getAllProducts();
    const cheaperCandidates = allProducts
      .filter((p) => p.gender === gender || p.gender === "unisex")
      .filter((p) => p.occasion.some((o) => occasion.includes(o)))
      .sort((a, b) => a.price - b.price);

    const cheapTop = cheaperCandidates.find((p) => topCategories.includes(p.subcategory));
    const cheapBottom = isDress ? null : cheaperCandidates.find((p) => bottomCategories.includes(p.subcategory));
    const cheapShoes = cheaperCandidates.find((p) => shoeCategories.includes(p.subcategory));
    const cheapAcc = cheaperCandidates.find((p) => accessoryCategories.includes(p.subcategory));

    const cheapLook = [cheapTop, cheapBottom, cheapShoes, cheapAcc].filter(Boolean) as Product[];
    const cheapTotal = cheapLook.reduce((sum, p) => sum + p.price, 0);

    if (cheapTotal <= budget) {
      look = cheapLook;
      totalPrice = cheapTotal;
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

export async function POST(req: NextRequest) {
  try {
    const { message, history } = (await req.json()) as {
      message: string;
      history: ChatHistoryMessage[];
    };

    const model = vertexAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
      tools: [{ functionDeclarations }],
    });

    const contents: Content[] = history
      .filter((h) => h.content)
      .map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      }));

    contents.push({ role: "user", parts: [{ text: message }] });

    const chat = model.startChat({ history: contents.slice(0, -1) });

    let result = await chat.sendMessage(contents[contents.length - 1].parts);
    const allFunctionResults: Product[] = [];

    let maxIterations = 5;
    while (maxIterations > 0) {
      const candidate = result.response.candidates?.[0];
      if (!candidate) break;

      const functionCalls = candidate.content.parts.filter(
        (p: Part) => "functionCall" in p
      );
      if (functionCalls.length === 0) break;

      const functionResponses: Part[] = [];
      for (const part of functionCalls) {
        if (!("functionCall" in part) || !part.functionCall) continue;
        const { name, args } = part.functionCall;
        const fnResult = await handleFunctionCall(name, args as Record<string, unknown>);

        const resultArray = Array.isArray(fnResult)
          ? fnResult
          : (fnResult as { items?: { id: string }[] }).items || [];
        for (const item of resultArray) {
          const rid = (item as { id?: string }).id;
          if (rid) {
            const p = await getProductById(rid);
            if (p) allFunctionResults.push(p);
          }
        }

        functionResponses.push({
          functionResponse: {
            name,
            response: { result: fnResult },
          },
        });
      }

      result = await chat.sendMessage(functionResponses);
      maxIterations--;
    }

    const candidate = result.response.candidates?.[0];
    const textParts = candidate?.content.parts.filter((p: Part) => "text" in p) || [];
    const text =
      textParts.map((p: Part) => ("text" in p ? p.text : "")).join("") ||
      "Hmm, I couldn't put that together. Could you try rephrasing?";

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
        message: "Sorry, I'm having trouble connecting. Please try again!",
        products: [],
      },
      { status: 500 }
    );
  }
}
