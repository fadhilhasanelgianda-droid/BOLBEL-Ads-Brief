import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { generatePrompt } from "@/lib/claude";

// Long prompts can take a while to generate
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json().catch(() => ({}));
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing or invalid prompt string." }, { status: 400 });
    }

    const text = await generatePrompt(prompt);

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Error generating content via Claude API:", error);

    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "API key Claude tidak valid. Cek ANTHROPIC_API_KEY." }, { status: 500 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Terlalu banyak permintaan ke AI. Coba lagi sebentar." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      // 529 = overloaded; client maps 503 to a friendly "high traffic" message
      const status = error.status === 529 ? 503 : (error.status ?? 500);
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json(
      { error: error?.message || "Failed to generate prompt from Claude API." },
      { status: 500 },
    );
  }
}
