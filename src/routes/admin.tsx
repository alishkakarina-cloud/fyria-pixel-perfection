import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Общий layout для всех /admin/* — плоская dot-конвенция роутов TanStack
 * делает этот файл родителем для admin.index.tsx, admin.categories.tsx и
 * остальных, поэтому здесь только оболочка с <Outlet />, без собственного
 * содержимого. Первая версия этого файла рендерила список товаров прямо
 * тут без Outlet — из-за этого дочерние страницы (/admin/products/new и
 * другие) молча не отображались, хотя URL и загрузка данных отрабатывали.
 */
export const Route = createFileRoute("/admin")({
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
});
