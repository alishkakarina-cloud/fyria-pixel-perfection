import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { Category } from "@/lib/products";
import {
  adminListCatalog,
  adminCreateCategory,
  adminRenameCategory,
  adminDeleteCategory,
  adminUploadCategoryImage,
} from "@/lib/admin/server";
import { processImageFile } from "@/lib/admin/image-client";
import { waitForPublish } from "@/lib/admin/publish-wait";

export const Route = createFileRoute("/admin/categories")({
  loader: () => adminListCatalog(),
  component: AdminCategoriesPage,
});

function countByCategory(catalog: { products: { category: string }[] }, name: string) {
  return catalog.products.filter((p) => p.category === name).length;
}

function AdminCategoriesPage() {
  const catalog = Route.useLoaderData();
  const router = useRouter();

  const [newName, setNewName] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [blockedDeleteMessage, setBlockedDeleteMessage] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Укажите название категории");
      return;
    }
    if (!newFile) {
      toast.error("Выберите изображение для категории");
      return;
    }
    setCreating(true);
    try {
      const { base64, ext } = await processImageFile(newFile);
      const { path } = await adminUploadCategoryImage({
        data: { slug: newName, ext, base64 },
      });
      const { commitSha } = await adminCreateCategory({
        data: { name: newName.trim(), image: path },
      });
      toast.success("Категория добавлена. Сайт обновится через 1–2 минуты…");
      setNewName("");
      setNewFile(null);
      void router.invalidate();
      void waitForPublish(commitSha);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось создать категорию");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(c: Category) {
    setEditingSlug(c.slug);
    setEditName(c.name);
  }

  async function saveEdit(c: Category) {
    if (!editName.trim()) {
      toast.error("Название не может быть пустым");
      return;
    }
    setSavingEdit(true);
    try {
      const { commitSha } = await adminRenameCategory({
        data: { slug: c.slug, name: editName.trim() },
      });
      toast.success("Переименовано. Сайт обновится через 1–2 минуты…");
      setEditingSlug(null);
      void router.invalidate();
      void waitForPublish(commitSha);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось переименовать категорию");
    } finally {
      setSavingEdit(false);
    }
  }

  function askDelete(c: Category) {
    const count = countByCategory(catalog, c.name);
    if (count > 0) {
      setBlockedDeleteMessage(
        `В категории «${c.name}» ещё ${count} ${
          count === 1 ? "товар" : "товара(-ов)"
        }. Сначала перенесите их в другую категорию или удалите — молча удалять товары вместе с категорией нельзя.`,
      );
      return;
    }
    setPendingDelete(c);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const { commitSha } = await adminDeleteCategory({
        data: { slug: pendingDelete.slug, name: pendingDelete.name },
      });
      toast.success("Категория удалена. Сайт обновится через 1–2 минуты…");
      setPendingDelete(null);
      void router.invalidate();
      void waitForPublish(commitSha);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось удалить категорию");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <h1 className="mb-6 text-[20px] font-semibold tracking-tight">Категории</h1>

      <div className="mb-8 overflow-hidden rounded-lg border border-border bg-background">
        <table className="w-full text-[13px]">
          <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="w-16 px-4 py-3 font-medium"></th>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Товаров</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {catalog.categories.map((c) => (
              <tr key={c.slug} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-2.5">
                  <img
                    src={c.image}
                    alt=""
                    className="h-10 w-10 rounded-md border border-border bg-white object-contain"
                  />
                </td>
                <td className="px-4 py-2.5">
                  {editingSlug === c.slug ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 max-w-[260px]"
                      autoFocus
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {countByCategory(catalog, c.name)}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end gap-1">
                    {editingSlug === c.slug ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={savingEdit}
                          onClick={() => void saveEdit(c)}
                        >
                          {savingEdit ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={savingEdit}
                          onClick={() => setEditingSlug(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => startEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => askDelete(c)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={handleCreate}
        className="max-w-md space-y-4 rounded-lg border border-border bg-background p-5"
      >
        <h2 className="text-[14px] font-semibold">Новая категория</h2>
        <div className="space-y-1.5">
          <Label htmlFor="cat-name">Название</Label>
          <Input
            id="cat-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Например, «Клавиатуры»"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-image">Изображение</Label>
          <Input
            id="cat-image"
            type="file"
            accept="image/*"
            onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button type="submit" disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Создать категорию
        </Button>
      </form>

      <AlertDialog
        open={!!blockedDeleteMessage}
        onOpenChange={(open) => !open && setBlockedDeleteMessage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Нельзя удалить — есть товары</AlertDialogTitle>
            <AlertDialogDescription>{blockedDeleteMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBlockedDeleteMessage(null)}>
              Понятно
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
            <AlertDialogDescription>
              «{pendingDelete?.name}» пропадёт из каталога и меню категорий после следующей сборки
              (1–2 минуты). В ней сейчас нет товаров.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Да, удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
