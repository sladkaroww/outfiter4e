import { jsonOk } from "@/lib/api";
import { describeDatabaseFailure, getDb } from "@/lib/db";
import { isDatabaseConfigured, isStorageConfigured, storageBucket } from "@/lib/env";
import { geminiModel, isAiConfigured } from "@/lib/ai";

export const dynamic = "force-dynamic";

const REQUIRED_TABLES = ["wardrobe_items", "outfit_posts", "outfit_post_items", "outfit_likes"];

/**
 * Diagnostics for the browser: what is configured, what is reachable and what
 * is missing. Deliberately exposes no secrets, only booleans and fix hints.
 */
export async function GET() {
  const configured = isDatabaseConfigured();
  let reachable = false;
  let schemaReady = false;
  let error: string | null = null;
  let hint: string | null = null;
  let missingTables: string[] = [];

  if (!configured) {
    error = "DATABASE_URL is not set.";
    hint = "Add DATABASE_URL to .env.local (see .env.example) and restart the server.";
  } else {
    try {
      const sql = getDb();
      await sql`select 1`;
      reachable = true;

      const rows = (await sql`
        select table_name
        from information_schema.tables
        where table_schema = 'public'
          and table_name in ('wardrobe_items', 'outfit_posts', 'outfit_post_items', 'outfit_likes')
      `) as Array<{ table_name: string }>;

      const found = rows.map((row) => row.table_name);
      missingTables = REQUIRED_TABLES.filter((table) => !found.includes(table));
      schemaReady = missingTables.length === 0;

      if (!schemaReady) {
        error = `Missing tables: ${missingTables.join(", ")}.`;
        hint = "Run `npm run db:push` to apply db/schema.sql.";
      }
    } catch (caught) {
      const failure = describeDatabaseFailure(caught);
      error = failure.message;
      hint = failure.hint ?? null;
    }
  }

  const storage = { configured: isStorageConfigured(), bucket: storageBucket() };

  return jsonOk({
    ok: configured && reachable && schemaReady && storage.configured,
    database: { configured, reachable, schemaReady, missingTables, error, hint },
    storage,
    ai: { configured: isAiConfigured(), model: geminiModel() },
  });
}
