/**
 * Мок-данные для видео-витрины товара.
 * Временный модуль — после согласования дизайна заменим на API.
 * Триггер: `?demo=<slug>` в любом venue-URL.
 */

import type { GroupItem, GroupModification, Product } from '@/types/api';

// ---------------------------------------------------------------------------
// Public interfaces
// ---------------------------------------------------------------------------

export interface ProductDetails {
  fullTitle: string;
  description: string;
  sections: Array<{ heading: string; body: string }>;
}

export interface VariantChip {
  label: string;
  photo: string;
}

export interface GroupMeta {
  columns?: number;
  /** Если true — выбранные элементы отображаются с тёмным фоном (стиль cup-toggle) */
  darkSelected?: boolean;
  /**
   * Пары взаимоисключающих вариантов [id1, id2] для сегментного рендера.
   * Рендерится как стопка пилл-переключателей (как выбор размера).
   */
  segmentPairs?: [number, number][];
}

export interface VideoProductMock {
  product: Product;
  videoUrl: string;
  posterUrl: string;
  /** Иконка чипа в нижнем ряду. Ключ — GroupModification.name */
  chipIcons: Record<string, string>;
  /** Первый «специальный» чип перед разделителем (например: Айс версия) */
  variantChip?: VariantChip;
  /** Контент для листа «Подробнее» */
  productDetails?: ProductDetails;
  /** Метаданные групп: колонки, стиль выделения. Ключ — GroupModification.id */
  groupMeta?: Record<number, GroupMeta>;
}

// ---------------------------------------------------------------------------
// IDs — вне диапазона реальных, чтобы не пересечься с бэком
// ---------------------------------------------------------------------------
const ID = {
  product: -1000,
  modSizeBig: -2001,
  modSizeStd: -2002,
  modSizeSmall: -2003,
  groupMilk: -1001,
  groupSugar: -1002,
  groupAddons: -1003,
  groupDop: -1004,
  groupEspresso: -1005,
  // milk
  milkCoconut: -3001,
  milkBanana: -3002,
  milkAlmond: -3003,
  milkLactoseFree: -3004,
  milkOat: -3005,
  milkSoy: -3006,
  // sugar
  sugarSyrup: -3101,
  sugarCubes: -3102,
  sugarNone: -3103,
  // addons
  addonCinnamon: -3201,
  addonHoney: -3202,
  addonCream: -3203,
  addonLemon: -3204,
  addonMint: -3205,
  addonIce: -3206,
  // dop (cup packaging)
  dopSleeve: -3301,
  dopNoSleeve: -3302,
  dopLid: -3303,
  dopNoLid: -3304,
  dopCup: -3305,
  dopOwnCup: -3306,
  dopStandard: -3307,
  dopHot: -3308,
  // espresso
  espExtraShot: -3401,
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const item = (
  id: number,
  name: string,
  price: string,
  brutto: string,
  photo: string | null = null,
): GroupItem => ({ id, name, price, brutto, photo, thumbnail: photo });

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------
const MILK_GROUP: GroupModification = {
  id: ID.groupMilk,
  name: 'Молоко',
  selection: { type: 'multiple', title: 'Выберите молоко', description: '', min: 0, max: 1 },
  items: [
    item(ID.milkCoconut,    'Кокосовое',   '15', '30', '/test/milk/coconut.png'),
    item(ID.milkBanana,     'Банановое',   '15', '30', '/test/milk/banana.png'),
    item(ID.milkAlmond,     'Миндальное',  '15', '30', '/test/milk/almond.png'),
    item(ID.milkLactoseFree,'Безлактозное','15', '30', '/test/milk/lactose-free.png'),
    item(ID.milkOat,        'Овсяное',     '60', '200', '/test/milk/oat.png'),
    item(ID.milkSoy,        'Соевое',      '15', '30', '/test/milk/soy.png'),
  ],
};

const SUGAR_GROUP: GroupModification = {
  id: ID.groupSugar,
  name: 'Сахар',
  selection: { type: 'multiple', title: 'Сахар', description: '', min: 0, max: 1 },
  items: [
    item(ID.sugarSyrup, 'Сахарный сироп', '50', '200', '/test/sugar/syrup.png'),
    item(ID.sugarCubes, 'Сахар',          '0',  '2',   '/test/sugar/cubes.png'),
    item(ID.sugarNone,  'Без сахара',     '0',  '0',   '/test/sugar/none.png'),
  ],
};

const ADDONS_GROUP: GroupModification = {
  id: ID.groupAddons,
  name: 'Добавки',
  selection: { type: 'multiple', title: 'Добавки', description: '', min: 0, max: 4 },
  items: [
    item(ID.addonCinnamon, 'Корица',      '5',  '5',   '/test/addons/cinnamon.png'),
    item(ID.addonHoney,    'Мед',         '15', '15',  '/test/addons/honey.png'),
    item(ID.addonCream,    'Сливки',      '50', '200', '/test/addons/cream.png'),
    item(ID.addonLemon,    'Лимон слайс', '5',  '5',   '/test/addons/lemon.png'),
    item(ID.addonMint,     'Мята',        '15', '15',  '/test/addons/mint.png'),
    item(ID.addonIce,      'Лед',         '0',  '40',  '/test/addons/ice.png'),
  ],
};

/** Группа настройки стакана — 4 колонки, тёмный стиль выделения */
const DOP_GROUP: GroupModification = {
  id: ID.groupDop,
  name: 'Дополнительно',
  selection: { type: 'multiple', title: 'Настройка стакана', description: '', min: 0, max: 0 },
  items: [
    item(ID.dopSleeve,   'С манжетом',   '0', '0', '/test/cup/sleeve.png'),
    item(ID.dopNoSleeve, 'Без манжета',  '0', '0', '/test/cup/no-sleeve.png'),
    item(ID.dopLid,      'С крышкой',    '0', '0', '/test/cup/lid.png'),
    item(ID.dopNoLid,    'Без крышки',   '0', '0', '/test/cup/no-lid.png'),
    item(ID.dopCup,      'Стакан',       '0', '0', '/test/cup/cup.png'),
    item(ID.dopOwnCup,   'Свой стакан',  '0', '0', '/test/cup/own.png'),
    item(ID.dopStandard, 'Стандарт',     '0', '0', '/test/cup/standard.png'),
    item(ID.dopHot,      'Погорячее',    '0', '0', '/test/cup/hot.png'),
  ],
};

const ESPRESSO_GROUP: GroupModification = {
  id: ID.groupEspresso,
  name: 'Эспрессо',
  selection: { type: 'multiple', title: 'Эспрессо', description: '', min: 0, max: 3 },
  items: [
    item(ID.espExtraShot, 'Экстра шот', '30', '10', '/test/espresso/extra-shot.png'),
  ],
};

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------
const MOKKA_PRODUCT: Product = {
  id: ID.product,
  productName: 'Мокка',
  productDescription: 'Нежный мокка с шоколадным вкусом и мягкой сливочной пенкой',
  productPrice: 220,
  weight: 350,
  unit: 'г',
  unitDisplay: 'г',
  productPhoto: '/test/mokka-vertical.png',
  productPhotoSmall: '/test/mokka-vertical.png',
  productPhotoLarge: '/test/mokka-vertical.png',
  categories: [],
  modificators: [
    { id: ID.modSizeBig,   name: 'Большой 450 г',  price: 270 },
    { id: ID.modSizeStd,   name: 'Стандарт 350 г', price: 220 },
    { id: ID.modSizeSmall, name: 'Маленький 250 г', price: 180 },
  ],
  groupModifications: [MILK_GROUP, SUGAR_GROUP, ADDONS_GROUP, DOP_GROUP, ESPRESSO_GROUP],
};

// ---------------------------------------------------------------------------
// Mock registry
// ---------------------------------------------------------------------------
export const MOCK_VIDEO_PRODUCTS: Record<string, VideoProductMock> = {
  mokka: {
    product: MOKKA_PRODUCT,
    videoUrl: '/test/mokka.mp4',
    posterUrl: '/test/mokka-vertical.png',

    chipIcons: {
      [MILK_GROUP.name]:    '/test/chips/milk.png',
      [SUGAR_GROUP.name]:   '/test/chips/sugar.png',
      [ADDONS_GROUP.name]:  '/test/chips/addons.png',
      [DOP_GROUP.name]:     '/test/chips/cup.png',
      [ESPRESSO_GROUP.name]:'/test/chips/espresso.png',
    },

    variantChip: {
      label: 'Айс версия',
      photo: '/test/chips/ice-version.png',
    },

    productDetails: {
      fullTitle: 'Мокка с шоколадным вкусом и мягкой сливочной пенкой',
      description:
        'Мокко (или моккачино) — это кофейный напиток на основе эспрессо с добавлением шоколада (сиропа, порошка или растопленной плитки) и взбитого молока, часто украшаемый сливками.',
      sections: [
        {
          heading: 'Состав',
          body: 'Двойной эспрессо + шоколад (тёмный, молочный или белый) + молоко',
        },
        {
          heading: 'Вкус',
          body: 'Насыщенный, сладкий, с ярко выраженными шоколадными нотками',
        },
        {
          heading: 'Подача',
          body: 'Обычно подаётся в высоком бокале (айриш-бокале), иногда с добавлением ванили, карамели или корицы',
        },
      ],
    },

    groupMeta: {
      [DOP_GROUP.id]: {
        segmentPairs: [
          [ID.dopSleeve,   ID.dopNoSleeve],
          [ID.dopLid,      ID.dopNoLid],
          [ID.dopCup,      ID.dopOwnCup],
          [ID.dopStandard, ID.dopHot],
        ],
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

/**
 * Парсит «человеческое» название и вес из строки вида "Большой 450 г".
 */
export function parseSizeModName(name: string): { label: string; sub: string | null } {
  const m = name.match(/^(.+?)\s+(\d+\s*[а-яa-z]+)\s*$/i);
  if (m) return { label: m[1].trim(), sub: m[2].trim() };
  return { label: name, sub: null };
}
