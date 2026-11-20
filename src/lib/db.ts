import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { databaseUrl } from "./env";

/**
 * Thrown when DATABASE_URL has not been configured for the current runtime.
 * Kept as a distinct class so routes can turn it into an actionable 503 instead
 * of a generic 500.
 */
export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not configured");
    this.name = "DatabaseNotConfiguredError";
  }
}

type Sql = NeonQueryFunction<false, false>;

let client: Sql | null = null;
let clientUrl = "";

/**
 * Returns a Neon HTTP query function, creating it lazily and reusing it across
 * requests. The HTTP driver needs no pool, so one module-level instance is
 * enough for a serverless deployment.
 */
export function getDb(): Sql {
  const url = databaseUrl();
  if (!url) throw new DatabaseNotConfiguredError();
  if (!client || clientUrl !== url) {
    client = neon(url);
    clientUrl = url;
  }
  return client;
}

export type DatabaseFailure = {
  status: number;
  code: string;
  message: string;
  hint?: string;
};

/** Turns a driver error into a message a human can act on. */
export function describeDatabaseFailure(error: unknown): DatabaseFailure {
  if (error instanceof DatabaseNotConfiguredError) {
    return {
      status: 503,
      code: "database_not_configured",
      message: "DATABASE_URL is not set, so nothing is being saved.",
      hint: "Add DATABASE_URL to .env.local and restart the server (see .env.example).",
    };
  }

  const pgCode =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  const detail = error instanceof Error ? error.message : String(error);

  switch (pgCode) {
    case "42P01":
      return {
        status: 503,
        code: "database_schema_missing",
        message: "The database is reachable but the tables are missing.",
        hint: "Run `npm run db:push` to create the schema from db/schema.sql.",
      };
    case "28P01":
    case "28000":
      return {
        status: 503,
        code: "database_auth_failed",
        message: "The database rejected the connection — wrong username or password.",
        hint: "Get a new connection string from Neon Console → Connect and update DATABASE_URL.",
      };
    case "3D000":
      return {
        status: 503,
        code: "database_not_found",
        message: "No database with that name exists.",
        hint: "Check the database name at the end of DATABASE_URL (usually /neondb).",
      };
    case "42501":
      return {
        status: 503,
        code: "database_permission_denied",
        message: "You do not have permission for this operation.",
        hint: "Use the neondb_owner role in the connection string.",
      };
    case "53300":
      return {
        status: 503,
        code: "database_too_many_connections",
        message: "Too many database connections.",
        hint: "Use the pooled connection string (hostname with -pooler).",
      };
  }

  if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|network|socket/i.test(detail)) {
    return {
      status: 503,
      code: "database_unreachable",
      message: "The database cannot be reached.",
      hint: "Check your connection and whether the Neon project is suspended or IP-restricted.",
    };
  }

  return {
    status: 500,
    code: "database_error",
    message: "A database error occurred.",
    hint: detail.slice(0, 300),
  };
}
