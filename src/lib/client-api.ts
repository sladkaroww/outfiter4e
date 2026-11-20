/** Client-side helpers for talking to the route handlers. */

export type ApiFailure = {
  message: string;
  code?: string;
  hint?: string;
};

export class ApiError extends Error {
  code?: string;
  hint?: string;

  constructor(failure: ApiFailure) {
    super(failure.message);
    this.name = "ApiError";
    this.code = failure.code;
    this.hint = failure.hint;
  }
}

export async function readFailure(response: Response): Promise<ApiFailure> {
  try {
    const data = (await response.json()) as { error?: string; code?: string; hint?: string };
    return {
      message: data.error || `Request failed (${response.status})`,
      code: data.code,
      hint: data.hint,
    };
  } catch {
    return { message: `Request failed (${response.status})` };
  }
}

/** Produces a message that includes the hint when the server sent one. */
export function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.hint ? `${error.message} ${error.hint}` : error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Try again.";
}

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/**
 * Uploads an image through our own route handler instead of PUT-ing straight to
 * S3 from the browser: that keeps CORS out of the picture and lets the server
 * validate type and size before anything is written.
 */
export async function uploadImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError({
      message: "The image is too large.",
      hint: "The maximum size is 4 MB — shrink or compress it.",
    });
  }

  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/uploads", { method: "POST", body });
  if (!response.ok) throw new ApiError(await readFailure(response));

  const data = (await response.json()) as { key?: string };
  if (!data.key) {
    throw new ApiError({ message: "The server did not return a key for the uploaded photo." });
  }
  return data.key;
}

export type IdentifiedItem = {
  name: string;
  type: string;
  color: string;
  description: string;
};

/** Asks Gemini to identify the garment in a photo and fill the wardrobe form. */
export async function identifyClothing(file: File): Promise<IdentifiedItem> {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/identify", { method: "POST", body });
  if (!response.ok) throw new ApiError(await readFailure(response));

  const data = (await response.json()) as { item?: IdentifiedItem };
  if (!data.item) {
    throw new ApiError({ message: "AI returned no result. Try again." });
  }
  return data.item;
}
