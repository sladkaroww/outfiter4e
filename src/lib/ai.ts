import { CLOTHING_TYPES, isClothingType } from "./clothing";

/** Google AI Studio key: https://aistudio.google.com/apikey */
export function geminiApiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    ""
  );
}

/**
 * Flash-Lite is on Gemini's free tier. The `-latest` alias keeps tracking the
 * current free model; override with GEMINI_MODEL (for example a Gemma model).
 */
export function geminiModel() {
  return process.env.GEMINI_MODEL?.trim() || "gemini-flash-lite-latest";
}

export function isAiConfigured() {
  return geminiApiKey().length > 0;
}

export class AiNotConfiguredError extends Error {
  constructor() {
    super("GEMINI_API_KEY is not configured");
    this.name = "AiNotConfiguredError";
  }
}

export type AiFailure = { status: number; code: string; message: string; hint?: string };

export class AiError extends Error {
  status: number;
  code: string;
  hint?: string;

  constructor(failure: AiFailure) {
    super(failure.message);
    this.name = "AiError";
    this.status = failure.status;
    this.code = failure.code;
    this.hint = failure.hint;
  }
}

export type IdentifiedItem = {
  name: string;
  type: string;
  color: string;
  description: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
};

const PROMPT = `You are a fashion stylist cataloguing clothes for a digital wardrobe.
Look at the photo and identify the MAIN garment or accessory.

Return strict JSON with:
- "name": short English name, max 40 chars (e.g. "Vintage shirt", "Black leather boots").
- "type": exactly one of: ${CLOTHING_TYPES.join(", ")}.
- "color": main colour in English, max 25 chars (e.g. "Black", "Light blue").
- "description": one English sentence, max 140 chars, with material, cut and details when visible.

If a person is in the photo, focus on the main garment. If you cannot identify a garment, return type "Other" and describe what you see.`;

function errorFromResponse(status: number, body: string): AiError {
  if (status === 400 || status === 401 || status === 403) {
    return new AiError({
      status: 502,
      code: "ai_auth_failed",
      message: "Gemini rejected the request — the API key looks invalid.",
      hint: "Check GEMINI_API_KEY in .env.local (get a new key from aistudio.google.com/apikey).",
    });
  }
  if (status === 404) {
    return new AiError({
      status: 502,
      code: "ai_model_not_found",
      message: `The model "${geminiModel()}" is not available for this key.`,
      hint: "Set GEMINI_MODEL in .env.local (e.g. gemini-flash-lite-latest or another available model).",
    });
  }
  if (status === 429) {
    return new AiError({
      status: 429,
      code: "ai_quota_exceeded",
      message: "The free Gemini quota is exhausted.",
      hint: "Try later, switch models with GEMINI_MODEL, or check the limits in AI Studio.",
    });
  }
  return new AiError({
    status: 502,
    code: "ai_unavailable",
    message: "Gemini is not responding right now.",
    hint: body.slice(0, 200),
  });
}

/**
 * Sends the photo to Gemini with a JSON response schema and returns the
 * normalized clothing fields. Never trusts the model's output blindly: the type
 * is mapped onto our own list and every string is trimmed and length-capped.
 */
export async function identifyClothingImage(
  bytes: Uint8Array,
  mimeType: string,
): Promise<{ item: IdentifiedItem; model: string }> {
  const apiKey = geminiApiKey();
  if (!apiKey) throw new AiNotConfiguredError();

  const model = geminiModel();
  const base64 = Buffer.from(bytes).toString("base64");

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        signal: AbortSignal.timeout(25_000),
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: PROMPT },
                { inline_data: { mime_type: mimeType, data: base64 } },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                type: { type: "STRING", enum: [...CLOTHING_TYPES] },
                color: { type: "STRING" },
                description: { type: "STRING" },
              },
              required: ["name", "type", "color", "description"],
            },
          },
        }),
      },
    );
  } catch (error) {
    const aborted = error instanceof Error && error.name === "TimeoutError";
    throw new AiError({
      status: aborted ? 504 : 502,
      code: aborted ? "ai_timeout" : "ai_unreachable",
      message: aborted ? "Gemini did not respond in time." : "Gemini cannot be reached.",
      hint: "Check your connection and whether generativelanguage.googleapis.com is reachable.",
    });
  }

  if (!response.ok) {
    throw errorFromResponse(response.status, await response.text());
  }

  const data = (await response.json()) as GeminiResponse;
  if (data.promptFeedback?.blockReason) {
    throw new AiError({
      status: 422,
      code: "ai_blocked",
      message: "The photo was blocked by Gemini's safety filters.",
      hint: "Try a different photo of the piece.",
    });
  }

  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "")) as Record<string, unknown>;
  } catch {
    throw new AiError({
      status: 502,
      code: "ai_invalid_response",
      message: "AI returned an unexpected response.",
      hint: "Try again with another photo.",
    });
  }

  const rawType = typeof parsed.type === "string" ? parsed.type.trim() : "";
  const name = typeof parsed.name === "string" ? parsed.name.trim().slice(0, 80) : "";
  const color = typeof parsed.color === "string" ? parsed.color.trim().slice(0, 40) : "";
  const description =
    typeof parsed.description === "string" ? parsed.description.trim().slice(0, 300) : "";

  return {
    model,
    item: {
      name: name || "New piece",
      type: isClothingType(rawType) ? rawType : "Other",
      color,
      description,
    },
  };
}
