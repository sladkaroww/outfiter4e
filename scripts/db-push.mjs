#!/usr/bin/env node
/**
 * Apply db/schema.sql to the Neon database.
 *
 *   npm run db:push
 *
 * Uses DATABASE_URL_UNPOOLED (the direct connection) when available because
 * schema changes should not travel through the pooler, then prints a short
 * report so it is obvious whether the tables exist afterwards.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { neon } from "@neondatabase/serverless";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const schemaPath = join(root, "db", "schema.sql");

/** Load .env.local / .env without adding a dependency. Existing env wins. */
async function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    let content;
    try {
      content = await readFile(join(root, name), "utf8");
    } catch {
      continue;
    }
    for (const line of content.split(/\r?\n/)) {
      const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
      if (!match) continue;
      const key = match[1];
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

/**
 * Split a SQL script into statements. Understands single-quoted strings, line
 * comments and dollar-quoted blocks so a `;` inside any of them is not treated
 * as a statement boundary.
 */
function splitStatements(script) {
  const statements = [];
  let current = "";
  let quote = null; // "'" | "$$" | "$tag$"
  let inLineComment = false;

  for (let i = 0; i < script.length; i += 1) {
    const char = script[i];
    const next = script[i + 1];

    if (inLineComment) {
      current += char;
      if (char === "\n") inLineComment = false;
      continue;
    }

    if (quote) {
      current += char;
      if (quote === "'" && char === "'" && next === "'") {
        current += next;
        i += 1;
        continue;
      }
      if (quote === "'" && char === "'") quote = null;
      else if (quote !== "'" && char === "$") {
        const tag = script.slice(i, i + quote.length);
        if (tag === quote) {
          current += script.slice(i + 1, i + quote.length);
          i += quote.length - 1;
          quote = null;
        }
      }
      continue;
    }

    if (char === "-" && next === "-") {
      inLineComment = true;
      current += char;
      continue;
    }

    if (char === "'") {
      quote = "'";
      current += char;
      continue;
    }

    if (char === "$") {
      const match = /^\$[A-Za-z_]*\$/.exec(script.slice(i));
      if (match) {
        quote = match[0];
        current += match[0];
        i += match[0].length - 1;
        continue;
      }
    }

    if (char === ";") {
      if (current.trim()) statements.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) statements.push(current.trim());
  return statements;
}

function resolveConnectionString() {
  const unpooled = process.env.DATABASE_URL_UNPOOLED?.trim();
  const pooled = process.env.DATABASE_URL?.trim();
  const url = unpooled || pooled;

  if (!url) {
    console.error(
      "\n✗ DATABASE_URL is not set.\n\n" +
        "  Add it to .env.local (copy .env.example) and run this command again.\n" +
        `  The connection string is in the Neon console under “Connect”.\n`,
    );
    process.exit(1);
  }

  if (unpooled) {
    console.log("Using DATABASE_URL_UNPOOLED (direct connection).");
  } else {
    console.warn(
      "⚠ DATABASE_URL_UNPOOLED is not set — running migrations over the pooled connection.\n" +
        "  Add the direct connection string to .env.local to avoid pooler limitations.\n",
    );
  }

  return url;
}

await loadEnvFiles();

const connectionString = resolveConnectionString();
const sql = neon(connectionString);

let schema;
try {
  schema = await readFile(schemaPath, "utf8");
} catch (error) {
  console.error(`✗ Could not read ${schemaPath}: ${error.message}`);
  process.exit(1);
}

const statements = splitStatements(schema);
console.log(`Applying ${statements.length} statements from db/schema.sql…`);

try {
  for (const [index, statement] of statements.entries()) {
    const label = statement.split("\n").find((line) => !line.trim().startsWith("--"))?.trim();
    try {
      await sql.query(statement);
    } catch (error) {
      console.error(`\n✗ Statement ${index + 1} failed:\n  ${label}\n\n${error.message}`);
      process.exit(1);
    }
  }
} catch (error) {
  console.error(`\n✗ Could not connect to the database: ${error.message}`);
  process.exit(1);
}

const [{ version }] = await sql.query("select version() as version");
const tables = await sql.query(
  `select table_name
     from information_schema.tables
    where table_schema = 'public'
    order by table_name`,
);
const expected = ["outfit_likes", "outfit_post_items", "outfit_posts", "wardrobe_items"];
const found = tables.map((row) => row.table_name);
const missing = expected.filter((name) => !found.includes(name));

if (missing.length) {
  console.error(`\n✗ Schema was applied but these tables are missing: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`\n✓ Schema is up to date on ${version.split(",")[0]}`);
console.log(`  Tables: ${expected.join(", ")}`);

const counts = await sql.query(
  `select
     (select count(*)::int from wardrobe_items) as wardrobe_items,
     (select count(*)::int from outfit_posts) as outfit_posts,
     (select count(*)::int from outfit_likes) as outfit_likes`,
);
console.log(`  Rows: ${JSON.stringify(counts[0])}\n`);
