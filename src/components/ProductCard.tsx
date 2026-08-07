import { Link } from "@tanstack/react-router";
import { ShoppingBag, Star } from "lucide-react";
import { formatPrice, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-hover"
    >
      <div className="relative aspect-square overflow-hidden bg-surface p-5">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          width={640}
          height={640}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.05]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t border-border p-4">
        <h3 className="line-clamp-2 min-h-[34px] text-[12.5px] leading-[1.35] text-foreground">
          {product.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-[15px] font-semibold tracking-tight">
            {formatPrice(product.price)}
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
            <ShoppingBag className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star className="h-3 w-3 fill-star text-star" />
          {product.rating}
          <span className="ml-1">· В наличии</span>
        </div>
      </div>
    </Link>
  );
}
