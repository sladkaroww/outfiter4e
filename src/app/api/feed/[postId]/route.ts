import { auth } from "@clerk/nextjs/server";
import { databaseErrorResponse, isUuid, jsonError, jsonOk } from "@/lib/api";
import { getDb } from "@/lib/db";
import { deleteObject, isStorageKey } from "@/lib/storage";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return jsonError(401, "unauthorized", "You need to sign in.");

  const { postId } = await context.params;
  if (!isUuid(postId)) return jsonError(400, "invalid_id", "Invalid outfit id.");

  try {
    const sql = getDb();
    // The owner check lives in the WHERE clause, so a user can never delete
    // somebody else's post even if they guess the id.
    const rows = (await sql`
      delete from outfit_posts
      where id = ${postId} and clerk_user_id = ${userId}
      returning image_url
    `) as Array<{ image_url: string }>;

    if (rows.length === 0) {
      return jsonError(404, "not_found", "Outfit not found, or it is not yours.");
    }

    // Likes and post→item links are removed by ON DELETE CASCADE. The image is
    // cleaned up best effort: a leftover object must not resurrect the post.
    if (isStorageKey(rows[0].image_url)) {
      try {
        await deleteObject(rows[0].image_url);
      } catch (error) {
        console.warn("[storage] Could not delete post image:", error);
      }
    }

    return jsonOk({ id: postId });
  } catch (error) {
    return databaseErrorResponse(error, "DELETE /api/feed/[postId]");
  }
}
