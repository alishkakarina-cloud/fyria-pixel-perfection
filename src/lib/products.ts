import macbook1 from "@/assets/p-macbook-1.jpg";
import macbook2 from "@/assets/p-macbook-2.jpg";
import macbook3 from "@/assets/p-macbook-3.jpg";
import macbook4 from "@/assets/p-macbook-4.jpg";
import rog from "@/assets/p-rog.jpg";
import ipad from "@/assets/p-ipad.jpg";
import mouse from "@/assets/p-mouse.jpg";
import headset from "@/assets/p-headset.jpg";
import catLaptops from "@/assets/cat-laptops.jpg";
import catTablets from "@/assets/cat-tablets.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catChairs from "@/assets/cat-chairs.jpg";
import catFurniture from "@/assets/cat-furniture.jpg";

export const WHATSAPP_URL = "https://wa.me/77471234567";
export const KASPI_URL = "https://kaspi.kz/shop/";

export const formatPrice = (n: number) =>
  n.toLocaleString("ru-RU").replace(/,/g, " ") + " ₸";

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
};

export const categories = [
  { name: "Ноутбуки", count: "124 товара", image: catLaptops },
  { name: "Планшеты", count: "86 товаров", image: catTablets },
  { name: "Аксессуары", count: "342 товара", image: catAccessories },
  { name: "Игровые кресла", count: "78 товаров", image: catChairs },
  { name: "Компьютерная мебель", count: "64 товара", image: catFurniture },
];

export const products: Product[] = [
  {
    slug: "apple-macbook-air-13-m2-512gb-silver",
    title: 'Apple MacBook Air 13" M2 512GB (Silver)',
    price: 649990,
    oldPrice: 724990,
    discount: 10,
    rating: 4.9,
    reviews: 128,
    category: "Ноутбуки",
    sku: "FYRIA-MBA13-M2-512",
    inStock: true,
    images: [macbook1, macbook2, macbook3, macbook4],
    description:
      "Невероятно тонкий и мощный ноутбук Apple MacBook Air с чипом M2. Идеален для работы, учёбы и творчества. До 18 часов автономной работы, бесшумная система охлаждения и великолепный дисплей Liquid Retina.",
    specs: [
      { label: "Экран", value: "13.6\" Liquid Retina (2560x1664)" },
      { label: "Процессор", value: "Apple M2" },
      { label: "Оперативная память", value: "8GB" },
      { label: "Накопитель", value: "512GB SSD" },
      { label: "Видеокарта", value: "Apple M2 8-core GPU" },
      { label: "Вес", value: "1.24 кг" },
    ],
    highlights: [
      "До 18 часов работы от батареи",
      "Лёгкий и портативный",
      "Бесшумная работа",
      "Мощный чип M2",
    ],
  },
  {
    slug: "asus-rog-zephyrus-g14",
    title: "Asus ROG Zephyrus G14 R9 6900HS / RTX 3060",
    price: 899990,
    rating: 4.7,
    reviews: 64,
    category: "Ноутбуки",
    sku: "FYRIA-ROG-G14",
    inStock: true,
    images: [rog],
    description:
      "Компактный игровой ноутбук с процессором Ryzen 9 и графикой RTX 3060. Максимальная производительность в корпусе 14 дюймов.",
    specs: [
      { label: "Экран", value: '14" QHD 120Hz' },
      { label: "Процессор", value: "AMD Ryzen 9 6900HS" },
      { label: "Оперативная память", value: "16GB" },
      { label: "Накопитель", value: "1TB SSD" },
      { label: "Видеокарта", value: "NVIDIA RTX 3060" },
      { label: "Вес", value: "1.65 кг" },
    ],
    highlights: ["120Hz QHD дисплей", "RTX 3060", "Компактный корпус", "Быстрая зарядка"],
  },
  {
    slug: "ipad-air-5-64gb",
    title: "iPad Air 5 64GB (Wi-Fi)",
    price: 299990,
    rating: 4.8,
    reviews: 92,
    category: "Планшеты",
    sku: "FYRIA-IPADAIR5",
    inStock: true,
    images: [ipad],
    description: "Планшет Apple iPad Air 5 с чипом M1 и дисплеем Liquid Retina 10.9 дюйма.",
    specs: [
      { label: "Экран", value: '10.9" Liquid Retina' },
      { label: "Процессор", value: "Apple M1" },
      { label: "Оперативная память", value: "8GB" },
      { label: "Накопитель", value: "64GB" },
      { label: "Связь", value: "Wi-Fi 6" },
      { label: "Вес", value: "461 г" },
    ],
    highlights: ["Чип M1", "Поддержка Apple Pencil", "Лёгкий корпус", "Touch ID"],
  },
  {
    slug: "logitech-mx-master-3s",
    title: "Logitech MX Master 3S",
    price: 64990,
    rating: 4.9,
    reviews: 211,
    category: "Аксессуары",
    sku: "FYRIA-MXM3S",
    inStock: true,
    images: [mouse],
    description: "Беспроводная мышь для профессионалов с бесшумными кнопками и точным сенсором 8K DPI.",
    specs: [
      { label: "Тип", value: "Беспроводная мышь" },
      { label: "Сенсор", value: "8000 DPI" },
      { label: "Подключение", value: "Bluetooth / USB-C" },
      { label: "Автономность", value: "до 70 дней" },
      { label: "Кнопки", value: "7" },
      { label: "Вес", value: "141 г" },
    ],
    highlights: ["Бесшумные клики", "8K DPI сенсор", "До 70 дней работы", "Быстрая зарядка"],
  },
  {
    slug: "hyperx-cloud-alpha-s",
    title: "HyperX Cloud Alpha S",
    price: 49990,
    rating: 4.6,
    reviews: 143,
    category: "Аксессуары",
    sku: "FYRIA-HXCAS",
    inStock: true,
    images: [headset],
    description: "Игровая гарнитура с объёмным звуком 7.1 и съёмным микрофоном с шумоподавлением.",
    specs: [
      { label: "Тип", value: "Игровая гарнитура" },
      { label: "Звук", value: "Virtual 7.1" },
      { label: "Подключение", value: "3.5mm / USB" },
      { label: "Микрофон", value: "Съёмный, с шумоподавлением" },
      { label: "Амбушюры", value: "Memory foam" },
      { label: "Вес", value: "310 г" },
    ],
    highlights: ["Объёмный звук 7.1", "Съёмный микрофон", "Memory foam", "Регулировка баса"],
  },
];

export const similar = [
  { title: 'MacBook Pro 14" M3', price: 1149990, rating: 4.9, image: macbook2 },
  { title: "Asus TUF Gaming F15", price: 499990, rating: 4.7, image: rog },
  { title: "Lenovo Legion 5 Pro", price: 699990, rating: 4.8, image: rog },
  { title: "Dell XPS 13 Plus", price: 699990, rating: 4.9, image: macbook1 },
  { title: "MSI Stealth 15M", price: 799990, rating: 4.6, image: macbook3 },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
