import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getCategory, getCategoryCount, getCategoryProducts, type Product } from "@/lib/products";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category, items: getCategoryProducts(params.slug) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.name} — купить в FYRIA` },
          {
            name: "description",
            content: `${loaderData.category.name} в FYRIA: ${loaderData.items.length} товаров, официальная гарантия, оплата и рассрочка через Kaspi.`,
          },
          { property: "og:title", content: `${loaderData.category.name} — FYRIA` },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { category, items } = Route.useLoaderData() as {
    category: { name: string };
    items: Product[];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="fy-container pb-16 pt-5">
        <nav className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Главная
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>Каталог</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{category.name}</span>
        </nav>

        <div className="mt-4 mb-5 flex items-end justify-between">
          <h1 className="text-[24px] font-semibold tracking-tight">{category.name}</h1>
          <span className="text-[12.5px] text-muted-foreground">{getCategoryCount(slug)}</span>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
            <p className="text-[13px] text-muted-foreground">В этой категории пока нет товаров.</p>
            <Link
              to="/"
              className="mt-5 inline-flex h-11 items-center rounded-lg bg-primary px-6 text-[13px] font-medium text-primary-foreground transition-transform duration-200 hover:scale-[1.02]"
            >
              Вернуться в каталог
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
