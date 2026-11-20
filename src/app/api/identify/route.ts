import { auth } from "@clerk/nextjs/server";
import { AiError, AiNotConfiguredError, identifyClothingImage, isAiConfigured } from "@/lib/ai";
import { jsonError, jsonOk } from "@/lib/api";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/clothing";

/**
 * Identifies the garment in an uploaded photo with Gemini and returns the
 * wardrobe fields (name, type, color, description).
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return jsonError(401, "unauthorized", "You need to sign in.");

  if (!isAiConfigured()) {
    return jsonError(
      503,
      "ai_not_configured",
      "AI recognition is not configured.",
      "Add GEMINI_API_KEY to .env.local — free key from https://aistudio.google.com/apikey.",
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, "invalid_body", 'Expected multipart/form-data with a "file" field.');
  }

  const file = form.get("file");
  if (!(file instanceof File)) return jsonError(400, "file_required", "No image attached.");
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return jsonError(415, "unsupported_type", "Only JPEG, PNG, WebP and GIF images are supported.");
  }
  if (file.size === 0) return jsonError(400, "empty_file", "The file is empty.");
  if (file.size > MAX_IMAGE_BYTES) {
    return jsonError(413, "file_too_large", "The image is larger than 4 MB.");
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await identifyClothingImage(bytes, file.type);
    return jsonOk(result);
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return jsonError(503, "ai_not_configured", "AI recognition is not configured.");
    }
    if (error instanceof AiError) {
      console.error("[ai] identify failed:", error.code, error.message);
      return jsonError(error.status, error.code, error.message, error.hint);
    }
    console.error("[ai] identify crashed:", error);
    return jsonError(502, "ai_error", "AI recognition failed. Try again.");
  }
}
