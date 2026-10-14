import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-5-5";

// Lazy initialization for Claude client
let client: Anthropic | null = null;
function getClaudeClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is missing or empty.");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function generatePrompt(prompt: string): Promise<string> {
  const response = await getClaudeClient().beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: "medium" },
    // If a safety classifier declines, the API retries on a fallback model in the same call
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: [{ role: "user", content: prompt }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("AI menolak permintaan ini. Coba ubah isi brief lalu generate ulang.");
  }

  const text = response.content
    .flatMap((block) => (block.type === "text" ? [block.text] : []))
    .join("")
    .trim();
  if (!text) {
    throw new Error("AI tidak menghasilkan teks. Silakan coba lagi.");
  }
  return text;
}
