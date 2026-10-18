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
import { Badge } from "@/components/ui/badge";
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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Style Studio
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Let&apos;s Set Up Your Look
            </h1>
            <p className="text-gray-600 max-w-lg mx-auto">
              Upload a selfie to see our products on you, or use an AI model.
            </p>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="p-8 space-y-8">
              {/* Gender */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  I&apos;m shopping for
                </h3>
                <div className="flex gap-3">
                  {genderOptions.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setGender(g.value)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        gender === g.value
                          ? "border-violet-600 bg-violet-50 text-violet-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  My size
                </h3>
                <div className="flex gap-2">
                  {sizeOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`w-14 h-14 rounded-xl text-sm font-medium border-2 transition-all ${
                        size === s
                          ? "border-violet-600 bg-violet-50 text-violet-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Model Mode */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  How do you want to try on outfits?
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setModelMode("selfie")}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      modelMode === "selfie"
                        ? "border-violet-600 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Camera className="h-8 w-8 text-violet-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 text-sm">
                      See It On You
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a selfie — AI puts our catalog products on you
                    </p>
                  </button>

                  <button
                    onClick={() => setModelMode("avatar")}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      modelMode === "avatar"
                        ? "border-violet-600 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <User className="h-8 w-8 text-violet-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Your Avatar
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a selfie — AI creates a fashion avatar that looks
                      like you
                    </p>
                  </button>

                  <button
                    onClick={() => setModelMode("preset")}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      modelMode === "preset"
                        ? "border-violet-600 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Users className="h-8 w-8 text-violet-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 text-sm">
                      AI Model
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
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
                  />

                  {!selfiePreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all"
                    >
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload a clear, front-facing photo
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        JPG or PNG, max 5MB
                      </p>
                      <Button variant="outline" size="sm" type="button">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-6 items-start">
                      {/* Selfie preview */}
                      <div className="relative">
                        <div className="w-32 h-40 rounded-xl overflow-hidden border-2 border-violet-300 shadow-md">
                          <img
                            src={selfiePreview}
                            alt="Your selfie"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={handleRemoveSelfie}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex items-center gap-1 mt-2 justify-center">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">
                            Uploaded
                          </span>
                        </div>
                      </div>

                      {/* Avatar preview (if avatar mode) */}
                      {modelMode === "avatar" && (
                        <div className="flex-1">
                          {avatarPreview ? (
                            <div>
                              <div className="w-32 h-40 rounded-xl overflow-hidden border-2 border-purple-300 shadow-md">
                                <img
                                  src={avatarPreview}
                                  alt="Your avatar"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex items-center gap-1 mt-2">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                <span className="text-xs text-green-600 font-medium">
                                  Avatar ready
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Button
                                onClick={handleGenerateAvatar}
                                disabled={isGeneratingAvatar}
                                className="bg-purple-600 hover:bg-purple-700"
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
                              <p className="text-[10px] text-gray-400 mt-2">
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
                className="w-full bg-violet-600 hover:bg-violet-700 text-base"
                onClick={handleStartStudio}
                disabled={isGeneratingAvatar}
              >
                {modelMode === "preset"
                  ? "Enter Style Studio"
                  : modelMode === "avatar"
                    ? "Enter Studio with Avatar"
                    : "Enter Studio with My Photo"}
                <ArrowRight className="h-5 w-5 ml-2" />
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-violet-600" />
            <h1 className="text-xl font-bold text-gray-900">Style Studio</h1>
            <Badge variant="secondary" className="text-xs">
              {modelMode === "selfie"
                ? "Your Photo"
                : modelMode === "avatar"
                  ? "Your Avatar"
                  : "AI Model"}
            </Badge>
            {personImg && (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-violet-300">
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
          >
            Change Model
          </Button>
        </div>

        {/* Toast */}
        {addedFeedback && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-violet-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-bounce-in">
            {addedFeedback}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-6">
          {/* ========= LEFT: Model Preview ========= */}
          <div className="lg:col-span-5">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="aspect-[3/4] bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center relative">
                  {isGenerating ? (
                    <div className="text-center">
                      <RefreshCw className="h-12 w-12 text-violet-600 animate-spin mx-auto mb-4" />
                      <p className="text-sm font-medium text-gray-700">
                        {personImg
                          ? "Putting products on you..."
                          : "Generating your look..."}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        This takes about 10-15 seconds
                      </p>
                    </div>
                  ) : generateError ? (
                    <div className="text-center p-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="h-8 w-8 text-red-500" />
                      </div>
                      <p className="text-sm font-medium text-red-600">
                        Generation Failed
                      </p>
                      <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
                        {generateError}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => handleGenerateLook("studio")}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
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
                      <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-violet-200">
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
                      <p className="text-sm text-gray-500">
                        Select products and click &quot;Try It On&quot;
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        AI will show you wearing the selected products
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <User className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">
                        Select products and click &quot;Generate Look&quot;
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Powered badge + download */}
            {generatedLook && (
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-xs text-gray-400">
                  Powered by Gemini on Vertex AI
                </span>
                <a
                  href={generatedLook}
                  download="style-oracle-look.png"
                  className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              </div>
            )}

            {/* Product Strip */}
            {filledSlots > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Outfit items
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {(Object.entries(slots) as [SlotKey, Product | null][])
                    .filter(([, p]) => p !== null)
                    .map(([key, product]) => (
                      <div
                        key={key}
                        className="flex-shrink-0 w-[140px] bg-white rounded-xl border border-gray-200 p-2 hover:border-violet-300 transition-all"
                      >
                        <div className="w-full h-20 rounded-lg bg-gray-100 overflow-hidden mb-2">
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
                              <ShoppingBag className="h-5 w-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-gray-900 line-clamp-1">
                          {product!.name}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[11px] font-semibold text-violet-600">
                            ₹{product!.price.toLocaleString("en-IN")}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product!)}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium hover:bg-violet-200 transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                        <span className="text-[9px] text-gray-400 mt-0.5 block">
                          {slotLabels[key]}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Generate + Final Look Buttons */}
            <div className="flex gap-3 mt-4">
              <Button
                size="lg"
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                disabled={filledSlots === 0 || isGenerating}
                onClick={() => handleGenerateLook("studio")}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    {personImg ? "Try It On" : "Generate Look"}
                  </>
                )}
              </Button>
              {generatedLook && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-violet-300 text-violet-700 hover:bg-violet-50"
                  disabled={isGeneratingEditorial}
                  onClick={() => handleGenerateLook("editorial")}
                >
                  {isGeneratingEditorial ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Show Final Look
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* ========= MIDDLE: Outfit Slots ========= */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="font-semibold text-gray-900">Your Outfit</h2>

            {(Object.keys(slotLabels) as SlotKey[]).map((slotKey) => {
              const product = slots[slotKey];
              const isActive = activeSlot === slotKey;

              return (
                <div key={slotKey}>
                  <Card
                    className={`border-2 transition-all ${isActive ? "border-violet-600" : "border-gray-200"}`}
                  >
                    <CardContent className="p-3">
                      {product ? (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
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
                                <ShoppingBag className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-violet-600 font-semibold">
                              ₹{product.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setActiveSlot(slotKey)}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-600"
                              onClick={() => handleRemoveProduct(slotKey)}
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
                        >
                          <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <Plus className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-medium text-gray-500">
                              {slotLabels[slotKey]}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              Click to add
                            </p>
                          </div>
                        </button>
                      )}
                    </CardContent>
                  </Card>

                  {isActive && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-xl p-3 max-h-48 overflow-y-auto shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-500">
                          Pick for {slotLabels[slotKey]}
                        </p>
                        <button
                          onClick={() => setActiveSlot(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {getProductsForSlot(slotKey).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSelectProduct(slotKey, p)}
                            className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-violet-50 transition-colors text-left"
                          >
                            <div className="w-9 h-9 rounded bg-gray-100 overflow-hidden shrink-0">
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
                                  <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-gray-900 line-clamp-1">
                                {p.name}
                              </p>
                              <p className="text-[11px] text-gray-500">
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
              <Card className="bg-violet-50 border-violet-200">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">
                      {filledSlots} items
                    </span>
                    <span className="text-base font-bold text-violet-700">
                      ₹{totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ========= RIGHT: Style Chat ========= */}
          <div className="lg:col-span-4">
            <Card className="border-0 shadow-lg h-full flex flex-col overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <h3 className="font-semibold text-sm">Style Assistant</h3>
                <span className="text-[10px] text-violet-200 ml-auto">
                  Powered by Gemini
                </span>
              </div>

              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px] max-h-[500px]"
              >
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">
                      Ask me to find products for your look
                    </p>
                    <p className="text-[10px] text-gray-300 mt-1">
                      &quot;Show me red heels&quot; or &quot;Find party
                      accessories&quot;
                    </p>
                  </div>
                )}

                {chatMessages.map((msg) => (
                  <div key={msg.id}>
                    <div
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-violet-600 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
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
                            className="flex-shrink-0 w-[110px] bg-white rounded-lg border border-gray-200 p-2 hover:border-violet-400 transition-all text-left"
                          >
                            <div className="w-full h-14 rounded bg-gray-100 overflow-hidden mb-1">
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
                                  <ShoppingBag className="h-4 w-4 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] font-medium text-gray-900 line-clamp-1">
                              {p.name}
                            </p>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-[10px] font-semibold text-violet-600">
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[9px] text-violet-500 font-medium">
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
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" />
                      <span className="text-[10px] text-gray-500">
                        Finding products...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleChatSend}
                className="p-3 border-t border-gray-100"
              >
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder='Find products... e.g. "red heels"'
                    className="text-xs h-9"
                    disabled={chatLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-violet-600 hover:bg-violet-700 shrink-0 h-9 w-9"
                    disabled={!chatInput.trim() || chatLoading}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {/* ========= Editorial Modal ========= */}
      {showEditorialModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600" />
                <span className="font-semibold text-gray-900">
                  Editorial Look
                </span>
                <span className="text-xs text-gray-400">
                  Powered by Gemini
                </span>
              </div>
              <div className="flex items-center gap-2">
                {editorialImage && (
                  <a
                    href={editorialImage}
                    download="style-oracle-editorial.png"
                    className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                )}
                <button
                  onClick={() => setShowEditorialModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 p-4">
              {editorialImage ? (
                <img
                  src={editorialImage}
                  alt="Editorial look"
                  className="max-w-full max-h-[75vh] rounded-lg shadow-lg object-contain"
                />
              ) : (
                <div className="text-center">
                  <Loader2 className="h-10 w-10 text-violet-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
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
