import { MessageCircle } from "lucide-react";
import {
  CONSULT_WHATSAPP_URL,
  formatPrice,
  KASPI_URL,
  WHATSAPP_URL,
  type Product,
} from "@/lib/products";

/**
 * У товаров из выгрузки Kaspi кнопки ведут на конкретную карточку продавца
 * и на WhatsApp для консультации. Витринные товары сохраняют прежние ссылки
 * и подписи — их страницы не должны меняться.
 */
function buyLinks(product?: Product) {
  return product?.kaspiUrl
    ? {
        kaspiHref: product.kaspiUrl,
        kaspiLabel: "Купить в Kaspi Магазине",
        waHref: CONSULT_WHATSAPP_URL,
        waLabel: "Для консультации",
        rel: "noopener noreferrer",
      }
    : {
        kaspiHref: KASPI_URL,
        kaspiLabel: "Купить на Kaspi",
        waHref: WHATSAPP_URL,
        waLabel: "Написать в WhatsApp",
        rel: "noreferrer",
      };
}

export function PriceBlock({ product }: { product: Product }) {
  return (
    <div className="flex flex-wrap items-baseline gap-3">
      <span className="text-[26px] font-semibold tracking-tight">{formatPrice(product.price)}</span>
      {product.oldPrice && (
        <span className="text-[13px] text-muted-foreground line-through">
          {formatPrice(product.oldPrice)}
        </span>
      )}
      {product.discount && (
        <span className="rounded-md bg-sale px-1.5 py-0.5 text-[11px] font-semibold text-sale-foreground">
          -{product.discount}%
        </span>
      )}
    </div>
  );
}

export function PurchaseButtons({
  className = "",
  product,
}: {
  className?: string;
  product?: Product;
}) {
  const { kaspiHref, kaspiLabel, waHref, waLabel, rel } = buyLinks(product);
  return (
    <div className={className}>
      <a
        href={kaspiHref}
        target="_blank"
        rel={rel}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[13px] font-medium text-primary-foreground transition-transform duration-200 hover:scale-[1.01]"
      >
        {kaspiLabel}
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
          K
        </span>
      </a>
      <a
        href={waHref}
        target="_blank"
        rel={rel}
        className="mt-2.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border px-6 text-[13px] font-medium transition-colors hover:bg-muted"
      >
        <MessageCircle className="h-4 w-4" />
        {waLabel}
      </a>
    </div>
  );
}

/** Second purchase panel — identical content, laid out horizontally. */
export function PurchasePanel({ product }: { product: Product }) {
  const { kaspiHref, kaspiLabel, waHref, waLabel, rel } = buyLinks(product);
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h3 className="text-[14px] font-semibold tracking-tight">{product.title}</h3>
        <div className="mt-2">
          <PriceBlock product={product} />
        </div>
      </div>
      <div className="flex flex-col gap-2.5 sm:flex-row lg:w-[420px]">
        <a
          href={kaspiHref}
          target="_blank"
          rel={rel}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[13px] font-medium text-primary-foreground transition-transform duration-200 hover:scale-[1.01]"
        >
          {kaspiLabel}
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            K
          </span>
        </a>
        <a
          href={waHref}
          target="_blank"
          rel={rel}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-[13px] font-medium transition-colors hover:bg-muted"
        >
          <MessageCircle className="h-4 w-4" />
          {waLabel}
        </a>
      </div>
    </div>
  );
}
