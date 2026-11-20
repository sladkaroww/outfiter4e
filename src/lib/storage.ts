import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isStorageConfigured, storageBucket } from "./env";

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Object storage is not configured");
    this.name = "StorageNotConfiguredError";
  }
}

let client: S3Client | null = null;
let clientKey = "";

/**
 * Neon Object Storage speaks S3 and requires path-style addressing. Credentials
 * come from the AWS_* variables that `neon env pull` writes for the branch, so
 * they live and rotate with the database branch instead of in a separate
 * provider account.
 */
export function getStorageClient(): S3Client {
  if (!isStorageConfigured()) throw new StorageNotConfiguredError();

  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.trim() ?? "";
  const region = process.env.AWS_REGION?.trim() || "eu-central-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim() ?? "";
  const key = `${endpoint}|${region}|${accessKeyId}`;

  if (!client || clientKey !== key) {
    client = new S3Client({
      forcePathStyle: true,
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    clientKey = key;
  }
  return client;
}

export function isStorageKey(value: string) {
  return value.startsWith("wardrobe/");
}

/** Object keys are scoped by user id so one user can never write over another. */
export function buildObjectKey(userId: string, contentType: string) {
  const extension = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  return `wardrobe/${userId}/${crypto.randomUUID()}.${extension}`;
}

export function isOwnedStorageKey(key: string, userId: string) {
  return isStorageKey(key) && key.startsWith(`wardrobe/${userId}/`);
}

export async function putObject(key: string, body: Uint8Array, contentType: string) {
  await getStorageClient().send(
    new PutObjectCommand({
      Bucket: storageBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export async function deleteObject(key: string) {
  await getStorageClient().send(new DeleteObjectCommand({ Bucket: storageBucket(), Key: key }));
}

export async function createDownloadUrl(key: string) {
  return getSignedUrl(
    getStorageClient(),
    new GetObjectCommand({ Bucket: storageBucket(), Key: key }),
    { expiresIn: 3600 },
  );
}

/**
 * Resolves a stored image reference to something the browser can load.
 *
 * - Storage keys (`wardrobe/...`) become short-lived signed URLs.
 * - External http(s) URLs pass through untouched.
 * - Anything that cannot be signed degrades to an empty string so a broken
 *   storage configuration never takes down the whole wardrobe or feed.
 */
export async function resolveImageUrl(value: string): Promise<string> {
  if (!value) return "";
  if (!isStorageKey(value)) return value;
  try {
    return await createDownloadUrl(value);
  } catch (error) {
    console.warn("[storage] Could not sign image URL:", error);
    return "";
  }
}
