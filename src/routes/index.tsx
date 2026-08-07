import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Settings2,
  Truck,
  CreditCard,
  ArrowRight,
  CalendarClock,
  RefreshCw,
  Undo2,
  Headphones,
  MessageCircle,
} from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { categories, products, WHATSAPP_URL } from "@/lib/products";
import heroVideo from "@/assets/hero-laptop.mp4.asset.json";
import heroPoster from "@/assets/hero-poster.jpg";
import bannerWorkspace from "@/assets/banner-workspace.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FYRIA — премиальная техника: ноутбуки, планшеты, аксессуары" },
      {
        name: "description",
        content:
          "FYRIA — магазин премиальной техники в Казахстане: ноутбуки, планшеты, аксессуары, игровые кресла и мебель. Рассрочка Kaspi, гарантия и быстрая доставка.",
      },
      { property: "og:title", content: "FYRIA — премиальная техника для работы и игр" },
      {
        property: "og:description",
        content:
          "Премиальные ноутбуки, планшеты и аксессуары для работы, игр и вдохновения. Официальные поставки, гарантия, доставка по Казахстану.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const advantages = [
  { icon: ShieldCheck, title: "Оригинальная техника", text: "Только официальные поставки" },
  { icon: Settings2, title: "Гарантия и сервис", text: "Поддержка после покупки" },
  { icon: Truck, title: "Быстрая доставка", text: "По всему Казахстану" },
  { icon: CreditCard, title: "Удобная оплата", text: "Kaspi и другие способы" },
];

const services = [
  { icon: CalendarClock, title: "Рассрочка 0-0-12", text: "Через Kaspi и Halyk" },
  { icon: RefreshCw, title: "Trade-in", text: "Выгодный обмен старой техники" },
  { icon: Undo2, title: "14 дней на возврат", text: "Если товар не подошёл" },
  { icon: Headphones, title: "Поддержка 24/7", text: "Мы всегда на связи" },
];

function SectionHead({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="text-[20px] font-semibold tracking-tight">{title}</h2>
      <a
        href="#catalog"
        className="group flex items-center gap-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        Смотреть все
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}

function Strip({ items }: { items: typeof advantages }) {
  return (
    <div className="grid grid-cols-1 divide-y divide-border rounded-xl border border-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
      {items.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex items-center gap-3 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-4 w-4 text-foreground/70" />
          </span>
          <div>
            <div className="text-[12.5px] font-semibold">{title}</div>
            <div className="text-[11.5px] text-muted-foreground">{text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* HERO */}
        <section className="fy-container pt-6">
          <div className="fy-fade-up relative overflow-hidden rounded-2xl bg-ink">
            <div className="absolute inset-y-0 right-0 w-full lg:w-[62%]">
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={heroPoster}
              >
                <source src={heroVideo.url} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/70 to-ink/10 lg:via-ink/40 lg:to-transparent" />
            </div>

            <div className="relative flex min-h-[400px] flex-col justify-center px-6 py-14 sm:px-10 lg:min-h-[460px] lg:max-w-[54%] lg:px-12">
              <span className="w-fit rounded-md bg-white/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/90">
                Новинка
              </span>
              <h1 className="mt-5 text-[34px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[44px]">
                Техника будущего
                <br />
                <span className="text-white/55">уже сегодня</span>
              </h1>
              <p className="mt-5 max-w-[380px] text-[13.5px] leading-relaxed text-white/65">
                Премиальные ноутбуки, планшеты и аксессуары для работы, игр и вдохновения.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#catalog"
                  className="inline-flex h-11 items-center rounded-lg bg-white px-6 text-[13px] font-medium text-ink transition-transform duration-200 hover:scale-[1.02]"
                >
                  Перейти в каталог
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/25 px-6 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
                >
                  <MessageCircle className="h-4 w-4" />
                  Написать в WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="fy-container pt-4">
          <Strip items={advantages} />
        </section>

        {/* CATEGORIES */}
        <section className="fy-container pt-12" id="catalog">
          <SectionHead title="Популярные категории" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <a
                key={c.name}
                href="#catalog"
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-hover"
              >
                <div className="aspect-square bg-surface p-6">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    width={640}
                    height={640}
                    className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                </div>
                <div className="border-t border-border px-4 py-3">
                  <div className="text-[12.5px] font-semibold">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">{c.count}</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* BEST SELLERS */}
        <section className="fy-container pt-12">
          <SectionHead title="Хиты продаж" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>

        {/* BANNER */}
        <section className="fy-container pt-12">
          <div className="relative overflow-hidden rounded-2xl bg-ink">
            <img
              src={bannerWorkspace}
              alt="Премиальное рабочее место"
              loading="lazy"
              width={1600}
              height={560}
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/80 to-transparent" />
            <div className="relative flex min-h-[240px] flex-col justify-center px-8 py-12 sm:px-12">
              <h2 className="max-w-[420px] text-[24px] font-semibold leading-tight tracking-tight text-white sm:text-[28px]">
                Соберите идеальное рабочее место
              </h2>
              <p className="mt-3 text-[13px] text-white/60">
                Подберите технику и аксессуары со скидкой до 20%
              </p>
              <a
                href="#catalog"
                className="mt-7 inline-flex h-11 w-fit items-center rounded-lg bg-white px-6 text-[13px] font-medium text-ink transition-transform duration-200 hover:scale-[1.02]"
              >
                Смотреть подборки
              </a>
            </div>
          </div>
        </section>

        <section className="fy-container py-12">
          <Strip items={services} />
        </section>

      </main>

      <Footer />
    </div>
  );
}
