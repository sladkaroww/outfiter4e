/** Categories shared by the upload form, the API and the feed filters. */
export const POST_CATEGORIES = ["Everyday", "Work", "Evening", "Sport"] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export const DEFAULT_POST_CATEGORY: PostCategory = "Everyday";

export function isPostCategory(value: string): value is PostCategory {
  return (POST_CATEGORIES as readonly string[]).includes(value);
}
