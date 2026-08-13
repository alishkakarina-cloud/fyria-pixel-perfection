import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ChevronRight,
  Star,
  CheckCircle2,
  ShieldCheck,
  BatteryCharging,
  Feather,
  Volume2,
  Cpu,
  ArrowRight,
} from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PriceBlock, PurchaseButtons, PurchasePanel } from "@/components/PurchasePanel";
import { formatPrice, getProduct, similar, type Product } from "@/lib/products";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.title} — купить в FYRIA` },
          { name: "description", content: loaderData.product.description.slice(0, 155) },
          { property: "og:title", content: `${loaderData.product.title} — FYRIA` },
          { property: "og:description", content: loaderData.product.description.slice(0, 155) },
          { property: "og:type", content: "product" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [],
  }),
  component: ProductPage,
});

const highlightIcons = [BatteryCharging, Feather, Volume2, Cpu];

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [active, setActive] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="fy-container pb-16 pt-5">
        {/* breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Главная
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>Каталог</span>
          <ChevronRight className="h-3 w-3" />
          <span>{product.category}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.title}</span>
        </nav>

        <h1 className="mt-4 text-[24px] font-semibold tracking-tight">{product.title}</h1>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.45fr_0.95fr] xl:grid-cols-[1.55fr_0.85fr_0.8fr]">
          {/* gallery */}
          <div className="fy-fade-up flex gap-4">
            <div className="flex w-[62px] shrink-0 flex-col gap-2.5">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Фото ${i + 1}`}
                  className={`aspect-square overflow-hidden rounded-lg border bg-surface p-1.5 transition-all duration-200 ${
                    active === i ? "border-foreground/60" : "border-border hover:border-foreground/30"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    width={640}
                    height={640}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden rounded-xl border border-border bg-surface p-8">
              <img
                src={product.images[active]}
                alt={product.title}
                width={640}
                height={640}
                className="mx-auto h-full max-h-[380px] w-full object-contain transition-transform duration-500 hover:scale-[1.03]"
              />
            </div>
          </div>

          {/* info + purchase panel #1 */}
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[11.5px] text-foreground/80">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                {product.inStock ? "В наличии" : "Под заказ"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[11.5px] text-foreground/80">
                <ShieldCheck className="h-3.5 w-3.5" />
                Официальная гарантия
              </span>
            </div>

            <h2 className="mt-4 text-[17px] font-semibold leading-snug tracking-tight">
              {product.title}
            </h2>

            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-star text-star" />
              <span className="text-foreground">{product.rating}</span>
              <span>({product.reviews} отзывов)</span>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">Артикул: {product.sku}</p>

            <div className="mt-5">
              <PriceBlock product={product} />
            </div>

            <PurchaseButtons className="mt-6 max-w-[320px]" product={product} />
          </div>

          {/* specs */}
          <aside className="h-fit rounded-xl border border-border p-5 lg:col-span-2 xl:col-span-1">
            <h3 className="text-[13px] font-semibold">Характеристики</h3>
            <dl className="mt-4 space-y-3">
              {product.specs.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-4">
                  <dt className="text-[12px] text-muted-foreground">{s.label}</dt>
                  <dd className="text-right text-[12px]">{s.value}</dd>
                </div>
              ))}
            </dl>
            <a
              href="#description"
              className="group mt-5 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Все характеристики
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </aside>
        </div>

        {/* description */}
        <section id="description" className="mt-12">
          <h2 className="text-[15px] font-semibold tracking-tight">Описание</h2>
          <p className="mt-3 max-w-[900px] text-[12.5px] leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </section>

        <div className="mt-8 grid grid-cols-1 divide-y divide-border rounded-xl border border-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {product.highlights.map((h, i) => {
            const Icon = highlightIcons[i % highlightIcons.length]!;
            return (
              <div key={h} className="flex items-center gap-3 px-5 py-4">
                <Icon className="h-4 w-4 shrink-0 text-foreground/60" />
                <span className="text-[12px]">{h}</span>
              </div>
            );
          })}
        </div>

        {/* purchase panel #2 */}
        <div className="mt-8">
          <PurchasePanel product={product} />
        </div>

        {/* similar */}
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-[16px] font-semibold tracking-tight">Похожие товары</h2>
            <Link
              to="/"
              className="group flex items-center gap-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Смотреть все
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-1">
            {similar.map((s) => (
              <article
                key={s.title}
                className="group w-[190px] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-hover"
              >
                <div className="aspect-4/3 bg-surface p-4">
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    width={640}
                    height={480}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                </div>
                <div className="border-t border-border p-3.5">
                  <h3 className="line-clamp-1 text-[12px]">{s.title}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[13px] font-semibold">{formatPrice(s.price)}</span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Star className="h-3 w-3 fill-star text-star" />
                      {s.rating}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* newsletter */}
        <section className="mt-12 overflow-hidden rounded-2xl bg-ink px-8 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-white">Будьте в курсе новинок и акций</h2>
              <p className="mt-2 text-[12.5px] text-white/55">
                Подпишитесь и получайте лучшие предложения первыми
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full gap-2.5 sm:w-auto lg:w-[520px]"
            >
              <input
                type="email"
                required
                placeholder="Ваш e-mail"
                aria-label="Ваш e-mail"
                className="h-11 flex-1 rounded-lg bg-white px-4 text-[13px] text-ink outline-none placeholder:text-muted-foreground"
              />
              <button className="h-11 shrink-0 rounded-lg border border-white/25 px-6 text-[13px] font-medium text-white transition-colors hover:bg-white/10">
                Подписаться
              </button>
            </form>
          </div>
        </section>

        {/* mobile sticky purchase */}
        <div className="fixed inset-x-0 bottom-0 z-50 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
          <PurchaseButtons className="grid w-full grid-cols-2 gap-2 [&>a]:mt-0" product={product} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

