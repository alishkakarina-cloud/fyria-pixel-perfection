import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Trash2, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Category, Product } from "@/lib/products";
import type { ProductInput } from "@/lib/admin/catalog-ops";
import { slugify } from "@/lib/admin/catalog-ops";
import { processImageFile } from "@/lib/admin/image-client";
import { adminUploadImage } from "@/lib/admin/server";
import { waitForPublish } from "@/lib/admin/publish-wait";

type Spec = { label: string; value: string };

export function ProductForm({
  categories,
  initial,
  onSubmit,
  submitLabel,
}: {
  categories: Category[];
  initial?: Product;
  onSubmit: (input: ProductInput) => Promise<{ commitSha: string | null }>;
  submitLabel: string;
}) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? categories[0]?.name ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [kaspiUrl, setKaspiUrl] = useState(initial?.kaspiUrl ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [specs, setSpecs] = useState<Spec[]>(
    initial?.specs.length ? initial.specs : [{ label: "", value: "" }],
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const slugBase = initial?.slug ?? (slugify(title) || "tovar");

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`«${file.name}» — не изображение, пропущено`);
          continue;
        }
        const { base64, ext } = await processImageFile(file);
        const index = images.length + 1;
        const { path } = await adminUploadImage({
          data: { slug: slugBase, index, ext, base64 },
        });
        setImages((prev) => [...prev, path]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateSpec(i: number, field: "label" | "value", val: string) {
    setSpecs((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  }
  function addSpecRow() {
    setSpecs((prev) => [...prev, { label: "", value: "" }]);
  }
  function removeSpecRow(i: number) {
    setSpecs((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Укажите название товара");
      return;
    }
    if (!category) {
      toast.error("Выберите категорию");
      return;
    }
    const priceNum = Number(price);
    if (!priceNum || priceNum <= 0) {
      toast.error("Укажите цену больше нуля");
      return;
    }
    if (images.length === 0) {
      toast.error("Добавьте хотя бы одно фото");
      return;
    }

    setSaving(true);
    try {
      const input: ProductInput = {
        title: title.trim(),
        category,
        price: priceNum,
        inStock,
        description: description.trim(),
        images,
        specs: specs.filter((s) => s.label.trim() && s.value.trim()),
        ...(kaspiUrl.trim() ? { kaspiUrl: kaspiUrl.trim() } : {}),
      };
      const { commitSha } = await onSubmit(input);
      toast.success("Сохранено. Сайт обновится через 1–2 минуты (идёт автосборка)…");
      void navigate({ to: "/admin" });
      void waitForPublish(commitSha);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="title">Название</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Категория</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Цена, ₸</Label>
          <Input
            id="price"
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="inStock" checked={inStock} onCheckedChange={setInStock} />
        <Label htmlFor="inStock" className="cursor-pointer">
          {inStock ? "В наличии" : "Нет в наличии"}
        </Label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kaspiUrl">Ссылка «Купить в Kaspi Магазине»</Label>
        <Input
          id="kaspiUrl"
          type="url"
          placeholder="https://kaspi.kz/shop/p/..."
          value={kaspiUrl}
          onChange={(e) => setKaspiUrl(e.target.value)}
        />
        <p className="text-[12px] text-muted-foreground">
          Необязательно. Если оставить пустым, на карточке будет обычная кнопка «Купить на Kaspi» и
          WhatsApp — как у витринных товаров.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Фото</Label>
        <div className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <div
              key={src}
              className="group relative h-24 w-24 overflow-hidden rounded-lg border border-border bg-white"
            >
              <img src={src} alt="" className="h-full w-full object-contain" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label="Удалить фото"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            <span className="text-[11px]">Добавить</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                void handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Характеристики</Label>
        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder="Название, напр. «Процессор»"
                value={s.label}
                onChange={(e) => updateSpec(i, "label", e.target.value)}
              />
              <Input
                placeholder="Значение, напр. «Intel Celeron N5095»"
                value={s.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSpecRow(i)}
                aria-label="Удалить строку"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addSpecRow}>
          <Plus className="h-4 w-4" /> Добавить характеристику
        </Button>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" disabled={saving || uploading}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => navigate({ to: "/admin" })}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
