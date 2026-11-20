import { auth } from "@clerk/nextjs/server";
import {
  asTrimmedString,
  databaseErrorResponse,
  jsonError,
  jsonOk,
  readJsonBody,
} from "@/lib/api";
import { getAuthors } from "@/lib/authors";
import { DEFAULT_POST_CATEGORY, isPostCategory } from "@/lib/categories";
import { getDb } from "@/lib/db";
import { isOwnedStorageKey, resolveImageUrl } from "@/lib/storage";

const FEED_LIMIT = 50;
const MAX_TAGGED_ITEMS = 8;

type PostItem = { id: string; name: string; type: string };

type FeedRow = {
  id: string;
  title: string;
  category: string;
  location: string;
  image_url: string;
  created_at: string | Date;
  clerk_user_id: string;
  likes: number;
  liked: boolean;
  owned: boolean;
  items: PostItem[];
};

function toIso(value: string | Date) {
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function GET() {
  const { userId } = await auth();

  try {
    const sql = getDb();
    // Sub-selects keep like counting independent of the item join: joining both
    // in one FROM clause multiplies rows and inflates the like counter.
    const rows = (await sql`
      select
        p.id,
        p.title,
        p.category,
        p.location,
        p.image_url,
        p.created_at,
        p.clerk_user_id,
        (select count(*)::int from outfit_likes l where l.post_id = p.id) as likes,
        exists (
          select 1 from outfit_likes l
          where l.post_id = p.id and l.clerk_user_id = ${userId ?? null}
        ) as liked,
        (p.clerk_user_id = ${userId ?? null}) as owned,
        coalesce((
          select json_agg(json_build_object('id', i.id, 'name', i.name, 'type', i.type) order by i.name)
          from outfit_post_items pi
          join wardrobe_items i on i.id = pi.item_id
          where pi.post_id = p.id
        ), '[]'::json) as items
      from outfit_posts p
      order by p.created_at desc
      limit ${FEED_LIMIT}
    `) as FeedRow[];

    const authors = await getAuthors(rows.map((row) => row.clerk_user_id));

    const posts = await Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        location: row.location,
        image_url: await resolveImageUrl(row.image_url),
        created_at: toIso(row.created_at),
        likes: Number(row.likes ?? 0),
        liked: Boolean(row.liked),
        owned: Boolean(row.owned),
        items: row.items ?? [],
        author: authors.get(row.clerk_user_id) ?? null,
      })),
    );

    return jsonOk({ posts });
  } catch (error) {
    return databaseErrorResponse(error, "GET /api/feed");
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return jsonError(401, "unauthorized", "You need to sign in.");

  const body = await readJsonBody(request);
  if (!body) return jsonError(400, "invalid_body", "Invalid data.");

  const title = asTrimmedString(body.title, 120);
  const location = asTrimmedString(body.location, 120);
  const imageKey = asTrimmedString(body.imageKey, 500);
  const imageUrl = asTrimmedString(body.imageUrl, 1000);
  const rawCategory = asTrimmedString(body.category, 40);
  const category = isPostCategory(rawCategory) ? rawCategory : DEFAULT_POST_CATEGORY;

  if (!title) return jsonError(400, "title_required", "Give the outfit a title.");

  const image = imageKey || imageUrl;
  if (!image) return jsonError(400, "image_required", "Add a photo of the outfit.");
  if (imageKey && !isOwnedStorageKey(imageKey, userId)) {
    return jsonError(400, "invalid_image_key", "This photo does not belong to your account.");
  }
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    return jsonError(400, "invalid_image_url", "The image URL must start with http:// or https://.");
  }

  const itemIds = Array.isArray(body.itemIds)
    ? body.itemIds
        .filter((value): value is string => typeof value === "string")
        .filter((value) => /^[0-9a-f-]{36}$/i.test(value))
        .slice(0, MAX_TAGGED_ITEMS)
    : [];
  const taggedItemsJson = JSON.stringify(itemIds);

  try {
    const sql = getDb();
    // One statement: the post and its item links are written together, so a
    // partially tagged post can never be committed. The join on
    // clerk_user_id also prevents tagging somebody else's wardrobe items.
    const rows = (await sql`
      with new_post as (
        insert into outfit_posts (clerk_user_id, title, category, image_url, location)
        values (${userId}, ${title}, ${category}, ${image}, ${location})
        returning id, title, category, location, image_url, created_at, clerk_user_id
      ), linked as (
        insert into outfit_post_items (post_id, item_id)
        select np.id, wi.id
        from new_post np
        join wardrobe_items wi
          on wi.clerk_user_id = ${userId}
         and wi.id in (select value::uuid from jsonb_array_elements_text(${taggedItemsJson}::jsonb))
        on conflict do nothing
        returning post_id
      )
      select * from new_post
    `) as Array<{
      id: string;
      title: string;
      category: string;
      location: string;
      image_url: string;
      created_at: string | Date;
      clerk_user_id: string;
    }>;

    const post = rows[0];
    const items = (await sql`
      select i.id, i.name, i.type
      from outfit_post_items pi
      join wardrobe_items i on i.id = pi.item_id
      where pi.post_id = ${post.id}
      order by i.name
    `) as PostItem[];

    const authors = await getAuthors([post.clerk_user_id]);

    return jsonOk(
      {
        post: {
          id: post.id,
          title: post.title,
          category: post.category,
          location: post.location,
          image_url: await resolveImageUrl(post.image_url),
          created_at: toIso(post.created_at),
          likes: 0,
          liked: false,
          owned: true,
          items,
          author: authors.get(post.clerk_user_id) ?? null,
        },
      },
      201,
    );
  } catch (error) {
    return databaseErrorResponse(error, "POST /api/feed");
  }
}
