import { createServerFn } from "@tanstack/react-start";
import { loadCatalog, saveCatalog, saveImage, getDeploymentStatus } from "./catalog-store";
import {
  addProduct,
  updateProduct,
  removeProduct,
  addCategory,
  renameCategory,
  removeCategory,
  slugify,
  type ProductInput,
} from "./catalog-ops";

export const adminListCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { catalog } = await loadCatalog();
  return catalog;
});

export const adminCreateProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as ProductInput)
  .handler(async ({ data }) => {
    const { catalog, sha } = await loadCatalog();
    const { catalog: next, product } = addProduct(catalog, data);
    const { commitSha } = await saveCatalog(next, sha, `добавлен товар «${product.title}»`);
    return { product, commitSha };
  });

export const adminUpdateProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { slug: string; input: ProductInput })
  .handler(async ({ data }) => {
    const { catalog, sha } = await loadCatalog();
    const { catalog: next, product } = updateProduct(catalog, data.slug, data.input);
    const { commitSha } = await saveCatalog(next, sha, `изменён товар «${product.title}»`);
    return { product, commitSha };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { slug: string; title: string })
  .handler(async ({ data }) => {
    const { catalog, sha } = await loadCatalog();
    const next = removeProduct(catalog, data.slug);
    const { commitSha } = await saveCatalog(next, sha, `удалён товар «${data.title}»`);
    return { commitSha };
  });

export const adminCreateCategory = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { name: string; image: string })
  .handler(async ({ data }) => {
    const { catalog, sha } = await loadCatalog();
    const { catalog: next, category } = addCategory(catalog, data.name, data.image);
    const { commitSha } = await saveCatalog(next, sha, `добавлена категория «${category.name}»`);
    return { category, commitSha };
  });

export const adminRenameCategory = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { slug: string; name: string; image?: string })
  .handler(async ({ data }) => {
    const { catalog, sha } = await loadCatalog();
    const next = renameCategory(catalog, data.slug, data.name, data.image);
    const { commitSha } = await saveCatalog(next, sha, `переименована категория в «${data.name}»`);
    return { commitSha };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { slug: string; name: string })
  .handler(async ({ data }) => {
    const { catalog, sha } = await loadCatalog();
    const next = removeCategory(catalog, data.slug);
    const { commitSha } = await saveCatalog(next, sha, `удалена категория «${data.name}»`);
    return { commitSha };
  });

/** Принимает изображение как base64 (без data:-префикса), коммитит и возвращает публичный путь. */
export const adminUploadImage = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) => data as { slug: string; index: number; ext: string; base64: string },
  )
  .handler(async ({ data }) => {
    const safeSlug = slugify(data.slug) || "image";
    const publicPath = `/products/${safeSlug}-${data.index}.${data.ext}`;
    await saveImage(publicPath, data.base64, `загружено фото для «${data.slug}»`);
    return { path: publicPath };
  });

/** То же самое, но для иконки категории — другой путь в public/categories/. */
export const adminUploadCategoryImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { slug: string; ext: string; base64: string })
  .handler(async ({ data }) => {
    const safeSlug = slugify(data.slug) || "category";
    const publicPath = `/categories/${safeSlug}.${data.ext}`;
    await saveImage(publicPath, data.base64, `загружена иконка категории «${data.slug}»`);
    return { path: publicPath };
  });

/** Для баннера "опубликовано" — опрашивается с клиента после сохранения. */
export const adminCheckDeployment = createServerFn({ method: "GET" })
  .validator((data: unknown) => data as { commitSha: string | null })
  .handler(async ({ data }) => {
    if (!data.commitSha) return { state: "local" as const };
    const state = await getDeploymentStatus(data.commitSha);
    return { state };
  });
