import type { Product, ProductCategory } from "./products";

/** Headings exactly as the existing /products page already used them. */
export const CATALOGUE_GROUPS: { category: ProductCategory; heading: string }[] = [
  { category: "tractors", heading: "Our Tractors" },
  { category: "harvesters", heading: "Our Harvesters" },
  { category: "implements", heading: "Farm Implements" },
];

export const productPath = (slug: string) => `/products/${slug}`;

export function groupProducts<T extends Pick<Product, "category">>(list: T[]) {
  return CATALOGUE_GROUPS.map((g) => ({ ...g, items: list.filter((p) => p.category === g.category) }));
}
