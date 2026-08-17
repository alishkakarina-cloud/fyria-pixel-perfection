import type { Catalog } from "./catalog-store";
import type { Category, Product } from "@/lib/products";

const TRANSLIT: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function transliterate(s: string) {
  return s
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("");
}

export function slugify(s: string) {
  return transliterate(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Гарантирует уникальность слага в каталоге, добавляя -2, -3… при коллизии. */
function uniqueSlug(base: string, existing: Set<string>) {
  if (!existing.has(base)) return base;
  let n = 2;
  while (existing.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export type ProductInput = {
  title: string;
  category: string;
  price: number;
  inStock: boolean;
  description: string;
  kaspiUrl?: string;
  images: string[];
  specs: { label: string; value: string }[];
};

export function addProduct(
  catalog: Catalog,
  input: ProductInput,
): { catalog: Catalog; product: Product } {
  const existing = new Set(catalog.products.map((p) => p.slug));
  const slug = uniqueSlug(slugify(input.title) || "tovar", existing);
  const product: Product = {
    slug,
    title: input.title.trim(),
    price: input.price,
    rating: 5,
    reviews: 0,
    category: input.category,
    sku: slug.toUpperCase().slice(0, 24),
    inStock: input.inStock,
    images: input.images,
    description: input.description.trim(),
    specs: input.specs.filter((s) => s.label.trim() && s.value.trim()),
    highlights: input.specs
      .slice(0, 4)
      .filter((s) => s.label.trim() && s.value.trim())
      .map((s) => `${s.label}: ${s.value}`),
    ...(input.kaspiUrl ? { kaspiUrl: input.kaspiUrl.trim() } : {}),
  };
  return { catalog: { ...catalog, products: [...catalog.products, product] }, product };
}

export function updateProduct(
  catalog: Catalog,
  slug: string,
  input: ProductInput,
): { catalog: Catalog; product: Product } {
  const idx = catalog.products.findIndex((p) => p.slug === slug);
  if (idx === -1) throw new Error(`Товар «${slug}» не найден — возможно, его уже удалили.`);
  const prev = catalog.products[idx]!;
  // exactOptionalPropertyTypes запрещает `kaspiUrl: undefined` — либо ключ
  // присутствует со строкой, либо его нет вовсе.
  const { kaspiUrl: _drop, ...prevWithoutKaspiUrl } = prev;
  const product: Product = {
    ...prevWithoutKaspiUrl,
    title: input.title.trim(),
    price: input.price,
    category: input.category,
    inStock: input.inStock,
    images: input.images,
    description: input.description.trim(),
    specs: input.specs.filter((s) => s.label.trim() && s.value.trim()),
    highlights: input.specs
      .slice(0, 4)
      .filter((s) => s.label.trim() && s.value.trim())
      .map((s) => `${s.label}: ${s.value}`),
    ...(input.kaspiUrl ? { kaspiUrl: input.kaspiUrl.trim() } : {}),
  };
  const products = [...catalog.products];
  products[idx] = product;
  return { catalog: { ...catalog, products }, product };
}

export function removeProduct(catalog: Catalog, slug: string): Catalog {
  const exists = catalog.products.some((p) => p.slug === slug);
  if (!exists) throw new Error(`Товар «${slug}» не найден — возможно, его уже удалили.`);
  return { ...catalog, products: catalog.products.filter((p) => p.slug !== slug) };
}

export function addCategory(
  catalog: Catalog,
  name: string,
  image: string,
): { catalog: Catalog; category: Category } {
  const existingSlugs = new Set(catalog.categories.map((c) => c.slug));
  if (catalog.categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
    throw new Error(`Категория «${name}» уже существует.`);
  }
  const slug = uniqueSlug(slugify(name) || "category", existingSlugs);
  const category: Category = { slug, name: name.trim(), image };
  return { catalog: { ...catalog, categories: [...catalog.categories, category] }, category };
}

export function renameCategory(
  catalog: Catalog,
  slug: string,
  name: string,
  image?: string,
): Catalog {
  const idx = catalog.categories.findIndex((c) => c.slug === slug);
  if (idx === -1) throw new Error(`Категория «${slug}» не найдена.`);
  const prev = catalog.categories[idx]!;
  const oldName = prev.name;
  const categories = [...catalog.categories];
  categories[idx] = { ...prev, name: name.trim(), ...(image ? { image } : {}) };
  // Переименование категории должно обновить ссылку у всех её товаров —
  // связь "товар → категория" хранится по имени, а не по слагу.
  const products = catalog.products.map((p) =>
    p.category === oldName ? { ...p, category: name.trim() } : p,
  );
  return { ...catalog, categories, products };
}

/**
 * Удаляет категорию. Бросает ошибку, если в ней остались товары — админ
 * должен сначала перенести или удалить их сам, чтобы товары никогда не
 * пропадали "молча" вместе с категорией.
 */
export function removeCategory(catalog: Catalog, slug: string): Catalog {
  const category = catalog.categories.find((c) => c.slug === slug);
  if (!category) throw new Error(`Категория «${slug}» не найдена.`);
  const count = catalog.products.filter((p) => p.category === category.name).length;
  if (count > 0) {
    throw new Error(
      `В категории «${category.name}» ещё ${count} ${count === 1 ? "товар" : "товара(-ов)"}. ` +
        `Сначала перенесите их в другую категорию или удалите, потом можно будет удалить и саму категорию.`,
    );
  }
  return { ...catalog, categories: catalog.categories.filter((c) => c.slug !== slug) };
}
