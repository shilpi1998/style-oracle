#!/usr/bin/env node
/**
 * Generate high-quality product images using Gemini 2.0 Flash (native image generation).
 *
 * Usage:
 *   GOOGLE_GEMINI_API_KEY=<your-key> node scripts/generate-images.js
 */

const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
if (!API_KEY || API_KEY === "your-api-key-here") {
  console.error("ERROR: Set GOOGLE_GEMINI_API_KEY environment variable.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const OUTPUT_DIR = path.join(__dirname, "../public/images/products");

const PRODUCTS = [
  // Women - Dresses
  { id: "w-dress-001", prompt: "Professional e-commerce product photo of a women's purple midi dress, solid purple color, elegant casual style, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-002", prompt: "Professional e-commerce product photo of a women's pink and orange color-block dress, A-line silhouette, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-003", prompt: "Professional e-commerce product photo of a women's black printed casual dress, dark pattern on black fabric, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-004", prompt: "Professional e-commerce product photo of a women's grey and red color-block dress, modern casual style, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-005", prompt: "Professional e-commerce product photo of a women's orange floral print dress, vibrant flower pattern, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-006", prompt: "Professional e-commerce product photo of a women's blue polka dot dress with bow detail, cute retro style, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-007", prompt: "Professional e-commerce product photo of a women's brown animal print dress, leopard pattern on beige fabric, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-008", prompt: "Professional e-commerce product photo of a women's black printed wrap dress, abstract pattern on black fabric, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-009", prompt: "Professional e-commerce product photo of a women's multicolor printed dress, vibrant mixed colors and patterns, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-010", prompt: "Professional e-commerce product photo of a women's solid black shift dress, minimalist elegant style, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-011", prompt: "Professional e-commerce product photo of a women's off-white sleeveless dress, clean cream colored fabric, elegant cut, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-012", prompt: "Professional e-commerce product photo of a women's solid orange midi dress, bright warm tone, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-013", prompt: "Professional e-commerce product photo of a women's grey and black color-block dress, modern minimalist style, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-014", prompt: "Professional e-commerce product photo of a women's pink and black printed dress, bold pattern, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-dress-015", prompt: "Professional e-commerce product photo of a women's soft pink midi dress, feminine romantic style, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },

  // Women - Tops
  { id: "w-top-001", prompt: "Professional e-commerce product photo of a women's mauve printed top, soft purple-pink tone, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-top-002", prompt: "Professional e-commerce product photo of a women's cream and navy blue striped top, horizontal stripes, classic Breton style, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-top-003", prompt: "Professional e-commerce product photo of a women's blue V-neck printed top, floral or abstract pattern, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-top-004", prompt: "Professional e-commerce product photo of a women's white multi-color casual top, colorful accents on white base, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-top-005", prompt: "Professional e-commerce product photo of a women's black animal print kaftan top, flowing silhouette, leopard pattern, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-top-006", prompt: "Professional e-commerce product photo of a women's blue smock top, loose relaxed fit, solid blue color, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-top-007", prompt: "Professional e-commerce product photo of a women's blue printed tunic top, longer length, decorative print, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-top-008", prompt: "Professional e-commerce product photo of a women's solid green casual top, fresh vibrant green, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-top-009", prompt: "Professional e-commerce product photo of a women's multicolor floral top, vibrant flower pattern on colorful fabric, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-top-010", prompt: "Professional e-commerce product photo of a women's blue sequin graphic print top, sparkly embellished design, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },

  // Women - Skirts
  { id: "w-skirt-001", prompt: "Professional e-commerce product photo of a women's brown A-line skirt, warm chocolate brown color, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-skirt-002", prompt: "Professional e-commerce product photo of a women's blue athletic skirt with built-in leggings, sporty yoga style, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-skirt-003", prompt: "Professional e-commerce product photo of a women's pink pleated skirt, soft feminine pink, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-skirt-004", prompt: "Professional e-commerce product photo of a women's black animal stroke print skirt, bold pattern on black, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "w-skirt-005", prompt: "Professional e-commerce product photo of a women's black athletic skirt with leggings, sporty performance style, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },

  // Men - Shirts
  { id: "m-shirt-001", prompt: "Professional e-commerce product photo of a men's blue plaid button-down shirt, classic check pattern in shades of blue, displayed flat lay or on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-shirt-002", prompt: "Professional e-commerce product photo of a men's white purple black grey checked shirt, multi-color check pattern, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-shirt-003", prompt: "Professional e-commerce product photo of a men's green grey white checked shirt, earthy tone plaid, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-shirt-004", prompt: "Professional e-commerce product photo of a men's red and black checked flannel shirt, bold buffalo check, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-shirt-005", prompt: "Professional e-commerce product photo of a men's solid purple full-sleeve dress shirt, rich purple color, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-shirt-006", prompt: "Professional e-commerce product photo of a men's black and green checked slim fit shirt, dark tones, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-shirt-007", prompt: "Professional e-commerce product photo of a men's purple and green checked casual shirt, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-shirt-008", prompt: "Professional e-commerce product photo of a men's blue and brown checked shirt, warm-toned plaid pattern, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-shirt-009", prompt: "Professional e-commerce product photo of a men's green striped formal shirt, vertical stripes, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-shirt-010", prompt: "Professional e-commerce product photo of a men's solid black dress shirt, sleek dark fabric, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },

  // Men - T-shirts
  { id: "m-tshirt-001", prompt: "Professional e-commerce product photo of a men's navy blue striped polo t-shirt, nautical stripe pattern, collar and buttons, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-tshirt-002", prompt: "Professional e-commerce product photo of a men's pink polo t-shirt with small chest logo, solid pink color, collar, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-tshirt-003", prompt: "Professional e-commerce product photo of a men's red tipped polo t-shirt, solid red with contrasting collar tips, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-tshirt-004", prompt: "Professional e-commerce product photo of a men's grey striped crew-neck t-shirt, heather grey with subtle stripes, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-tshirt-005", prompt: "Professional e-commerce product photo of a men's charcoal grey printed round neck t-shirt, graphic print design, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-tshirt-006", prompt: "Professional e-commerce product photo of a men's blue polo t-shirt, classic solid blue, collar with buttons, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-tshirt-007", prompt: "Professional e-commerce product photo of a men's blue printed round neck t-shirt, graphic superhero-inspired design, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-tshirt-008", prompt: "Professional e-commerce product photo of a men's red sports t-shirt, athletic performance fabric, solid red, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },

  // Men - Trousers
  { id: "m-trouser-001", prompt: "Professional e-commerce product photo of men's solid beige formal trousers, pleated front, clean tailored cut, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-trouser-002", prompt: "Professional e-commerce product photo of men's black rinse jeans, dark black denim, slim fit, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-trouser-003", prompt: "Professional e-commerce product photo of men's blue classic fit jeans, medium wash blue denim, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-trouser-004", prompt: "Professional e-commerce product photo of men's solid navy blue formal trousers, dark navy fabric, clean tailored cut, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-trouser-005", prompt: "Professional e-commerce product photo of men's black slim fit jeans, jet black denim, modern cut, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-trouser-006", prompt: "Professional e-commerce product photo of men's navy blue casual trousers, solid navy cotton chinos, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-trouser-007", prompt: "Professional e-commerce product photo of men's blue skinny fit jeans, light-medium wash denim, tapered leg, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-trouser-008", prompt: "Professional e-commerce product photo of men's solid blue casual trousers, bright blue cotton, relaxed fit, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },

  // Men - Blazers/Outerwear
  { id: "m-blazer-001", prompt: "Professional e-commerce product photo of a men's solid green crewneck sweatshirt, forest green color, casual fit, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-blazer-002", prompt: "Professional e-commerce product photo of a men's sky blue sports windbreaker jacket, lightweight athletic jacket with zipper, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-blazer-003", prompt: "Professional e-commerce product photo of a men's navy blue striped V-neck sweater, knitted fabric with stripe pattern, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-blazer-004", prompt: "Professional e-commerce product photo of a men's solid grey crewneck sweatshirt, heather grey, casual fit, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },
  { id: "m-blazer-005", prompt: "Professional e-commerce product photo of a men's white printed crewneck sweatshirt, graphic print on white fabric, displayed on invisible mannequin, clean white background, studio lighting, high resolution fashion photography" },

  // Accessories - Jewelry
  { id: "acc-jew-001", prompt: "Professional e-commerce product photo of a women's gold statement necklace with multicolor stones, chunky bohemian style, displayed on white jewelry stand, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-jew-002", prompt: "Professional e-commerce product photo of a women's coral red and orange beaded statement necklace, layered design, displayed on white jewelry stand, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-jew-003", prompt: "Professional e-commerce product photo of a women's blue pendant necklace, delicate chain with blue stone pendant, displayed on white jewelry stand, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-jew-004", prompt: "Professional e-commerce product photo of women's pink drop earrings, elegant pink stone or bead earrings, displayed on white jewelry stand, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-jew-005", prompt: "Professional e-commerce product photo of a silver beaded necklace, delicate silver beads on chain, displayed on white jewelry stand, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-jew-006", prompt: "Professional e-commerce product photo of women's red drop earrings, bold red stone earrings, displayed on white jewelry stand, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-jew-007", prompt: "Professional e-commerce product photo of women's green drop earrings, emerald green stone earrings, displayed on white jewelry stand, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-jew-008", prompt: "Professional e-commerce product photo of women's silver ornate earrings, traditional Indian silver jhumka earrings, displayed on white jewelry stand, clean white background, studio lighting, high resolution product photography" },

  // Accessories - Bags
  { id: "acc-bag-001", prompt: "Professional e-commerce product photo of a blue sporty backpack, solid blue color with multiple compartments, front view, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-bag-002", prompt: "Professional e-commerce product photo of a black sporty backpack, solid black with padded straps, front view, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-bag-003", prompt: "Professional e-commerce product photo of a women's red leather handbag, structured tote style, rich red color, front view, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-bag-004", prompt: "Professional e-commerce product photo of a women's black leather handbag, classic structured design, front view, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-bag-005", prompt: "Professional e-commerce product photo of a black laptop bag, professional messenger style with shoulder strap, front view, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-bag-006", prompt: "Professional e-commerce product photo of an orange and grey printed laptop backpack, sporty design with compartments, front view, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-bag-007", prompt: "Professional e-commerce product photo of a women's white leather handbag, clean elegant design, front view, clean white background, studio lighting, high resolution product photography" },

  // Accessories - Watches
  { id: "acc-watch-001", prompt: "Professional e-commerce product photo of a men's silver chronograph watch, stainless steel band, silver-toned dial with sub-dials, displayed at angle, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-watch-002", prompt: "Professional e-commerce product photo of a women's elegant white dial watch, thin silver or gold band, minimalist design, displayed at angle, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-watch-003", prompt: "Professional e-commerce product photo of a women's black dial watch, sleek dark face with leather or metal band, displayed at angle, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-watch-004", prompt: "Professional e-commerce product photo of a women's white dial dress watch, delicate band, crystal accents, displayed at angle, clean white background, studio lighting, high resolution product photography" },
  { id: "acc-watch-005", prompt: "Professional e-commerce product photo of a women's black dial statement watch, larger face, elegant design, displayed at angle, clean white background, studio lighting, high resolution product photography" },

  // Footwear - Women
  { id: "fw-w-001", prompt: "Professional e-commerce product photo of women's brown leather heels, classic pump style, medium heel, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
  { id: "fw-w-002", prompt: "Professional e-commerce product photo of women's yellow and orange strappy sandals, colorful summer style, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
  { id: "fw-w-003", prompt: "Professional e-commerce product photo of women's red moccasin loafer shoes, flat casual style, rich red leather, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
  { id: "fw-w-004", prompt: "Professional e-commerce product photo of women's bronze metallic heels, shiny bronze finish, elegant style, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
  { id: "fw-w-005", prompt: "Professional e-commerce product photo of women's gold metallic heels, shiny gold finish, party style, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
  { id: "fw-w-006", prompt: "Professional e-commerce product photo of women's beige casual flat shoes, nude tone, comfortable everyday style, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
  { id: "fw-w-007", prompt: "Professional e-commerce product photo of women's red strappy sandals, elegant red with heel, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
  { id: "fw-w-008", prompt: "Professional e-commerce product photo of women's silver grey heels, metallic silver finish, elegant pumps, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },

  // Footwear - Men
  { id: "fw-m-001", prompt: "Professional e-commerce product photo of men's white sports shoes, athletic sneakers, clean white with minimal accents, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
  { id: "fw-m-002", prompt: "Professional e-commerce product photo of men's black casual leather shoes, classic design, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
  { id: "fw-m-003", prompt: "Professional e-commerce product photo of men's grey sports running shoes, athletic design with mesh, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
  { id: "fw-m-004", prompt: "Professional e-commerce product photo of men's red slide sandals, sporty flip-flop style, bold red color, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
  { id: "fw-m-005", prompt: "Professional e-commerce product photo of men's navy blue sports shoes, athletic high-top sneakers, classic design, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
  { id: "fw-m-006", prompt: "Professional e-commerce product photo of men's olive green outdoor sandals, rugged casual style, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
  { id: "fw-m-007", prompt: "Professional e-commerce product photo of men's navy blue leather casual shoes, classic low-top sneaker style, displayed at 3/4 angle, clean white background, studio lighting, high resolution product photography" },
];

async function generateImage(product) {
  const outputPath = path.join(OUTPUT_DIR, `${product.id}.png`);
  const jpgPath = path.join(OUTPUT_DIR, `${product.id}.jpg`);

  // Skip if high-quality image already exists (>50KB = likely already generated)
  if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 50000) {
    console.log(`SKIP ${product.id} (already has high-res image)`);
    return "skip";
  }
  if (fs.existsSync(jpgPath) && fs.statSync(jpgPath).size > 50000) {
    console.log(`SKIP ${product.id} (already has high-res jpg)`);
    return "skip";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts: [{ text: product.prompt + "\n\nGenerate this image. Output ONLY the image, no text." }] }],
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    // Find image part in response
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith("image/")) {
          const buffer = Buffer.from(part.inlineData.data, "base64");
          fs.writeFileSync(outputPath, buffer);
          const sizeKB = Math.round(buffer.length / 1024);
          console.log(`OK ${product.id} (${sizeKB}KB, ${part.inlineData.mimeType})`);
          return "ok";
        }
      }
    }
    console.log(`EMPTY ${product.id} - no image in response`);
    return "fail";
  } catch (err) {
    console.error(`FAIL ${product.id}: ${err.message}`);
    return "fail";
  }
}

async function main() {
  console.log(`\nGenerating ${PRODUCTS.length} product images with Imagen 3...\n`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let success = 0;
  let failed = 0;
  let skipped = 0;

  // Process one at a time to avoid rate limits on free tier
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    console.log(`\n[${i + 1}/${PRODUCTS.length}] ${p.id}`);

    const result = await generateImage(p);
    if (result === "ok") success++;
    else if (result === "skip") skipped++;
    else failed++;

    // Rate limit pause (free tier is limited)
    if (result === "ok" && i < PRODUCTS.length - 1) {
      await new Promise((r) => setTimeout(r, 4000));
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Generated: ${success}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total images in ${OUTPUT_DIR}: ${fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png') || f.endsWith('.jpg')).length}`);
}

main().catch(console.error);
