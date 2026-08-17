import { createFileRoute, notFound } from "@tanstack/react-router";

import { ProductForm } from "@/components/admin/ProductForm";
import { adminListCatalog, adminUpdateProduct } from "@/lib/admin/server";

export const Route = createFileRoute("/admin/products/$slug/edit")({
  loader: async ({ params }) => {
    const catalog = await adminListCatalog();
    const product = catalog.products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { catalog, product };
  },
  component: EditProductPage,
});

function EditProductPage() {
  const { catalog, product } = Route.useLoaderData();

  return (
    <>
      <h1 className="mb-6 text-[20px] font-semibold tracking-tight">Редактировать товар</h1>
      <ProductForm
        categories={catalog.categories}
        initial={product}
        submitLabel="Сохранить"
        onSubmit={async (input) => {
          const { commitSha } = await adminUpdateProduct({ data: { slug: product.slug, input } });
          return { commitSha };
        }}
      />
    </>
  );
}
