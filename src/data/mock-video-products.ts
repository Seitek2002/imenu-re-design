/**
 * Мок-данные для товаров с видео-витриной.
 *
 * Временный модуль — на этапе вёрстки нового full-screen-листинга работаем без бэка.
 * Когда дизайн примут, заменим источником с API (новые поля Product.productVideo /
 * Product.productVideoPoster) и удалим этот файл.
 *
 * Триггер: `?demo=<slug>` в любом venue-URL открывает соответствующий мок.
 */

import type { GroupItem, GroupModification, Product } from '@/types/api';

export interface VideoProductMock {
  /** Полный объект товара (как пришёл бы от бэка). */
  product: Product;
  /** URL фонового видео (loop, без звука). */
  videoUrl: string;
  /** Постер первого кадра — показывается пока видео грузится / autoplay заблокирован. */
  posterUrl: string;
  /** Картинка для chip’а нижнего ряда. Ключ — `GroupModification.name`. */
  chipIcons: Record<string, string>;
}

// Локальные id вне диапазона реальных, чтобы случайно не пересечься с бэком.
const ID = {
  product: -1000,
  modSizeBig: -2001,
  modSizeStd: -2002,
  groupMilk: -1001,
  groupSugar: -1002,
  groupAddons: -1003,
  groupExtras: -1004,
  // milk items
  milkCoconut: -3001,
  milkBanana: -3002,
  milkAlmond: -3003,
  milkLactoseFree: -3004,
  milkOat: -3005,
  milkSoy: -3006,
  // sugar items
  sugarWhite: -3101,
  sugarBrown: -3102,
  sugarStevia: -3103,
  // addons
  addonCinnamon: -3201,
  addonChocolate: -3202,
  addonCaramel: -3203,
  addonVanilla: -3204,
  // extras
  extraShot: -3301,
  extraCream: -3302,
} as const;

const milkItem = (
  id: number,
  name: string,
  photo: string | null = null,
): GroupItem => ({
  id,
  name,
  price: '50',
  brutto: '200',
  photo,
  thumbnail: photo,
});

const simpleItem = (
  id: number,
  name: string,
  price: string,
  brutto: string,
): GroupItem => ({
  id,
  name,
  price,
  brutto,
  photo: null,
  thumbnail: null,
});

const MILK_GROUP: GroupModification = {
  id: ID.groupMilk,
  name: 'Молоко',
  selection: {
    type: 'multiple',
    title: 'Выберите молоко',
    description: '',
    min: 0,
    max: 1,
  },
  items: [
    milkItem(ID.milkCoconut, 'Кокосовое', '/test/details/1.png'),
    milkItem(ID.milkBanana, 'Банановое', '/test/details/2.png'),
    milkItem(ID.milkAlmond, 'Миндальное', '/test/details/3.png'),
    milkItem(ID.milkLactoseFree, 'Безлактозное', '/test/details/4.png'),
    // Без картинок — провалятся в splash-placeholder.svg
    milkItem(ID.milkOat, 'Овсяное', null),
    milkItem(ID.milkSoy, 'Соевое', null),
  ],
};

const SUGAR_GROUP: GroupModification = {
  id: ID.groupSugar,
  name: 'Сахар',
  selection: {
    type: 'multiple',
    title: 'Сахар',
    description: '',
    min: 0,
    max: 3,
  },
  items: [
    simpleItem(ID.sugarWhite, 'Белый', '0', '5'),
    simpleItem(ID.sugarBrown, 'Тростниковый', '10', '5'),
    simpleItem(ID.sugarStevia, 'Стевия', '15', '2'),
  ],
};

const ADDONS_GROUP: GroupModification = {
  id: ID.groupAddons,
  name: 'Добавки',
  selection: {
    type: 'multiple',
    title: 'Добавки',
    description: '',
    min: 0,
    max: 4,
  },
  items: [
    simpleItem(ID.addonCinnamon, 'Корица', '20', '3'),
    simpleItem(ID.addonChocolate, 'Шоколад', '30', '10'),
    simpleItem(ID.addonCaramel, 'Карамель', '30', '10'),
    simpleItem(ID.addonVanilla, 'Ваниль', '25', '5'),
  ],
};

const EXTRAS_GROUP: GroupModification = {
  id: ID.groupExtras,
  name: 'Дополнительные',
  selection: {
    type: 'multiple',
    title: 'Дополнительные',
    description: '',
    min: 0,
    max: 2,
  },
  items: [
    simpleItem(ID.extraShot, 'Доп. эспрессо', '60', '30'),
    simpleItem(ID.extraCream, 'Взбитые сливки', '40', '20'),
  ],
};

const MOKKA_PRODUCT: Product = {
  id: ID.product,
  productName: 'Мокка',
  productDescription:
    'Нежный мокка с шоколадным вкусом и мягкой сливочной пенкой',
  productPrice: 220,
  weight: 350,
  unit: 'г',
  unitDisplay: 'г',
  productPhoto: '/test/mokka-vertical.png',
  productPhotoSmall: '/test/mokka-vertical.png',
  productPhotoLarge: '/test/mokka-vertical.png',
  categories: [],
  modificators: [
    { id: ID.modSizeBig, name: 'Большой 450 г', price: 270 },
    { id: ID.modSizeStd, name: 'Стандарт 350 г', price: 220 },
  ],
  groupModifications: [MILK_GROUP, SUGAR_GROUP, ADDONS_GROUP, EXTRAS_GROUP],
};

export const MOCK_VIDEO_PRODUCTS: Record<string, VideoProductMock> = {
  mokka: {
    product: MOKKA_PRODUCT,
    videoUrl: '/test/mokka.mp4',
    // Постер = горизонтальная картинка кадра. object-cover обрежет лишнее.
    posterUrl: '/test/mokka-horizontal.png',
    chipIcons: {
      [MILK_GROUP.name]: '/test/details/milk.png',
      // У остальных групп иконок нет — chip покажет «+».
    },
  },
};

/**
 * Извлекает «человеческое» название и «вес» из имени модификатора-размера
 * вида "Большой 450 г" / "Стандарт 350 г".
 */
export function parseSizeModName(name: string): { label: string; sub: string | null } {
  const m = name.match(/^(.+?)\s+(\d+\s*[а-яa-z]+)\s*$/i);
  if (m) return { label: m[1].trim(), sub: m[2].trim() };
  return { label: name, sub: null };
}
