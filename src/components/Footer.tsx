import { Send, Facebook, MessageCircle, Mail, Phone, MapPin } from "lucide-react";

const columns = [
  {
    title: "Каталог",
    links: [
      "Ноутбуки",
      "Планшеты",
      "Аксессуары",
      "Компьютерная мебель",
      "Игровые кресла",
      "Игровая техника",
    ],
  },
  {
    title: "Покупателям",
    links: ["Доставка", "Оплата", "Гарантия и возврат", "Trade-in", "Рассрочка", "FAQ"],
  },
  {
    title: "О компании",
    links: ["О нас", "Контакты", "Новости", "Отзывы", "Вакансии", "Документы"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="fy-container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.1fr]">
          <div>
            <div className="text-[19px] font-extrabold tracking-tight">
              FYRIA<span className="text-muted-foreground">.</span>
            </div>
            <p className="mt-3 max-w-[220px] text-[13px] leading-relaxed text-muted-foreground">
              Магазин премиальной техники для работы, игр и жизни.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Send, Facebook, MessageCircle, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Соцсеть"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-[13px] font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-[13px] font-semibold">Контакты</h3>
            <ul className="mt-4 space-y-2.5 text-[13px] text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> +7 747 123 45 67
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> Алматы, Казахстан
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> info@fyria.kz
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© FYRIA, 2024. Все права защищены.</p>
          <div className="flex flex-wrap gap-6">
            <a href="#" className="transition-colors hover:text-foreground">
              Политика конфиденциальности
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Пользовательское соглашение
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
