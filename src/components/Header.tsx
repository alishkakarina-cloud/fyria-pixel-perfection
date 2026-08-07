import { Link } from "@tanstack/react-router";
import { Menu, Search, Heart, Repeat2, ShoppingCart } from "lucide-react";

const nav = [
  "Ноутбуки",
  "Планшеты",
  "Аксессуары",
  "Компьютерная мебель",
  "Игровые кресла",
  "Игровая техника",
  "Акции",
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="fy-container">
        <div className="flex h-[60px] items-center gap-4">
          <Link to="/" className="text-[19px] font-extrabold tracking-tight">
            FYRIA<span className="text-muted-foreground">.</span>
          </Link>

          <button className="ml-2 hidden h-9 items-center gap-2 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-transform duration-200 hover:scale-[1.02] sm:inline-flex">
            <Menu className="h-4 w-4" />
            Каталог
          </button>

          <div className="relative hidden min-w-0 flex-1 md:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Поиск по товарам..."
              aria-label="Поиск по товарам"
              className="h-9 w-full rounded-lg border border-border bg-muted/60 pl-10 pr-4 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30 focus:bg-background"
            />
          </div>

          <nav className="ml-auto hidden items-center gap-6 lg:flex">
            <button className="flex items-center gap-2 text-[13px] text-foreground/80 transition-colors hover:text-foreground">
              <Heart className="h-4 w-4" /> Избранное
            </button>
            <button className="flex items-center gap-2 text-[13px] text-foreground/80 transition-colors hover:text-foreground">
              <Repeat2 className="h-4 w-4" /> Сравнение
            </button>
            <button className="flex items-center gap-2 text-[13px] text-foreground/80 transition-colors hover:text-foreground">
              <ShoppingCart className="h-4 w-4" /> Корзина
            </button>
          </nav>

          <button className="ml-auto lg:hidden" aria-label="Меню">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="no-scrollbar -mx-1 flex h-[46px] items-center gap-7 overflow-x-auto border-t border-border px-1">
          {nav.map((item) => (
            <a
              key={item}
              href="#catalog"
              className="whitespace-nowrap text-[13px] text-foreground/80 transition-colors hover:text-foreground"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
