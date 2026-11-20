import { NextResponse } from "next/server";
import { describeDatabaseFailure } from "./db";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export function jsonError(status: number, code: string, error: string, hint?: string) {
  return NextResponse.json({ code, error, ...(hint ? { hint } : {}) }, { status, headers: NO_STORE });
}

export function jsonOk<T extends Record<string, unknown>>(body: T, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/** Logs the driver error server-side and returns a message the UI can show. */
export function databaseErrorResponse(error: unknown, context: string) {
  const failure = describeDatabaseFailure(error);
  console.error(`[db] ${context}:`, failure.code, error);
  return jsonError(failure.status, failure.code, failure.message, failure.hint);
}

/** Reads a JSON object body, returning null when the payload is not an object. */
export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function asTrimmedString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
