"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Upload,
  User,
  Users,
  Camera,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Plus,
  X,
  Download,
  Send,
  MessageCircle,
  Loader2,
  ImageIcon,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { products } from "@/data/products";
import { Product, ModelMode } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

const sizeOptions = ["XS", "S", "M", "L", "XL"];
const genderOptions = [
  { value: "women" as const, label: "Women" },
  { value: "men" as const, label: "Men" },
];

type SlotKey = "top" | "bottom" | "footwear" | "accessory1" | "accessory2";

interface Slots {
  top: Product | null;
  bottom: Product | null;
  footwear: Product | null;
  accessory1: Product | null;
  accessory2: Product | null;
}

const slotLabels: Record<SlotKey, string> = {
  top: "Top / Dress",
  bottom: "Bottom",
  footwear: "Footwear",
  accessory1: "Accessory 1",
  accessory2: "Accessory 2",
};

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

function getSlotForProduct(p: Product): SlotKey | null {
  const sub = p.subcategory;
  if (
    sub.includes("dress") ||
    sub.includes("top") ||
    sub.includes("shirt") ||
    sub.includes("tshirt") ||
    sub.includes("blazer")
  )
    return "top";
  if (sub.includes("trouser") || sub.includes("skirt") || sub.includes("jean"))
    return "bottom";
  if (p.category === "footwear") return "footwear";
  if (p.category === "accessories") return "accessory1";
  return null;
}

export default function StyleStudioPage() {
  const { addItem } = useCart();
  const [step, setStep] = useState<"onboarding" | "studio">("onboarding");
  const [size, setSize] = useState("M");
  const [gender, setGender] = useState<"women" | "men">("women");
  const [modelMode, setModelMode] = useState<ModelMode>("selfie");

  // Selfie / Avatar state
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [selfieMimeType, setSelfieMimeType] = useState<string>("image/jpeg");
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Studio state
  const [slots, setSlots] = useState<Slots>({
    top: null,
    bottom: null,
    footwear: null,
    accessory1: null,
    accessory2: null,
  });
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLook, setGeneratedLook] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Editorial state
  const [isGeneratingEditorial, setIsGeneratingEditorial] = useState(false);
  const [editorialImage, setEditorialImage] = useState<string | null>(null);
  const [showEditorialModal, setShowEditorialModal] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    if (!addedFeedback) return;
    const t = setTimeout(() => setAddedFeedback(null), 2000);
    return () => clearTimeout(t);
  }, [addedFeedback]);

  // ---- Selfie upload handler ----
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Max 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      setSelfieBase64(base64);
      setSelfieMimeType(file.type || "image/jpeg");
      setSelfiePreview(dataUrl);
      setAvatarBase64(null);
      setAvatarPreview(null);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveSelfie() {
    setSelfieBase64(null);
    setSelfiePreview(null);
    setAvatarBase64(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ---- Avatar generation ----
  async function handleGenerateAvatar() {
    if (!selfieBase64) return;
    setIsGeneratingAvatar(true);
    try {
      const res = await fetch("/api/style-studio/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfieBase64, mimeType: selfieMimeType }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Avatar generation failed");
        return;
      }
      setAvatarBase64(data.image);
      setAvatarPreview(`data:${data.mimeType};base64,${data.image}`);
    } catch {
      alert("Failed to generate avatar. Try again.");
    } finally {
      setIsGeneratingAvatar(false);
    }
  }

  function handleStartStudio() {
    if ((modelMode === "selfie" || modelMode === "avatar") && !selfieBase64) {
      alert("Please upload a selfie first.");
      return;
    }
    if (modelMode === "avatar" && !avatarBase64) {
      alert("Please generate your avatar first.");
      return;
    }
    setStep("studio");
  }

  // ---- The person image to use for try-on ----
  function getPersonImage(): { base64: string; mimeType: string } | null {
    if (modelMode === "avatar" && avatarBase64) {
      return { base64: avatarBase64, mimeType: "image/png" };
    }
    if (modelMode === "selfie" && selfieBase64) {
      return { base64: selfieBase64, mimeType: selfieMimeType };
    }
    return null;
  }

  // ---- Product helpers ----
  function handleSelectProduct(slot: SlotKey, product: Product) {
    setSlots((prev) => ({ ...prev, [slot]: product }));
    setActiveSlot(null);
  }

  function handleRemoveProduct(slot: SlotKey) {
    setSlots((prev) => ({ ...prev, [slot]: null }));
  }

  function handleAddFromChat(product: Product) {
    let slot = getSlotForProduct(product);
    if (!slot) return;
    if (slot === "accessory1" && slots.accessory1) {
      slot = "accessory2";
    }
    setSlots((prev) => ({ ...prev, [slot!]: product }));
    setAddedFeedback(`Added to ${slotLabels[slot]}`);
  }

  function handleAddToCart(product: Product) {
    addItem(product, size, product.colors[0] || "default");
  }

  // ---- Generate look ----
  async function handleGenerateLook(mode: "studio" | "editorial" = "studio") {
    if (mode === "editorial") {
      setIsGeneratingEditorial(true);
    } else {
      setIsGenerating(true);
      setGenerateError(null);
      setGeneratedLook(null);
    }

    const filledProducts = Object.values(slots).filter(Boolean) as Product[];
    const items = filledProducts.map((p) => ({
      name: p.name,
      colors: p.colors,
      subcategory: p.subcategory,
      description: p.description,
      imageUrl: p.images[0] || undefined,
    }));

    const occasions = filledProducts.flatMap((p) => p.occasion);
    const occasion = occasions[0] || "casual";

    const person = getPersonImage();

    try {
      const res = await fetch("/api/style-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          gender,
          occasion,
          mode,
          modelMode,
          personImage: person?.base64 || undefined,
          personMimeType: person?.mimeType || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (mode === "studio")
          setGenerateError(data.error || "Generation failed");
        return;
      }

      if (mode === "editorial") {
        setEditorialImage(data.image);
        setShowEditorialModal(true);
      } else {
        setGeneratedLook(data.image);
      }
    } catch {
      if (mode === "studio")
        setGenerateError("Failed to connect. Please try again.");
    } finally {
      if (mode === "editorial") {
        setIsGeneratingEditorial(false);
      } else {
        setIsGenerating(false);
      }
    }
  }

  // ---- Chat ----
  async function handleChatSend(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: userText },
    ]);
    setChatLoading(true);

    try {
      const history = chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history }),
      });

      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.message,
          products: data.products?.length > 0 ? data.products : undefined,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: "Something went wrong.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  const filledSlots = Object.values(slots).filter(Boolean).length;
  const filledProducts = Object.values(slots).filter(Boolean) as Product[];
  const totalPrice = filledProducts.reduce((sum, p) => sum + p.price, 0);

  const getProductsForSlot = (slot: SlotKey): Product[] => {
    const genderFilter = gender;
    switch (slot) {
      case "top":
        return products.filter(
          (p) =>
            (p.subcategory.includes("dress") ||
              p.subcategory.includes("top") ||
              p.subcategory.includes("shirt") ||
              p.subcategory.includes("tshirt") ||
              p.subcategory.includes("blazer")) &&
            (p.gender === genderFilter || p.gender === "unisex")
        );
      case "bottom":
        return products.filter(
          (p) =>
            (p.subcategory.includes("trouser") ||
              p.subcategory.includes("skirt") ||
              p.subcategory.includes("jean")) &&
            (p.gender === genderFilter || p.gender === "unisex")
        );
      case "footwear":
        return products.filter(
          (p) =>
            p.category === "footwear" &&
            (p.gender === genderFilter || p.gender === "unisex")
        );
      case "accessory1":
      case "accessory2":
        return products.filter(
          (p) =>
            p.category === "accessories" &&
            (p.gender === genderFilter || p.gender === "unisex")
        );
      default:
        return [];
    }
  };

  // ==================== ONBOARDING ====================
  if (step === "onboarding") {
    return (
      <div className="min-h-screen bg-cream">
        <div className="absolute inset-0 texture-grain pointer-events-none" aria-hidden />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {/* Masthead */}
          <div className="text-center mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold-dark mb-5 flex items-center justify-center gap-3">
              <span className="inline-block w-8 h-px bg-gold" />
              The Style Studio Atelier
              <span className="inline-block w-8 h-px bg-gold" />
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl tracking-tight leading-[1.1] text-ink mb-4">
              Let&apos;s Set Up <span className="italic text-gold">Your Look</span>
            </h1>
            <p className="text-smoke max-w-lg mx-auto leading-relaxed">
              Upload a selfie to see our products on you, or let our AI model
              wear them first.
            </p>
          </div>

          <Card className="glass-panel rounded-md border-hairline">
            <CardContent className="p-8 sm:p-10 space-y-9">
              {/* Gender */}
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-smoke mb-3">
                  I&apos;m shopping for
                </p>
                <div className="flex gap-3">
                  {genderOptions.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setGender(g.value)}
                      data-testid={`onboarding-gender-${g.value}`}
                      className={`flex-1 py-3.5 rounded-md text-sm font-medium border transition-all duration-300 ${
                        gender === g.value
                          ? "border-gold bg-parchment text-ink"
                          : "border-hairline text-smoke hover:border-gold/50 hover:text-ink bg-white/60"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-smoke mb-3">
                  My size
                </p>
                <div className="flex gap-2">
                  {sizeOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      data-testid={`onboarding-size-${s.toLowerCase()}`}
                      className={`w-14 h-14 rounded-md font-mono text-sm border transition-all duration-300 ${
                        size === s
                          ? "border-gold bg-parchment text-ink"
                          : "border-hairline text-smoke hover:border-gold/50 hover:text-ink bg-white/60"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="bg-hairline" />

              {/* Model Mode */}
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-smoke mb-3">
                  How do you want to try on outfits?
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setModelMode("selfie")}
                    data-testid="onboarding-mode-selfie"
                    className={`p-5 rounded-md border text-left transition-all duration-300 hover:-translate-y-0.5 ${
                      modelMode === "selfie"
                        ? "border-gold bg-parchment shadow-[0_8px_20px_rgba(158,114,56,0.12)]"
                        : "border-hairline bg-white/60 hover:border-gold/50"
                    }`}
                  >
                    <Camera className={`h-7 w-7 mb-4 ${modelMode === "selfie" ? "text-gold-dark" : "text-smoke/50"}`} />
                    <h4 className="font-medium text-ink text-sm">
                      See It On You
                    </h4>
                    <p className="text-xs text-smoke mt-1 leading-relaxed">
                      Upload a selfie — AI puts our catalog products on you
                    </p>
                  </button>

                  <button
                    onClick={() => setModelMode("avatar")}
                    data-testid="onboarding-mode-avatar"
                    className={`p-5 rounded-md border text-left transition-all duration-300 hover:-translate-y-0.5 ${
                      modelMode === "avatar"
                        ? "border-gold bg-parchment shadow-[0_8px_20px_rgba(158,114,56,0.12)]"
                        : "border-hairline bg-white/60 hover:border-gold/50"
                    }`}
                  >
                    <User className={`h-7 w-7 mb-4 ${modelMode === "avatar" ? "text-gold-dark" : "text-smoke/50"}`} />
                    <h4 className="font-medium text-ink text-sm">
                      Your Avatar
                    </h4>
                    <p className="text-xs text-smoke mt-1 leading-relaxed">
                      Upload a selfie — AI creates a fashion avatar that looks
                      like you
                    </p>
                  </button>

                  <button
                    onClick={() => setModelMode("preset")}
                    data-testid="onboarding-mode-preset"
                    className={`p-5 rounded-md border text-left transition-all duration-300 hover:-translate-y-0.5 ${
                      modelMode === "preset"
                        ? "border-gold bg-parchment shadow-[0_8px_20px_rgba(158,114,56,0.12)]"
                        : "border-hairline bg-white/60 hover:border-gold/50"
                    }`}
                  >
                    <Users className={`h-7 w-7 mb-4 ${modelMode === "preset" ? "text-gold-dark" : "text-smoke/50"}`} />
                    <h4 className="font-medium text-ink text-sm">
                      AI Model
                    </h4>
                    <p className="text-xs text-smoke mt-1 leading-relaxed">
                      No upload needed — see outfits on an AI-generated model
                    </p>
                  </button>
                </div>
              </div>

              {/* Selfie Upload Area (for selfie & avatar modes) */}
              {(modelMode === "selfie" || modelMode === "avatar") && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                    data-testid="onboarding-file-input"
                  />

                  {!selfiePreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-[#d8cfbe] rounded-md p-10 text-center cursor-pointer hover:border-gold hover:bg-parchment/40 transition-all duration-300 bg-white/50"
                      data-testid="onboarding-upload-area"
                    >
                      <Upload className="h-9 w-9 text-gold/60 mx-auto mb-4" />
                      <p className="text-sm text-ink mb-1.5">
                        Upload a clear, front-facing photo
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-smoke/70 mb-5">
                        JPG or PNG · max 5MB
                      </p>
                      <Button variant="outline" size="sm" type="button" className="border-ink text-ink hover:bg-ink hover:text-cream rounded-none sm:rounded-sm">
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        Choose Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-6 items-start">
                      {/* Selfie preview */}
                      <div className="relative">
                        <div className="w-32 h-40 overflow-hidden border border-hairline p-1.5 bg-white shadow-[0_8px_20px_rgba(18,18,18,0.06)]">
                          <img
                            src={selfiePreview}
                            alt="Your selfie"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={handleRemoveSelfie}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-wine text-white flex items-center justify-center shadow-md hover:opacity-90"
                          data-testid="onboarding-remove-selfie"
                          aria-label="Remove photo"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex items-center gap-1 mt-2 justify-center">
                          <CheckCircle className="h-3.5 w-3.5 text-forest" />
                          <span className="font-mono text-[10px] uppercase tracking-wider text-forest">
                            Uploaded
                          </span>
                        </div>
                      </div>

                      {/* Avatar preview (if avatar mode) */}
                      {modelMode === "avatar" && (
                        <div className="flex-1">
                          {avatarPreview ? (
                            <div>
                              <div className="w-32 h-40 overflow-hidden border border-gold/40 p-1.5 bg-white shadow-[0_8px_20px_rgba(18,18,18,0.06)]">
                                <img
                                  src={avatarPreview}
                                  alt="Your avatar"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex items-center gap-1 mt-2">
                                <CheckCircle className="h-3.5 w-3.5 text-forest" />
                                <span className="font-mono text-[10px] uppercase tracking-wider text-forest">
                                  Avatar ready
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center pt-8">
                              <Button
                                onClick={handleGenerateAvatar}
                                disabled={isGeneratingAvatar}
                                className="bg-ink text-cream hover:bg-ink-soft rounded-none sm:rounded-sm"
                                data-testid="onboarding-avatar-generate"
                              >
                                {isGeneratingAvatar ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating Avatar...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate My Avatar
                                  </>
                                )}
                              </Button>
                              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-smoke/70 mt-3">
                                Takes ~10 seconds
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Change photo button for selfie mode */}
                      {modelMode === "selfie" && (
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-ink text-ink hover:bg-ink hover:text-cream rounded-none sm:rounded-sm"
                            data-testid="onboarding-change-photo"
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Change Photo
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Start Button */}
              <Button
                size="lg"
                className="w-full bg-ink text-cream hover:bg-ink-soft h-12 text-sm tracking-wide rounded-none sm:rounded-md"
                onClick={handleStartStudio}
                disabled={isGeneratingAvatar}
                data-testid="onboarding-start-button"
              >
                {modelMode === "preset"
                  ? "Enter Style Studio"
                  : modelMode === "avatar"
                    ? "Enter Studio with Avatar"
                    : "Enter Studio with My Photo"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== STUDIO WORKSPACE ====================
  const personImg = getPersonImage();

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Masthead */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-hairline">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-dark mb-1">
                The Atelier
              </p>
              <h1 className="font-heading text-2xl tracking-tight text-ink leading-none">
                Style Studio
              </h1>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] bg-parchment text-gold-dark border border-hairline px-2.5 py-1.5">
              {modelMode === "selfie"
                ? "Your Photo"
                : modelMode === "avatar"
                  ? "Your Avatar"
                  : "AI Model"}
            </span>
            {personImg && (
              <div className="w-9 h-9 overflow-hidden border border-hairline p-0.5 bg-white">
                <img
                  src={
                    modelMode === "avatar" && avatarPreview
                      ? avatarPreview
                      : selfiePreview || ""
                  }
                  alt="You"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep("onboarding")}
            className="border-ink text-ink hover:bg-ink hover:text-cream rounded-none sm:rounded-sm font-mono text-[11px] uppercase tracking-[0.12em]"
            data-testid="studio-change-model-button"
          >
            Change Model
          </Button>
        </div>

        {/* Toast */}
        {addedFeedback && (
          <div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-ink text-cream px-5 py-2.5 shadow-lg font-mono text-xs uppercase tracking-[0.12em] animate-bounce-in"
            data-testid="studio-toast"
          >
            {addedFeedback}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ========= LEFT: Model Preview — editorial proof sheet ========= */}
          <div className="lg:col-span-5">
            <div className="p-2.5 bg-white border border-hairline shadow-[0_16px_40px_rgba(18,18,18,0.07)]">
              <div className="aspect-[3/4] bg-parchment texture-grain flex items-center justify-center relative overflow-hidden">
                {isGenerating ? (
                  <div className="absolute inset-0 shimmer flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 text-gold animate-spin mx-auto mb-4" />
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
                        {personImg
                          ? "Tailoring it onto you..."
                          : "Composing your look..."}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-smoke/60 mt-2">
                        ~10-15 seconds
                      </p>
                    </div>
                  </div>
                ) : generateError ? (
                  <div className="text-center p-8">
                    <div className="w-14 h-14 mx-auto mb-4 border border-wine/30 bg-wine/5 flex items-center justify-center">
                      <X className="h-6 w-6 text-wine" />
                    </div>
                    <p className="font-mono text-xs uppercase tracking-[0.15em] text-wine">
                      Generation Failed
                    </p>
                    <p className="text-xs text-smoke mt-2 max-w-xs mx-auto">
                      {generateError}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-5 border-ink text-ink hover:bg-ink hover:text-cream rounded-none sm:rounded-sm"
                      onClick={() => handleGenerateLook("studio")}
                      data-testid="studio-try-again-button"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : generatedLook ? (
                  <img
                    src={generatedLook}
                    alt="Generated outfit look"
                    className="w-full h-full object-cover"
                  />
                ) : personImg ? (
                  <div className="text-center p-8">
                    <div className="w-24 h-24 overflow-hidden mx-auto mb-5 border border-hairline p-1 bg-white shadow-[0_8px_20px_rgba(18,18,18,0.06)]">
                      <img
                        src={
                          modelMode === "avatar" && avatarPreview
                            ? avatarPreview
                            : selfiePreview || ""
                        }
                        alt="You"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-ink">
                      Select products and press{" "}
                      <span className="italic font-heading">Try It On</span>
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-smoke/70 mt-2">
                      AI will dress you in your picks
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <User className="h-16 w-16 text-hairline mx-auto mb-4" strokeWidth={1} />
                    <p className="text-sm text-smoke">
                      Select products and press{" "}
                      <span className="italic font-heading">Generate Look</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Powered badge + download */}
            {generatedLook && (
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-smoke/60">
                  Powered by Gemini on Vertex AI
                </span>
                <a
                  href={generatedLook}
                  download="style-oracle-look.png"
                  className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold-dark hover:text-gold flex items-center gap-1.5 border-b border-gold/40 pb-0.5"
                  data-testid="studio-download-look-link"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              </div>
            )}

            {/* Product Strip — garment tags */}
            {filledSlots > 0 && (
              <div className="mt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke mb-2.5">
                  Outfit items
                </p>
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {(Object.entries(slots) as [SlotKey, Product | null][])
                    .filter(([, p]) => p !== null)
                    .map(([key, product]) => (
                      <div
                        key={key}
                        className="flex-shrink-0 w-[140px] bg-white border border-hairline p-2 hover:border-gold/50 transition-all duration-300 hover:-translate-y-0.5"
                        data-testid={`studio-outfit-item-${key}`}
                      >
                        <div className="w-full h-20 bg-parchment overflow-hidden mb-2">
                          {product!.images[0] ? (
                            <Image
                              src={product!.images[0]}
                              alt={product!.name}
                              width={140}
                              height={80}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-5 w-5 text-hairline" />
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-ink line-clamp-1">
                          {product!.name}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono text-[11px] text-gold-dark">
                            ₹{product!.price.toLocaleString("en-IN")}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product!)}
                            className="font-mono text-[9px] uppercase tracking-wider px-2 py-1 border border-hairline text-ink hover:bg-ink hover:text-cream transition-colors"
                            data-testid={`studio-outfit-add-cart-${key}`}
                          >
                            Add
                          </button>
                        </div>
                        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-smoke/50 mt-1 block">
                          {slotLabels[key]}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Generate + Final Look Buttons */}
            <div className="flex gap-3 mt-5">
              <Button
                size="lg"
                className="flex-1 bg-ink text-cream hover:bg-ink-soft h-12 text-sm tracking-wide rounded-none sm:rounded-md"
                disabled={filledSlots === 0 || isGenerating}
                onClick={() => handleGenerateLook("studio")}
                data-testid="studio-generate-look-button"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {personImg ? "Try It On" : "Generate Look"}
                  </>
                )}
              </Button>
              {generatedLook && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gold text-gold-dark hover:bg-gold hover:text-white h-12 text-sm tracking-wide rounded-none sm:rounded-md"
                  disabled={isGeneratingEditorial}
                  onClick={() => handleGenerateLook("editorial")}
                  data-testid="studio-generate-editorial-button"
                >
                  {isGeneratingEditorial ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Show Final Look
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* ========= MIDDLE: Outfit Slots — atelier garment tickets ========= */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="font-heading text-xl tracking-tight text-ink mb-4">
              Your Outfit
            </h2>

            {(Object.keys(slotLabels) as SlotKey[]).map((slotKey) => {
              const product = slots[slotKey];
              const isActive = activeSlot === slotKey;

              return (
                <div key={slotKey}>
                  <div
                    className={`bg-white border transition-all duration-300 ${
                      isActive
                        ? "border-gold shadow-[0_8px_20px_rgba(158,114,56,0.12)]"
                        : "border-hairline hover:border-gold/40"
                    }`}
                  >
                    <CardContent className="p-3">
                      {product ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-parchment overflow-hidden shrink-0 border border-hairline-soft">
                            {product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4 text-hairline" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-ink line-clamp-1">
                              {product.name}
                            </p>
                            <p className="font-mono text-xs text-gold-dark mt-0.5">
                              ₹{product.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div className="flex gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-smoke hover:text-gold-dark"
                              onClick={() => setActiveSlot(slotKey)}
                              data-testid={`studio-slot-swap-${slotKey}`}
                              aria-label={`Swap ${slotLabels[slotKey]}`}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-smoke hover:text-wine"
                              onClick={() => handleRemoveProduct(slotKey)}
                              data-testid={`studio-slot-remove-${slotKey}`}
                              aria-label={`Remove ${slotLabels[slotKey]}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setActiveSlot(isActive ? null : slotKey)
                          }
                          className="w-full flex items-center gap-3 py-0.5"
                          data-testid={`studio-slot-add-${slotKey}`}
                        >
                          <div className="w-12 h-12 border border-dashed border-[#d8cfbe] flex items-center justify-center">
                            <Plus className="h-4 w-4 text-gold/70" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-medium text-ink/80">
                              {slotLabels[slotKey]}
                            </p>
                            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-smoke/60 mt-0.5">
                              Click to add
                            </p>
                          </div>
                        </button>
                      )}
                    </CardContent>
                  </div>

                  {isActive && (
                    <div
                      className="mt-2 bg-white border border-hairline p-3 max-h-48 overflow-y-auto shadow-[0_12px_28px_rgba(18,18,18,0.08)] animate-bounce-in"
                      data-testid={`studio-picker-${slotKey}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-smoke">
                          Pick for {slotLabels[slotKey]}
                        </p>
                        <button
                          onClick={() => setActiveSlot(null)}
                          className="text-smoke/60 hover:text-ink"
                          aria-label="Close picker"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        {getProductsForSlot(slotKey).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSelectProduct(slotKey, p)}
                            className="w-full flex items-center gap-2.5 p-1.5 hover:bg-parchment transition-colors text-left border-b border-hairline-soft last:border-0"
                            data-testid={`studio-picker-item-${p.id}`}
                          >
                            <div className="w-9 h-9 bg-parchment overflow-hidden shrink-0">
                              {p.images[0] ? (
                                <Image
                                  src={p.images[0]}
                                  alt={p.name}
                                  width={36}
                                  height={36}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag className="h-3.5 w-3.5 text-hairline" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-ink line-clamp-1">
                                {p.name}
                              </p>
                              <p className="font-mono text-[10px] text-smoke">
                                ₹{p.price.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filledSlots > 0 && (
              <div className="bg-parchment border border-hairline p-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-smoke">
                    {filledSlots} items
                  </span>
                  <span className="font-mono text-lg tracking-tight text-ink">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ========= RIGHT: Style Chat — the editorial stylist ========= */}
          <div className="lg:col-span-4">
            <div className="bg-white/95 backdrop-blur-xl border border-hairline shadow-[0_8px_32px_rgba(18,18,18,0.05)] h-full flex flex-col overflow-hidden">
              <div className="px-5 py-4 bg-ink text-cream flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 text-gold-light" />
                <h3 className="font-heading text-lg tracking-tight">
                  Style Assistant
                </h3>
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-gold-light/80 ml-auto">
                  Powered by Gemini
                </span>
              </div>

              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[520px]"
                data-testid="studio-chat-messages"
              >
                {chatMessages.length === 0 && (
                  <div className="text-center py-10 px-4">
                    <Sparkles className="h-6 w-6 text-gold/50 mx-auto mb-3" />
                    <p className="font-heading text-lg italic text-ink/70 tracking-tight">
                      Your personal stylist
                    </p>
                    <p className="text-xs text-smoke mt-2">
                      Ask me to find products for your look
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-smoke/60 mt-3">
                      &quot;Show me red heels&quot;
                    </p>
                  </div>
                )}

                {chatMessages.map((msg) => (
                  <div key={msg.id}>
                    <div
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[90%] px-3.5 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-ink text-cream"
                            : "bg-parchment-deep text-ink border border-hairline-soft"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>

                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {msg.products.slice(0, 6).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleAddFromChat(p)}
                            className="flex-shrink-0 w-[110px] bg-white border border-hairline p-2 hover:border-gold/60 hover:-translate-y-0.5 transition-all text-left"
                            data-testid={`studio-chat-product-${p.id}`}
                          >
                            <div className="w-full h-14 bg-parchment overflow-hidden mb-1.5">
                              {p.images[0] ? (
                                <Image
                                  src={p.images[0]}
                                  alt={p.name}
                                  width={110}
                                  height={56}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag className="h-4 w-4 text-hairline" />
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] font-medium text-ink line-clamp-1">
                              {p.name}
                            </p>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="font-mono text-[10px] text-gold-dark">
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                              <span className="font-mono text-[9px] uppercase tracking-wider text-gold-dark">
                                + Add
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-parchment-deep border border-hairline-soft px-3.5 py-2 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-smoke">
                        Finding products...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleChatSend}
                className="p-3 border-t border-hairline bg-cream/60"
              >
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder='Find products... e.g. "red heels"'
                    className="text-xs h-10 bg-white border-hairline"
                    disabled={chatLoading}
                    data-testid="studio-chat-input"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-ink text-cream hover:bg-ink-soft shrink-0 h-10 w-10 rounded-none sm:rounded-sm"
                    disabled={!chatInput.trim() || chatLoading}
                    data-testid="studio-chat-send-button"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ========= Editorial Modal ========= */}
      {showEditorialModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/85 backdrop-blur-sm p-4"
          data-testid="studio-editorial-modal"
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col bg-cream overflow-hidden shadow-2xl border border-hairline">
            <div className="flex items-center justify-between px-5 py-3.5 bg-ink text-cream">
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-xl tracking-tight">
                  Editorial <span className="italic text-gold-light">Look</span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-cream/50">
                  Powered by Gemini
                </span>
              </div>
              <div className="flex items-center gap-4">
                {editorialImage && (
                  <a
                    href={editorialImage}
                    download="style-oracle-editorial.png"
                    className="font-mono text-[11px] uppercase tracking-[0.12em] text-gold-light hover:text-cream flex items-center gap-1.5"
                    data-testid="studio-editorial-download-link"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                )}
                <button
                  onClick={() => setShowEditorialModal(false)}
                  className="text-cream/70 hover:text-cream"
                  data-testid="studio-editorial-close-button"
                  aria-label="Close editorial look"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-parchment texture-grain p-5">
              {editorialImage ? (
                <img
                  src={editorialImage}
                  alt="Editorial look"
                  className="max-w-full max-h-[75vh] shadow-[0_16px_40px_rgba(18,18,18,0.2)] object-contain border-4 border-white"
                />
              ) : (
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-gold animate-spin mx-auto mb-4" />
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
                    Creating your editorial look...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
