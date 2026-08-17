/**
 * Пережимает фото в браузере перед отправкой на сервер: длинная сторона до
 * 1600px, JPEG ~0.85 (PNG с прозрачностью остаётся PNG). Каждая правка через
 * админку иначе превращалась бы в коммит на несколько мегабайт — телефонные
 * фото легко весят по 8–12 МБ.
 */
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.85;

export type ProcessedImage = { base64: string; ext: "jpg" | "png" };

async function hasAlpha(img: HTMLImageElement): Promise<boolean> {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  if (!ctx) return false;
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 3; i < data.length; i += 4 * 97) {
    if (data[i]! < 255) return true;
  }
  return false;
}

export async function processImageFile(file: File): Promise<ProcessedImage> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Файл повреждён или это не изображение"));
    el.src = dataUrl;
  });

  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas недоступен в этом браузере");
  ctx.drawImage(img, 0, 0, w, h);

  const keepPng = file.type === "image/png" && (await hasAlpha(img));
  const mime = keepPng ? "image/png" : "image/jpeg";
  const out = canvas.toDataURL(mime, keepPng ? undefined : JPEG_QUALITY);
  const base64 = out.slice(out.indexOf(",") + 1);
  return { base64, ext: keepPng ? "png" : "jpg" };
}
