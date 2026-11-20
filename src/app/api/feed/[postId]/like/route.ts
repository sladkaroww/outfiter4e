import { auth } from "@clerk/nextjs/server";
import { databaseErrorResponse, isUuid, jsonError, jsonOk } from "@/lib/api";
import { getDb } from "@/lib/db";

export async function POST(
  _request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return jsonError(401, "unauthorized", "You need to sign in.");

  const { postId } = await context.params;
  if (!isUuid(postId)) return jsonError(400, "invalid_id", "Invalid outfit id.");

  try {
    const sql = getDb();
    const posts = (await sql`select id from outfit_posts where id = ${postId}`) as Array<{ id: string }>;
    if (posts.length === 0) {
      return jsonError(404, "not_found", "This outfit no longer exists.");
    }

    const removed = (await sql`
      delete from outfit_likes
      where post_id = ${postId} and clerk_user_id = ${userId}
      returning post_id
    `) as Array<{ post_id: string }>;

    const liked = removed.length === 0;
    if (liked) {
      await sql`
        insert into outfit_likes (post_id, clerk_user_id)
        values (${postId}, ${userId})
        on conflict do nothing
      `;
    }

    const [counts] = (await sql`
      select count(*)::int as likes from outfit_likes where post_id = ${postId}
    `) as Array<{ likes: number }>;

    return jsonOk({ liked, likes: Number(counts?.likes ?? 0) });
  } catch (error) {
    return databaseErrorResponse(error, "POST /api/feed/[postId]/like");
  }
}
