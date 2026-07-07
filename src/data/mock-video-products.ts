/**
 * Мок-данные для видео-витрины товара.
 * Временный модуль — после согласования дизайна заменим на API.
 * Триггер: `?demo=<slug>` в любом venue-URL.
 */

import type {
  GroupItem,
  GroupModification,
  Product,
  ProductDetails,
} from '@/types/api';

export type { ProductDetails };

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
  // ── Варианты ──────────────────────────────────────────────────────────────
  productIce: -1010,
  productDecaf: -1011,
  modIceSizeLarge: -7001,
  modIceSizeStd: -7002,
  modIceSizeSmall: -7003,
  groupIceMilk: -5001,
  groupIceSyrup: -5002,
  groupIceTopping: -5003,
  groupIceLevel: -5004,
  iceMilkCoconut: -6001,
  iceMilkAlmond: -6002,
  iceMilkOat: -6003,
  iceMilkBanana: -6004,
  iceSyrupCaramel: -6101,
  iceSyrupVanilla: -6102,
  iceSyrupChocolate: -6103,
  iceToppingCream: -6201,
  iceToppingCaramelSauce: -6202,
  iceToppingMint: -6203,
  iceMore: -6301,
  iceLess: -6302,
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
  selection: {
    type: 'multiple',
    title: 'Выберите молоко',
    description: '',
    min: 0,
    max: 1,
  },
  items: [
    item(ID.milkCoconut, 'Кокосовое', '15', '30', '/test/milk/coconut.png'),
    item(ID.milkBanana, 'Банановое', '15', '30', '/test/milk/banana.png'),
    item(ID.milkAlmond, 'Миндальное', '15', '30', '/test/milk/almond.png'),
    item(
      ID.milkLactoseFree,
      'Безлактозное',
      '15',
      '30',
      '/test/milk/lactose-free.png',
    ),
    item(ID.milkOat, 'Овсяное', '60', '200', '/test/milk/oat.png'),
    item(ID.milkSoy, 'Соевое', '15', '30', '/test/milk/soy.png'),
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
    max: 1,
  },
  items: [
    item(ID.sugarSyrup, 'Сахарный сироп', '50', '200', '/test/sugar/syrup.png'),
    item(ID.sugarCubes, 'Сахар', '0', '2', '/test/sugar/cubes.png'),
    item(ID.sugarNone, 'Без сахара', '0', '0', '/test/sugar/none.png'),
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
    item(ID.addonCinnamon, 'Корица', '5', '5', '/test/addons/cinnamon.png'),
    item(ID.addonHoney, 'Мед', '15', '15', '/test/addons/honey.png'),
    item(ID.addonCream, 'Сливки', '50', '200', '/test/addons/cream.png'),
    item(ID.addonLemon, 'Лимон слайс', '5', '5', '/test/addons/lemon.png'),
    item(ID.addonMint, 'Мята', '15', '15', '/test/addons/mint.png'),
    item(ID.addonIce, 'Лед', '0', '40', '/test/addons/ice.png'),
  ],
};

/** Группа настройки стакана — 4 колонки, тёмный стиль выделения */
const DOP_GROUP: GroupModification = {
  id: ID.groupDop,
  name: 'Опции',
  selection: {
    type: 'multiple',
    title: 'Настройка стакана',
    description: '',
    min: 0,
    max: 0,
  },
  items: [
    item(ID.dopSleeve, 'С манжетом', '0', '0', '/test/cup/sleeve.png'),
    item(ID.dopNoSleeve, 'Без манжета', '0', '0', '/test/cup/no-sleeve.png'),
    item(ID.dopLid, 'С крышкой', '0', '0', '/test/cup/lid.png'),
    item(ID.dopNoLid, 'Без крышки', '0', '0', '/test/cup/no-lid.png'),
    item(ID.dopCup, 'Стакан', '0', '0', '/test/cup/cup.png'),
    item(ID.dopOwnCup, 'Свой стакан', '0', '0', '/test/cup/own.png'),
    item(ID.dopStandard, 'Стандарт', '0', '0', '/test/cup/standart.png'),
    item(ID.dopHot, 'Погорячее', '0', '0', '/test/cup/hot.png'),
  ],
};

const ESPRESSO_GROUP: GroupModification = {
  id: ID.groupEspresso,
  name: 'Эспрессо',
  selection: {
    type: 'multiple',
    title: 'Эспрессо',
    description: '',
    min: 0,
    max: 3,
  },
  items: [
    item(
      ID.espExtraShot,
      'Экстра шот',
      '30',
      '10',
      '/test/espresso/extra-shot.png',
    ),
  ],
};

// ---------------------------------------------------------------------------
// Ice version groups
// ---------------------------------------------------------------------------
const ICE_MILK_GROUP: GroupModification = {
  id: ID.groupIceMilk,
  name: 'Молоко',
  selection: {
    type: 'multiple',
    title: 'Молоко',
    description: '',
    min: 0,
    max: 1,
  },
  items: [
    item(ID.iceMilkCoconut, 'Кокосовое', '15', '30', '/test/milk/coconut.png'),
    item(ID.iceMilkAlmond, 'Миндальное', '15', '30', '/test/milk/almond.png'),
    item(ID.iceMilkOat, 'Овсяное', '60', '200', '/test/milk/oat.png'),
    item(ID.iceMilkBanana, 'Банановое', '15', '30', '/test/milk/banana.png'),
  ],
};

const ICE_SYRUP_GROUP: GroupModification = {
  id: ID.groupIceSyrup,
  name: 'Сироп',
  selection: {
    type: 'single',
    title: 'Сироп',
    description: '',
    min: 0,
    max: 1,
  },
  items: [
    item(ID.iceSyrupCaramel, 'Карамель', '30', '15', '/test/syrup/caramel.png'),
    item(ID.iceSyrupVanilla, 'Ваниль', '30', '15', '/test/syrup/vanilla.png'),
    item(
      ID.iceSyrupChocolate,
      'Шоколад',
      '30',
      '15',
      '/test/syrup/chocolate.png',
    ),
  ],
};

const ICE_TOPPING_GROUP: GroupModification = {
  id: ID.groupIceTopping,
  name: 'Топпинг',
  selection: {
    type: 'multiple',
    title: 'Топпинг',
    description: '',
    min: 0,
    max: 2,
  },
  items: [
    item(
      ID.iceToppingCream,
      'Взбитые сливки',
      '50',
      '30',
      '/test/topping/cream.png',
    ),
    item(
      ID.iceToppingCaramelSauce,
      'Карам. соус',
      '20',
      '15',
      '/test/topping/caramel-sauce.png',
    ),
    item(
      ID.iceToppingMint,
      'Мятный сироп',
      '30',
      '15',
      '/test/topping/mint.png',
    ),
  ],
};

/** Группа льда — сегментный рендер (Много/Мало) */
const ICE_LEVEL_GROUP: GroupModification = {
  id: ID.groupIceLevel,
  name: 'Лёд',
  selection: {
    type: 'multiple',
    title: 'Количество льда',
    description: '',
    min: 0,
    max: 1,
  },
  items: [
    item(ID.iceMore, 'Много', '0', '0', '/test/ice/more.png'),
    item(ID.iceLess, 'Мало', '0', '0', '/test/ice/less.png'),
  ],
};

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------
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
    { id: ID.modSizeSmall, name: 'Маленький 250 г', price: 180 },
  ],
  groupModifications: [
    MILK_GROUP,
    SUGAR_GROUP,
    ADDONS_GROUP,
    DOP_GROUP,
    ESPRESSO_GROUP,
  ],
  variantType: 'hot',
  variantChip: { label: 'Горячая', photo: null },
};

const MOKKA_ICE_PRODUCT: Product = {
  id: ID.productIce,
  productName: 'Мокка Айс',
  productDescription:
    'Освежающий холодный мокка со льдом и мягкой шоколадной нотой',
  productPrice: 210,
  weight: 380,
  unit: 'мл',
  unitDisplay: 'мл',
  productPhoto: '/test/mokka-ice-vertical.png',
  productPhotoSmall: '/test/mokka-ice-vertical.png',
  productPhotoLarge: '/test/mokka-ice-vertical.png',
  categories: [],
  modificators: [
    { id: ID.modIceSizeLarge, name: 'Макси 480 мл', price: 260 },
    { id: ID.modIceSizeStd, name: 'Стандарт 380 мл', price: 210 },
    { id: ID.modIceSizeSmall, name: 'Мини 280 мл', price: 170 },
  ],
  groupModifications: [
    ICE_MILK_GROUP,
    ICE_SYRUP_GROUP,
    ICE_TOPPING_GROUP,
    ICE_LEVEL_GROUP,
  ],
  variantType: 'ice',
  variantChip: { label: 'Айс версия', photo: null },
};

const MOKKA_DECAF_PRODUCT: Product = {
  id: ID.productDecaf,
  productName: 'Мокка Декаф',
  productDescription:
    'Насыщенный мокка без кофеина — весь вкус шоколада и сливочной пенки',
  productPrice: 235,
  weight: 350,
  unit: 'г',
  unitDisplay: 'г',
  productPhoto: '/test/mokka-vertical.png',
  productPhotoSmall: '/test/mokka-vertical.png',
  productPhotoLarge: '/test/mokka-vertical.png',
  categories: [],
  modificators: [
    { id: ID.modSizeBig, name: 'Большой 450 г', price: 285 },
    { id: ID.modSizeStd, name: 'Стандарт 350 г', price: 235 },
    { id: ID.modSizeSmall, name: 'Маленький 250 г', price: 195 },
  ],
  groupModifications: [MILK_GROUP, SUGAR_GROUP, ADDONS_GROUP, DOP_GROUP],
  variantType: 'decaf',
  variantChip: { label: 'Декаф', photo: null },
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
      [MILK_GROUP.name]: '/test/chips/milk.png',
      [SUGAR_GROUP.name]: '/test/chips/sugar.png',
      [ADDONS_GROUP.name]: '/test/chips/addons.png',
      [DOP_GROUP.name]: '/test/chips/cup.png',
      [ESPRESSO_GROUP.name]: '/test/chips/espresso.png',
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
          [ID.dopSleeve, ID.dopNoSleeve],
          [ID.dopLid, ID.dopNoLid],
          [ID.dopCup, ID.dopOwnCup],
          [ID.dopStandard, ID.dopHot],
        ],
      },
    },
  },

  'mokka-ice': {
    product: MOKKA_ICE_PRODUCT,
    videoUrl: '/test/mokka-ice.mp4',
    posterUrl: '/test/mokka-ice-vertical.png',

    chipIcons: {
      [ICE_MILK_GROUP.name]: '/test/chips/milk.png',
      [ICE_SYRUP_GROUP.name]: '/test/chips/syrup.png',
      [ICE_TOPPING_GROUP.name]: '/test/chips/topping.png',
      [ICE_LEVEL_GROUP.name]: '/test/chips/ice.png',
    },

    productDetails: {
      fullTitle: 'Мокка Айс — холодный шоколадный кофе со льдом',
      description:
        'Холодная версия классического моккачино: двойной эспрессо, шоколадный сироп и молоко подаются со льдом в высоком стакане.',
      sections: [
        {
          heading: 'Состав',
          body: 'Двойной эспрессо + шоколадный сироп + молоко + лёд',
        },
        {
          heading: 'Вкус',
          body: 'Освежающий, насыщенный кофейно-шоколадный вкус',
        },
        {
          heading: 'Подача',
          body: 'В высоком прозрачном стакане со льдом и трубочкой',
        },
      ],
    },

    groupMeta: {
      [ICE_LEVEL_GROUP.id]: {
        segmentPairs: [[ID.iceMore, ID.iceLess]],
      },
    },
  },

  'mokka-decaf': {
    product: MOKKA_DECAF_PRODUCT,
    videoUrl: '/test/mokka.mp4',
    posterUrl: '/test/mokka-vertical.png',

    chipIcons: {
      [MILK_GROUP.name]: '/test/chips/milk.png',
      [SUGAR_GROUP.name]: '/test/chips/sugar.png',
      [ADDONS_GROUP.name]: '/test/chips/addons.png',
      [DOP_GROUP.name]: '/test/chips/cup.png',
    },

    productDetails: {
      fullTitle: 'Мокка Декаф — без кофеина',
      description:
        'Все удовольствие от мокко без кофеина. Декаф эспрессо, шоколадный сироп и взбитое молоко — идеально для вечернего кофе.',
      sections: [
        {
          heading: 'Состав',
          body: 'Декаф эспрессо + шоколадный сироп + молоко',
        },
        {
          heading: 'Вкус',
          body: 'Насыщенный шоколадный с мягкой кофейной ноткой, без кофеина',
        },
      ],
    },

    groupMeta: {
      [DOP_GROUP.id]: {
        segmentPairs: [
          [ID.dopSleeve, ID.dopNoSleeve],
          [ID.dopLid, ID.dopNoLid],
          [ID.dopCup, ID.dopOwnCup],
          [ID.dopStandard, ID.dopHot],
        ],
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Variant groups — maps every slug to the full ordered chip list for its group.
// Order here defines chip order in the UI (left → right).
// ---------------------------------------------------------------------------
export const VARIANT_GROUPS: Record<string, string[]> = {
  mokka: ['mokka-decaf', 'mokka', 'mokka-ice'],
  'mokka-ice': ['mokka-decaf', 'mokka', 'mokka-ice'],
  'mokka-decaf': ['mokka-decaf', 'mokka', 'mokka-ice'],
};
