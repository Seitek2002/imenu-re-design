import type { StaticImageData } from 'next/image';
import item1 from '@/assets/Foods/item-1.png';
import item2 from '@/assets/Foods/item-2.png';
import item3 from '@/assets/Foods/item-3.png';
import item4 from '@/assets/Foods/item-4.png';
import item5 from '@/assets/Foods/item-5.png';
import item6 from '@/assets/Foods/item-6.png';
import item7 from '@/assets/Foods/item-7.png';
import item8 from '@/assets/Foods/item-8.png';
import item9 from '@/assets/Foods/item-9.png';
import item10 from '@/assets/Foods/item-10.png';

export type FoodItem = {
  name: string;
  img: StaticImageData;
  slug: string;
};

export const foodItems: FoodItem[] = [
  {
    name: 'Горячее',
    img: item1,
    slug: 'hot',
  },
  {
    name: 'Холодное',
    img: item2,
    slug: 'cold',
  },
  {
    name: 'Кофейное',
    img: item3,
    slug: 'coffee',
  },
  {
    name: 'Фирменные напитки',
    img: item4,
    slug: 'signature-drinks',
  },
  {
    name: 'Национальные',
    img: item5,
    slug: 'national',
  },
  {
    name: 'Сезонные коктейли',
    img: item6,
    slug: 'seasonal-cocktails',
  },
  {
    name: 'Алкогольные шоты',
    img: item7,
    slug: 'alcohol-shots',
  },
  {
    name: 'Акционный чай',
    img: item8,
    slug: 'promo-tea',
  },
  {
    name: 'Фирменные напитки',
    img: item9,
    slug: 'signature-drinks-2',
  },
  {
    name: 'Национальные',
    img: item10,
    slug: 'national-2',
  },
];

/**
 * Паттерн сетки по умолчанию: ряды 3, затем 2, и далее по кругу.
 * Храним отдельно, чтобы переопределять по брейкпоинтам/настройкам.
 */
export const defaultGridPattern = [3, 2] as const;

/**
 * Чистая функция: режет массив на ряды по заданному паттерну (например, [3,2,3,2...]).
 * Не мутирует входные данные.
 */
export function chunkByPattern<T>(arr: T[], pattern: readonly number[]): T[][] {
  const rows: T[][] = [];
  let cursor = 0;
  let p = 0;
  while (cursor < arr.length) {
    const take = pattern[p % pattern.length];
    rows.push(arr.slice(cursor, cursor + take));
    cursor += take;
    p += 1;
  }
  return rows;
}
