import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

/**
 * Утилитарная оболочка для /admin — намеренно не повторяет дизайн публичной
 * витрины (тёмный хиро, крупная типографика и т.д.), чтобы визуально не
 * путаться с ней и не тянуть за собой Header/Footer, где /admin не должен
 * появляться в навигации для покупателей.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster position="top-center" richColors />
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
          <span className="text-[15px] font-semibold tracking-tight">FYRIA · Админка</span>
          <nav className="flex items-center gap-4 text-[13px]">
            <Link
              to="/admin"
              className="text-foreground/70 transition-colors hover:text-foreground [&.active]:text-foreground [&.active]:font-medium"
              activeOptions={{ exact: true }}
            >
              Товары
            </Link>
            <Link
              to="/admin/categories"
              className="text-foreground/70 transition-colors hover:text-foreground [&.active]:text-foreground [&.active]:font-medium"
            >
              Категории
            </Link>
          </nav>
          <a
            href="/"
            className="ml-auto text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← На сайт
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
