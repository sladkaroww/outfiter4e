import { auth } from "@clerk/nextjs/server";
import { databaseErrorResponse, isUuid, jsonError, jsonOk } from "@/lib/api";
import { getDb } from "@/lib/db";
import { deleteObject, isStorageKey } from "@/lib/storage";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return jsonError(401, "unauthorized", "You need to sign in.");

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError(400, "invalid_id", "Invalid id.");

  try {
    const sql = getDb();
    const rows = (await sql`
      delete from wardrobe_items
      where id = ${id} and clerk_user_id = ${userId}
      returning image_url
    `) as Array<{ image_url: string }>;

    if (rows.length === 0) {
      return jsonError(404, "not_found", "Piece not found in your wardrobe.");
    }

    // Best effort: a leftover object is harmless, a failed delete should not
    // make the row reappear.
    if (isStorageKey(rows[0].image_url)) {
      try {
        await deleteObject(rows[0].image_url);
      } catch (error) {
        console.warn("[storage] Could not delete item image:", error);
      }
    }

    return jsonOk({ id });
  } catch (error) {
    return databaseErrorResponse(error, "DELETE /api/items/[id]");
  }
}
