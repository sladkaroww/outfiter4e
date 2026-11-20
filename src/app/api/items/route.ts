import { auth } from "@clerk/nextjs/server";
import {
  asTrimmedString,
  databaseErrorResponse,
  jsonError,
  jsonOk,
  readJsonBody,
} from "@/lib/api";
import { getDb } from "@/lib/db";
import { isOwnedStorageKey, resolveImageUrl } from "@/lib/storage";

type ItemRow = {
  id: string;
  name: string;
  type: string;
  color: string;
  description: string;
  image_url: string;
  created_at: string;
};

async function withImageUrl(row: ItemRow) {
  return { ...row, image_url: await resolveImageUrl(row.image_url) };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return jsonError(401, "unauthorized", "You need to sign in.");

  try {
    const sql = getDb();
    const rows = (await sql`
      select id, name, type, color, description, image_url, created_at
      from wardrobe_items
      where clerk_user_id = ${userId}
      order by created_at desc
      limit 300
    `) as ItemRow[];

    return jsonOk({ items: await Promise.all(rows.map(withImageUrl)) });
  } catch (error) {
    return databaseErrorResponse(error, "GET /api/items");
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return jsonError(401, "unauthorized", "You need to sign in.");

  const body = await readJsonBody(request);
  if (!body) return jsonError(400, "invalid_body", "Invalid data.");

  const name = asTrimmedString(body.name, 120);
  const type = asTrimmedString(body.type, 60);
  const color = asTrimmedString(body.color, 60);
  const description = asTrimmedString(body.description, 600);
  const imageKey = asTrimmedString(body.imageKey, 500);
  const imageUrl = asTrimmedString(body.imageUrl, 1000);

  if (!name) return jsonError(400, "name_required", "Give the piece a name.");
  if (!type) return jsonError(400, "type_required", "Choose the piece type.");

  const image = imageKey || imageUrl;
  if (!image) return jsonError(400, "image_required", "Add a photo of the piece.");
  if (imageKey && !isOwnedStorageKey(imageKey, userId)) {
    return jsonError(400, "invalid_image_key", "This photo does not belong to your account.");
  }
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    return jsonError(400, "invalid_image_url", "The image URL must start with http:// or https://.");
  }

  try {
    const sql = getDb();
    const rows = (await sql`
      insert into wardrobe_items (clerk_user_id, name, type, color, description, image_url)
      values (${userId}, ${name}, ${type}, ${color}, ${description}, ${image})
      returning id, name, type, color, description, image_url, created_at
    `) as ItemRow[];

    return jsonOk({ item: await withImageUrl(rows[0]) }, 201);
  } catch (error) {
    return databaseErrorResponse(error, "POST /api/items");
  }
}
