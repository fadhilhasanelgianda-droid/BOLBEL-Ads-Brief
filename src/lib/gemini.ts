import "server-only";
import { GoogleGenAI } from "@google/genai";

// Lazy initialization for Gemini client
let aiClient: GoogleGenAI | null = null;
export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing or empty.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export async function generatePromptWithFallback(ai: GoogleGenAI, prompt: string): Promise<string> {
  const modelsToTry = [
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[Gemini] Attempting generation with model ${model} (attempt ${attempt + 1})...`);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const isUnavailable =
          err?.code === 503 ||
          err?.status === "UNAVAILABLE" ||
          (typeof err?.message === "string" && (
            err.message.includes("503") ||
            err.message.includes("high demand") ||
            err.message.includes("UNAVAILABLE")
          ));

        console.warn(`[Gemini] Model ${model} attempt ${attempt + 1} failed:`, err?.message || err);

        if (isUnavailable && attempt === 0) {
          // Wait 1.5s before retrying once
          await new Promise((resolve) => setTimeout(resolve, 1500));
          continue;
        }
        // If not retryable or attempt > 0, move to the next fallback model
        break;
      }
    }
  }

  throw lastError || new Error("Semua model Gemini sedang mengalami lonjakan trafik. Silakan coba lagi sebentar.");
}
