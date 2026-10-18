import { NextRequest, NextResponse } from "next/server";
import { generateAvatar } from "@/lib/imagen";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { selfieBase64, mimeType } = (await req.json()) as {
      selfieBase64: string;
      mimeType: string;
    };

    if (!selfieBase64) {
      return NextResponse.json(
        { error: "No selfie provided" },
        { status: 400 }
      );
    }

    const result = await generateAvatar(selfieBase64, mimeType || "image/jpeg");

    return NextResponse.json({
      image: result.image,
      mimeType: result.mimeType,
    });
  } catch (error) {
    console.error("Avatar generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate avatar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
