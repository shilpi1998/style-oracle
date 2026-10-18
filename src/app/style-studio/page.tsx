"use client";

import { useState } from "react";
import { Sparkles, Upload, User, Users, Camera, ArrowRight, RefreshCw, ShoppingBag, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { products } from "@/data/products";
import { Product, ModelMode } from "@/lib/types";

const sizeOptions = ["XS", "S", "M", "L", "XL"];
const genderOptions = [
  { value: "women" as const, label: "Women" },
  { value: "men" as const, label: "Men" },
];

const presetModels = {
  women: [
    { id: "preset-w-1", name: "Model A", description: "South Asian, medium build" },
    { id: "preset-w-2", name: "Model B", description: "East Asian, slim build" },
    { id: "preset-w-3", name: "Model C", description: "Western, athletic build" },
  ],
  men: [
    { id: "preset-m-1", name: "Model A", description: "South Asian, athletic build" },
    { id: "preset-m-2", name: "Model B", description: "East Asian, slim build" },
    { id: "preset-m-3", name: "Model C", description: "Western, medium build" },
  ],
};

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

export default function StyleStudioPage() {
  const [step, setStep] = useState<"onboarding" | "studio">("onboarding");
  const [size, setSize] = useState("M");
  const [gender, setGender] = useState<"women" | "men">("women");
  const [modelMode, setModelMode] = useState<ModelMode>("preset");
  const [selectedPreset, setSelectedPreset] = useState("");
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

  function handleStartStudio() {
    setStep("studio");
  }

  function handleSelectProduct(slot: SlotKey, product: Product) {
    setSlots((prev) => ({ ...prev, [slot]: product }));
    setActiveSlot(null);
  }

  function handleRemoveProduct(slot: SlotKey) {
    setSlots((prev) => ({ ...prev, [slot]: null }));
  }

  function handleGenerateLook() {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedLook("generated");
      setIsGenerating(false);
    }, 3000);
  }

  const filledSlots = Object.values(slots).filter(Boolean).length;
  const totalPrice = Object.values(slots)
    .filter(Boolean)
    .reduce((sum, p) => sum + (p?.price || 0), 0);

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
              p.subcategory.includes("blazer") ||
              p.subcategory.includes("ethnic")) &&
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
              Tell us a few things so we can create the perfect model for trying on outfits.
            </p>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="p-8 space-y-8">
              {/* Gender */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">I&apos;m shopping for</h3>
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
                <h3 className="text-sm font-semibold text-gray-900 mb-3">My size</h3>
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
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose your model</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Mode A — Selfie */}
                  <button
                    onClick={() => setModelMode("selfie")}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      modelMode === "selfie"
                        ? "border-violet-600 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Camera className="h-8 w-8 text-violet-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 text-sm">Your Look</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a selfie — AI creates a full-body model with your face
                    </p>
                  </button>

                  {/* Mode B — Avatar */}
                  <button
                    onClick={() => setModelMode("avatar")}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      modelMode === "avatar"
                        ? "border-violet-600 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <User className="h-8 w-8 text-violet-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 text-sm">Your Avatar</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a selfie — AI creates a stylized fashion avatar
                    </p>
                  </button>

                  {/* Mode C — Preset */}
                  <button
                    onClick={() => setModelMode("preset")}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      modelMode === "preset"
                        ? "border-violet-600 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Users className="h-8 w-8 text-violet-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 text-sm">Pick a Model</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose from diverse preset models — no upload needed
                    </p>
                  </button>
                </div>
              </div>

              {/* Upload Zone (Mode A & B) */}
              {(modelMode === "selfie" || modelMode === "avatar") && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a clear, front-facing selfie
                  </p>
                  <p className="text-xs text-gray-400 mb-4">JPG or PNG, max 5MB</p>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Photo
                  </Button>
                </div>
              )}

              {/* Preset Models (Mode C) */}
              {modelMode === "preset" && (
                <div className="grid grid-cols-3 gap-4">
                  {presetModels[gender].map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedPreset(model.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedPreset === model.id
                          ? "border-violet-600 bg-violet-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">{model.name}</p>
                      <p className="text-xs text-gray-500">{model.description}</p>
                    </button>
                  ))}
                </div>
              )}

              <Button
                size="lg"
                className="w-full bg-violet-600 hover:bg-violet-700 text-base"
                onClick={handleStartStudio}
              >
                Create My Model
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ==================== STUDIO WORKSPACE ====================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-violet-600" />
            <h1 className="text-xl font-bold text-gray-900">Style Studio</h1>
            <Badge variant="secondary" className="text-xs">
              {modelMode === "selfie" ? "Your Look" : modelMode === "avatar" ? "Avatar" : "Preset Model"}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => setStep("onboarding")}>
            Change Model
          </Button>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Model Preview — Left Panel */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="aspect-[3/4] bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center relative">
                  {isGenerating ? (
                    <div className="text-center">
                      <RefreshCw className="h-12 w-12 text-violet-600 animate-spin mx-auto mb-4" />
                      <p className="text-sm font-medium text-gray-700">Generating your look...</p>
                      <p className="text-xs text-gray-500 mt-1">This takes about 10-15 seconds</p>
                    </div>
                  ) : generatedLook ? (
                    <div className="text-center p-8">
                      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
                        <Sparkles className="h-16 w-16 text-violet-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-800">Look Generated!</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Virtual try-on result will appear here once connected to IDM-VTON
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <User className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">
                        Select products and click &quot;Generate Look&quot; to see them on your model
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex gap-3 mt-4">
              <Button
                size="lg"
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                disabled={filledSlots === 0 || isGenerating}
                onClick={handleGenerateLook}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Look
                  </>
                )}
              </Button>
              {filledSlots > 0 && (
                <Button size="lg" variant="outline">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Add All to Cart (₹{totalPrice.toLocaleString("en-IN")})
                </Button>
              )}
            </div>
          </div>

          {/* Product Slots — Right Panel */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-semibold text-gray-900">Your Outfit</h2>

            {(Object.keys(slotLabels) as SlotKey[]).map((slotKey) => {
              const product = slots[slotKey];
              const isActive = activeSlot === slotKey;

              return (
                <div key={slotKey}>
                  <Card className={`border-2 transition-all ${isActive ? "border-violet-600" : "border-gray-200"}`}>
                    <CardContent className="p-3">
                      {product ? (
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <span className="text-xl">
                              {product.category === "women" ? "👗" : product.category === "men" ? "👔" : product.category === "footwear" ? "👟" : "💎"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                            <p className="text-sm text-violet-600 font-semibold">₹{product.price.toLocaleString("en-IN")}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setActiveSlot(slotKey)}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => handleRemoveProduct(slotKey)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveSlot(isActive ? null : slotKey)}
                          className="w-full flex items-center gap-3 py-1"
                        >
                          <div className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <Plus className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-500">{slotLabels[slotKey]}</p>
                            <p className="text-xs text-gray-400">Click to add</p>
                          </div>
                        </button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Product Picker Drawer */}
                  {isActive && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-xl p-3 max-h-60 overflow-y-auto shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-500">Pick a product for {slotLabels[slotKey]}</p>
                        <button onClick={() => setActiveSlot(null)} className="text-gray-400 hover:text-gray-600">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {getProductsForSlot(slotKey).map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleSelectProduct(slotKey, p)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-violet-50 transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                              <span className="text-sm">
                                {p.category === "women" ? "👗" : p.category === "men" ? "👔" : p.category === "footwear" ? "👟" : "💎"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 line-clamp-1">{p.name}</p>
                              <p className="text-xs text-gray-500">₹{p.price.toLocaleString("en-IN")}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Price Summary */}
            {filledSlots > 0 && (
              <Card className="bg-violet-50 border-violet-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{filledSlots} items selected</span>
                    <span className="text-lg font-bold text-violet-700">₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
