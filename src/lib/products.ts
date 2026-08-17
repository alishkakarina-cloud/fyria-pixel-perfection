import catalogData from "@/data/catalog.json";

export const WHATSAPP_URL = "https://wa.me/77471234567";
export const KASPI_URL = "https://kaspi.kz/shop/";
/** Номер для консультаций — витрина продавца FYRIA на Kaspi. */
export const CONSULT_WHATSAPP_URL = "https://wa.me/77079843404";

export const formatPrice = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ") + " ₸";

export type Product = {
  slug: string;
  title: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  category: string;
  sku: string;
  inStock: boolean;
  images: string[];
  description: string;
  specs: { label: string; value: string }[];
  highlights: string[];
  /** Прямая ссылка на карточку товара в Kaspi Магазине (только у товаров из выгрузки Kaspi). */
  kaspiUrl?: string;
  /** Отмечает товары секции "Хиты продаж" на главной. Не редактируется из админки. */
  featured?: boolean;
};

export type Category = {
  slug: string;
  name: string;
  image: string;
};

const plural = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} товара`;
  return `${n} товаров`;
};

/**
 * Единственный источник данных каталога — src/data/catalog.json.
 * Читают и пишут его как публичная витрина (через этот модуль), так и
 * админка (через src/lib/admin — коммитит изменения в этот же файл
 * в GitHub, откуда Vercel собирает новый деплой автоматически).
 */
export const categories: Category[] = catalogData.categories;

/** Полный каталог: витринные товары ("Хиты продаж") + выгрузка с Kaspi + всё, что добавлено из админки. */
export const allProducts: Product[] = catalogData.products;

/** Товары секции "Хиты продаж" на главной — те же 4, что были в исходном дизайне. */
export const products: Product[] = allProducts.filter((p) => p.featured);

/** Похожие товары в карточке товара — декоративный блок, не связан с реальным каталогом. */
export const similar = [
  {
    title: 'MacBook Pro 14" M3',
    price: 1149990,
    rating: 4.9,
    image: "/misc/similar-macbook-pro-14.jpg",
  },
  {
    title: "Asus TUF Gaming F15",
    price: 499990,
    rating: 4.7,
    image: "/products/asus-rog-zephyrus-g14-1.jpg",
  },
  {
    title: "Lenovo Legion 5 Pro",
    price: 699990,
    rating: 4.8,
    image: "/products/asus-rog-zephyrus-g14-1.jpg",
  },
  { title: "Dell XPS 13 Plus", price: 699990, rating: 4.9, image: "/misc/similar-dell-xps.jpg" },
  { title: "MSI Stealth 15M", price: 799990, rating: 4.6, image: "/misc/similar-msi-stealth.jpg" },
];

export const getProduct = (slug: string) => allProducts.find((p) => p.slug === slug);

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

export const getCategoryProducts = (slug: string) => {
  const category = getCategory(slug);
  return category ? allProducts.filter((p) => p.category === category.name) : [];
};

/**
 * Подпись под категорией — единственный источник правды по количеству.
 * Считает реальные товары в категории при каждом вызове, поэтому добавление
 * или удаление товара сразу меняет цифру везде, где эта функция вызвана.
 * Формат прежний: "1 товар" / "3 товара" / "5 товаров".
 */
export const getCategoryCount = (slug: string) => plural(getCategoryProducts(slug).length);
