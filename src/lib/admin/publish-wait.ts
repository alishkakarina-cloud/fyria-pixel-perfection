import { toast } from "sonner";
import { adminCheckDeployment } from "./server";

const POLL_MS = 8000;
const MAX_POLLS = 15; // ~2 минуты — дольше автосборка обычно не идёт

/**
 * После сохранения правки опрашивает статус деплоя коммита на Vercel и
 * заменяет промежуточный тост на "Опубликовано" — чтобы человек без
 * технического опыта видел, что изменение реально дошло до сайта, а не
 * просто гадал, сработало ли.
 */
export async function waitForPublish(commitSha: string | null) {
  if (!commitSha) return; // локальная разработка — коммита не было, ждать нечего
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    try {
      const { state } = await adminCheckDeployment({ data: { commitSha } });
      if (state === "success") {
        toast.success("Опубликовано на сайте ✓");
        return;
      }
      if (state === "error" || state === "failure") {
        toast.error("Сборка на Vercel завершилась с ошибкой — изменение не опубликовано.");
        return;
      }
    } catch {
      // сеть моргнула — попробуем на следующем цикле опроса
    }
  }
}
