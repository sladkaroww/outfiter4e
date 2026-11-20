import { clerkClient } from "@clerk/nextjs/server";

export type Author = {
  name: string;
  handle: string;
  initials: string;
  avatarUrl: string | null;
};

const FALLBACK: Author = { name: "outfiter. member", handle: "@member", initials: "OU", avatarUrl: null };

const CACHE_TTL_MS = 60_000;
const FALLBACK_TTL_MS = 15_000;
const cache = new Map<string, { author: Author; expiresAt: number }>();

function initialsFrom(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function slugFrom(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._]/g, "")
    .slice(0, 24);
}

/**
 * Resolves Clerk user ids to display names for the feed.
 *
 * Names are not stored in Postgres on purpose: Clerk stays the single source of
 * truth for identity, so a profile rename immediately shows up in the feed.
 * If Clerk is unreachable the feed still renders with a neutral fallback.
 */
export async function getAuthors(userIds: string[]): Promise<Map<string, Author>> {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  const authors = new Map<string, Author>();
  if (unique.length === 0) return authors;

  const now = Date.now();
  const missing: string[] = [];
  for (const id of unique) {
    const cached = cache.get(id);
    if (cached && cached.expiresAt > now) authors.set(id, cached.author);
    else missing.push(id);
  }
  if (missing.length === 0) return authors;

  try {
    const client = await clerkClient();
    const { data } = await client.users.getUserList({ userId: missing, limit: missing.length });

    for (const user of data) {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
      const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";
      const name = fullName || user.username || email.split("@")[0] || FALLBACK.name;
      const handle = user.username ? `@${user.username}` : `@${slugFrom(name) || "member"}`;
      const author: Author = {
        name,
        handle,
        initials: initialsFrom(name),
        avatarUrl: user.imageUrl ?? null,
      };
      authors.set(user.id, author);
      cache.set(user.id, { author, expiresAt: now + CACHE_TTL_MS });
    }
  } catch (error) {
    console.warn("[clerk] Could not load author profiles:", error);
  }

  for (const id of missing) {
    if (!authors.has(id)) {
      authors.set(id, FALLBACK);
      // Short negative cache so a Clerk outage does not turn every feed request
      // into another failing API call.
      cache.set(id, { author: FALLBACK, expiresAt: now + FALLBACK_TTL_MS });
    }
  }
  return authors;
}
