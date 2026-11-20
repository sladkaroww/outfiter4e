/** Clothing categories used by the wardrobe form and the AI identifier. */
export const CLOTHING_TYPES = [
  "T-shirt",
  "Shirt",
  "Outerwear",
  "Jeans",
  "Trousers",
  "Dress",
  "Shoes",
  "Accessory",
  "Other",
] as const;

export type ClothingType = (typeof CLOTHING_TYPES)[number];

export function isClothingType(value: string): value is ClothingType {
  return (CLOTHING_TYPES as readonly string[]).includes(value);
}

/** Types accepted by the image upload endpoints. */
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
