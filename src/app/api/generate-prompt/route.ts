import { NextResponse } from "next/server";
import { generatePromptWithFallback, getGeminiClient } from "@/lib/gemini";

// Model fallbacks + retries can take a while
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json().catch(() => ({}));
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing or invalid prompt string." }, { status: 400 });
    }

    const ai = getGeminiClient();
    const text = await generatePromptWithFallback(ai, prompt);

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Error generating content via Gemini server API:", error);

    let statusCode = 500;
    if (typeof error?.code === "number" && error.code >= 400 && error.code < 600) {
      statusCode = error.code;
    } else if (typeof error?.status === "number" && error.status >= 400 && error.status < 600) {
      statusCode = error.status;
    } else if (error?.status === "UNAVAILABLE" || (typeof error?.message === "string" && error.message.includes("503"))) {
      statusCode = 503;
    }

    let errorMessage = error?.message || "Failed to generate prompt from Gemini API.";
    if (typeof errorMessage === "string" && errorMessage.includes('"message":')) {
      try {
        const parsed = JSON.parse(errorMessage.replace(/^ApiError:\s*/, ""));
        if (parsed?.error?.message) {
          errorMessage = parsed.error.message;
        }
      } catch {
        // use raw error message
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
