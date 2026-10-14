import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization for Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
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

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function generatePromptWithFallback(ai: GoogleGenAI, prompt: string): Promise<string> {
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

app.post("/api/generate-prompt", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid prompt string." });
    }

    const ai = getGeminiClient();
    const text = await generatePromptWithFallback(ai, prompt);

    return res.json({ text });
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

    return res.status(statusCode).json({
      error: errorMessage,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
