import { auth } from "@clerk/nextjs/server";
import { jsonError, jsonOk } from "@/lib/api";
import { isStorageConfigured, storageBucket } from "@/lib/env";
import { buildObjectKey, putObject } from "@/lib/storage";

const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return jsonError(401, "unauthorized", "You need to sign in.");

  if (!isStorageConfigured()) {
    return jsonError(
      503,
      "storage_not_configured",
      "Image uploads are not configured.",
      `Neon Object Storage bucket "${storageBucket()}" needs AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and AWS_REGION in .env.local (get them with "neon env pull").`,
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, "invalid_body", 'Expected multipart/form-data with a "file" field.');
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError(400, "file_required", "No image attached.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return jsonError(415, "unsupported_type", "Only JPEG, PNG, WebP and GIF images are supported.");
  }
  if (file.size === 0) {
    return jsonError(400, "empty_file", "The file is empty.");
  }
  if (file.size > MAX_BYTES) {
    return jsonError(413, "file_too_large", "The image is larger than 4 MB.");
  }

  try {
    const key = buildObjectKey(userId, file.type);
    const bytes = new Uint8Array(await file.arrayBuffer());
    await putObject(key, bytes, file.type);
    return jsonOk({ key }, 201);
  } catch (error) {
    console.error("[storage] Upload failed:", error);
    return jsonError(
      502,
      "storage_upload_failed",
      "Uploading to storage failed.",
      error instanceof Error ? error.message.slice(0, 200) : undefined,
    );
  }
}
