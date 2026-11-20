/**
 * Reads and validates the environment variables the app depends on.
 *
 * Every accessor is a function (not a module constant) so that values are read
 * at request time, which keeps `next build` from freezing them into the bundle.
 */

function value(name: string) {
  const raw = process.env[name];
  return typeof raw === "string" ? raw.trim() : "";
}

export function databaseUrl() {
  return value("DATABASE_URL");
}

export function isDatabaseConfigured() {
  return databaseUrl().length > 0;
}

export function storageBucket() {
  return value("NEON_STORAGE_BUCKET") || value("AWS_S3_BUCKET") || "wardrobe-images";
}

export function isStorageConfigured() {
  return Boolean(
    value("AWS_ENDPOINT_URL_S3") &&
      value("AWS_ACCESS_KEY_ID") &&
      value("AWS_SECRET_ACCESS_KEY") &&
      storageBucket(),
  );
}
