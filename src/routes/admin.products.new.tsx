import { createFileRoute } from "@tanstack/react-router";

import { ProductForm } from "@/components/admin/ProductForm";
import { adminListCatalog, adminCreateProduct } from "@/lib/admin/server";

export const Route = createFileRoute("/admin/products/new")({
  loader: () => adminListCatalog(),
  component: NewProductPage,
});

function NewProductPage() {
  const catalog = Route.useLoaderData();

  return (
    <>
      <h1 className="mb-6 text-[20px] font-semibold tracking-tight">Новый товар</h1>
      <ProductForm
        categories={catalog.categories}
        submitLabel="Добавить товар"
        onSubmit={async (input) => {
          const { commitSha } = await adminCreateProduct({ data: input });
          return { commitSha };
        }}
      />
    </>
  );
}
