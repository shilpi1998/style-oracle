# Style Oracle — Project Plan

## Project Overview
AI-powered visual commerce platform for **AI Builder Cup 2026**. Users describe their style vibe, get curated outfit recommendations from an AI stylist, and can virtually try on looks.

**Stack**: Next.js 16 + Tailwind CSS + shadcn/ui | Full Google Cloud (Gemini, Gemini Image, Vertex AI Search, Firestore, Cloud Storage, Cloud Run, Cloud Build, Artifact Registry)

**Repo**: https://github.com/shilpi1998/style-oracle
**GCP Project**: `styleagent-hackathon` (ID: 237833767521)

---

## Architecture

```
  👤 User
   │
   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Next.js 16 App (Cloud Run)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  Webstore    │  │ Shopper Agent│  │     Style Studio          │   │
│  │  Browse/Cart │  │   (Chat)     │  │  Try-On + Final Look     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘   │
└─────────┼─────────────────┼─────────────────────┼───────────────────┘
          │                 │                     │
          ▼                 ▼                     ▼
┌─────────────────┐ ┌──────────────┐   ┌──────────────────┐
│  Cloud Firestore│ │Gemini 2.5    │   │Gemini 2.5 Flash  │
│  Product Catalog│ │Flash (Vertex)│   │Image (@google/   │
│  363 products    │ │Function Call │   │genai SDK)        │
└────────┬────────┘ └──────┬───────┘   │Fashion photo gen │
         │                 │           └──────────────────┘
         │                 ▼
         │          ┌──────────────┐
         │          │ Vertex AI    │
         └─────────►│ Search       │
                    │ Semantic     │
                    │ Indexing     │
                    └──────────────┘

  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │Cloud Storage │ │ Cloud Build  │ │  Artifact    │
  │Product Images│ │ Docker CI/CD │ │  Registry    │
  │CDN bucket    │ │              │ │  Image store │
  └──────────────┘ └──────────────┘ └──────────────┘
```

### Google Tools Used (8)

| # | Tool | What it does | Where it's used |
|---|------|-------------|-----------------|
| 1 | **Gemini 2.5 Flash (Vertex AI)** | Chat agent with function calling | Shopper Agent — outfit recs, product search, look curation |
| 2 | **Gemini 2.5 Flash Image** | AI fashion image generation + editing | Style Studio — selfie try-on (image editing), avatar generation, editorial looks |
| 3 | **Vertex AI Search (Discovery Engine)** | Semantic product indexing & search | Understands "boho beach vibes" → relevant products |
| 4 | **Cloud Firestore** | Product catalog database | 363 products, real-time reads, keyword search fallback |
| 5 | **Cloud Storage** | Product image CDN | 1077 product images + 15 category images (local in dev, GCS in prod) |
| 6 | **Cloud Run** | Serverless app hosting | Next.js 16, port 8080, 512Mi, us-central1 |
| 7 | **Cloud Build** | CI/CD Docker image builds | Builds standalone Next.js Docker image |
| 8 | **Artifact Registry** | Docker image storage | `us-central1-docker.pkg.dev/styleagent-hackathon/style-oracle` |

**Architecture diagram**: See `architecture.html` for full visual flow

---

## Status Tracker

### Phase 1: Core Webstore — DONE
- [x] Next.js 16 project setup with Tailwind + shadcn/ui
- [x] Product catalog (363 products from Myntra dataset, 15 subcategories, real Indian brands: Elle, UCB, Tonga, etc.)
- [x] Homepage with hero, categories, trending products
- [x] Product detail pages with image, pricing, sizes
- [x] Category browsing + search page
- [x] Shopping cart (context-based, add/remove/quantity)
- [x] Responsive Navbar with cart badge

### Phase 2: AI Chat Agent — DONE
- [x] Chat bubble UI (floating, expandable panel)
- [x] Function calling: search_products, filter_products, get_product_details, curate_look
- [x] Multi-turn conversation with tool result round-trips
- [x] Product cards rendered inline in chat responses
- [x] Budget-aware outfit curation
- [x] **Gemini 2.5 Flash via Vertex AI** (migrated from GPT-4o)

### Phase 3: Google Cloud Infrastructure — DONE
- [x] **Cloud Storage**: Bucket `style-oracle-images` created, 1077 images (3 angles per product) uploaded, publicly accessible
- [x] **Firestore**: Database created (Native mode, us-central1), 363 products seeded
- [x] **Vertex AI**: Gemini 2.5 Flash working with function calling via ADC
- [x] All product image URLs updated to GCS (`https://storage.googleapis.com/style-oracle-images/...`)
- [x] API routes (`/api/chat`, `/api/products`, `/api/search`) reading from Firestore
- [x] Application Default Credentials configured

### Phase 4: Vertex AI Search (Semantic Indexing) — DONE
- [x] Create Vertex AI Search data store (`style-oracle-catalog`, NO_CONTENT mode)
- [x] Create search engine (`style-oracle-engine`)
- [x] Import 363 products as JSONL with `_id` field
- [x] Update chat agent's `search_products` to use Vertex AI Search (with Firestore fallback)
- [x] Update `/api/search` route to use semantic search
- [x] `src/lib/vertex-search.ts` — Discovery Engine client with Firestore product lookup

### Phase 5: Style Studio (Virtual Try-On) — DONE
- [x] Style Studio page UI with onboarding flow (gender, size, model selection)
- [x] Product selection UI with 5 outfit slots + image thumbnails
- [x] Gemini 2.5 Flash Image integration via `@google/genai` SDK (`src/lib/imagen.ts`)
- [x] API route `/api/style-studio/generate` — builds fashion prompt, generates image
- [x] Generated image display with download + "Powered by Gemini" badge
- [x] Error handling with retry button
- [x] AI Studio billing credits added (pay-as-you-go)
- [x] **Chat sidebar** — search products via conversation ("show me heels"), click to add to slots
- [x] **Product strip** — horizontal bar below model showing worn products with add-to-cart buttons
- [x] **"Show Final Look"** — editorial mode with beautiful backgrounds (magazine-quality image)
- [x] **Selfie Try-On ("See It On You")** — upload selfie + select catalog products → Gemini image editing shows YOU wearing those exact products (person photo + product images sent together)
- [x] **Avatar Mode** — upload selfie → Gemini generates stylized fashion avatar preserving your face → try on products on avatar
- [x] **Preset AI Model** — no upload, text-only generation with random AI model (fallback)
- [x] API route `/api/style-studio/avatar` — avatar generation from selfie
- [x] `tryOnProducts()` in imagen.ts — multi-image editing (person + N product images)
- [ ] "Save Look" / "Share Look" functionality (nice-to-have)

### Phase 6: Deploy to Cloud Run — DONE
- [x] Dockerfile created (standalone Next.js build)
- [x] Artifact Registry repo created (`style-oracle`)
- [x] Docker image built and pushed via Cloud Build
- [x] Cloud Run service deployed (us-central1, 512Mi, port 8080)
- [x] IAM roles granted (datastore.user, storage.objectViewer, aiplatform.user, discoveryengine.viewer)
- [x] **Public URL: https://style-oracle-237833767521.us-central1.run.app**
- [x] All APIs verified working (products, chat, search)

### Phase 7: Polish & Demo — IN PROGRESS
- [x] Myntra catalog integration: 363 real products, 1077 images (3 angles), rich descriptions, brand names, attributes
- [x] Update all branding from "StyleAgent" → "Style Oracle" (navbar, header, layout, chat, search, footer)
- [x] Chat bubble: scrollable messages, attractive welcome screen with gradient text, popup tooltip
- [ ] Generate rich product descriptions using Gemini
- [ ] Demo video / walkthrough for hackathon submission
- [ ] Final push to GitHub

---

## Deployment Steps (Cloud Run)

### Prerequisites (done)
- GCP project `styleagent-hackathon` with billing linked
- APIs enabled: Cloud Run, Cloud Build, Artifact Registry, Vertex AI, Firestore, Cloud Storage, Discovery Engine
- `gcloud` CLI authenticated as shilpimittal15@gmail.com
- Artifact Registry repo `style-oracle` created

### Step 1: Build & push with Cloud Build
```bash
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/styleagent-hackathon/style-oracle/web:latest \
  --project=styleagent-hackathon
```

### Step 2: Deploy to Cloud Run
```bash
gcloud run deploy style-oracle \
  --image us-central1-docker.pkg.dev/styleagent-hackathon/style-oracle/web:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=styleagent-hackathon" \
  --port 8080 \
  --memory 512Mi \
  --project=styleagent-hackathon
```

### Step 3: Get the public URL
```bash
gcloud run services describe style-oracle \
  --region us-central1 \
  --format="value(status.url)" \
  --project=styleagent-hackathon
```

### Required IAM Roles for Cloud Run Service Account
- `roles/datastore.user` (Firestore)
- `roles/storage.objectViewer` (Cloud Storage)
- `roles/aiplatform.user` (Vertex AI / Gemini / Imagen 3)
- `roles/discoveryengine.viewer` (Vertex AI Search)
