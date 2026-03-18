'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/ui';
import { useVenueStore } from '@/store/venue';
import { Product } from '@/types/api';
import FoodItem from '../[venue]/products/[slug]/components/FoodItem';

const SWEAR_WORDS = [
  'бля',
  'блять',
  'блядь',
  'хуй',
  'хуесос',
  'пизда',
  'пиздец',
  'ебать',
  'сука',
  'хер',
  'педик',
  'пидор',
  'пидараз',
  'далбаеб',
  'далбаёб',
  'еблан',
  'ебальник',
  'ебланка',
  'коток',
  'сгейн',
  'сгэйн',
  'ам',
  'чочок',
  'жалап',
  'шлюха',
];
const PORN_CATEGORIES = [
  // Базовые русские запросы
  'порно',
  'секс',
  'порнуха',
  'порнушка',
  'эротика',
  'порнография',

  // Популярные английские жанры и термины
  'porn',
  'sex',
  'milf',
  'stepmom',
  'stepsister',
  'stepfantasy',
  'bdsm',
  'hentai',
  'amateur',
  'mature',
  'lesbian',
  'threesome',
  'orgy',
  'anal',
  'oral',
  'blowjob',
  'handjob',
  'creampie',
  'squirt',
  'cumshot',
  'deepthroat',
  'cuckold',
  'interracial',
  'pov',
  'fetish',
  'footjob',
  'masturbation',
  'solo',
  'casting',
  'massage',
  'voyeur',
  'public',
  'cam',
  'onlyfans',
  'ebony',
  'latina',
  'asian',
  'bbw',

  // Специфичные русские термины
  'анал',
  'минет',
  'куни',
  'отсос',
  'дрочка',
  'мастурбация',
  'групповуха',
  'оргия',
  'лесбиянки',
  'извращения',
  'шлюхи',
  'проститутки',
  'эскорт',

  // Популярные сайты и студии (чтобы отлавливать прямые поиски сайтов)
  'pornhub',
  'brazzers',
  'xvideos',
  'xnxx',
  'xhamster',
  'spankbang',
  'eporner',
  'chaturbate',
  'bongacams',
  'realitykings',
  'bangbros',
  'naughtyamerica',
  'blacked',
  'tushy',
  'vixen',
  'bellesa',
];
const GACHI_WORDS = [
  // Базовые слова
  'gay',
  'gays',
  'gachimuchi',
  'гей',
  'голубой',
  'геи',
  'гачи',
  'гачимучи',
  'jabroni',

  // Культовые фразы
  'gachi muchi',
  'boss of this gym',
  'boy next door',
  'dungeon master',
  'fucking slave',
  'fucking slaves',
  'deep dark fantasies',
  '300 bucks',
  'three hundred bucks',
  'ass we can',
  'take it boy',
  'do you like what you see',
  'stick your finger',
  'lube it up',
];

const checkEasterEggs = (query: string): string | null => {
  const q = query.toLowerCase().trim();

  if (q.includes('1=1') || q.includes('drop table') || q.includes('select *')) {
    return 'Nice try, хакер. Иди лучше поешь 👨‍💻';
  }

  // 2. Разбиваем запрос на массив отдельных слов (убирая знаки препинания)
  // Это позволит искать точные совпадения даже в фразах из нескольких слов
  const words = q.replace(/[^\w\sа-яё]/gi, '').split(/\s+/);

  // Проверка на Gachi
  if (
    GACHI_WORDS.some((phrase) =>
      phrase.includes(' ') ? q.includes(phrase) : words.includes(phrase),
    )
  ) {
    return `Welcome to the club buddy ♂️
.
  ⣿⣿⣿⣿⡟⠛⠁⠄⠄⠄⠄⢀⣀⣀⠄⠄⠄⠄⣤⣽⣿⣿⣿⣿⣿⣿⣿⣿ 
  ⣿⣿⣿⡋⠁⠄⠄⠄⣠⣶⣾⣿⣿⣿⣿⠄⢦⡄⠐⠬⠛⢿⣿⣿⣿⣿⣿⣿ 
  ⣿⡿⠇⠁⠄⠄⣠⣾⣿⣿⡿⠟⠋⠁⠄⠄⠈⠁⠄⠄⠄⠄⠙⢿⣿⣿⣿⣿ 
  ⣿⠃⠄⠄⠄⠘⣿⣿⣿⣿⢀⣠⠄⠄⠄⠄⣰⣶⣀⠄⠄⠄⠄⠸⣿⣿⣿⣿ 
  ⣏⠄⠄⠄⠄⠄⣿⣿⣿⡿⢟⣁⠄⣀⣠⣴⣿⣿⠿⠷⠶⠒⠄⠄⢹⣿⣿⣿ 
  ⡏⠄⠄⠄⠄⢰⣿⣿⣿⣿⣿⣿⣿⣿⡟⠄⠛⠁⠄⠄⠄⠄⠄⠄⢠⣿⣿⣿ 
  ⡇⠄⠄⠄⠄⠈⢿⣿⣿⣿⣿⣿⣿⣿⡇⠄⣼⣿⠇⠘⠄⠁⠄⠄⠄⢻⣿⣿ 
  ⣇⠄⠄⠄⠄⠄⠸⢿⣿⣿⣿⣿⣿⣿⠁⠸⠟⠁⣠⣤⣤⣶⣤⠄⠄⠄⢻⣿ 
  ⣿⡄⠄⡤⢤⣤⡀⠈⣿⣿⣿⣿⣿⣿⡆⠄⠄⠘⠋⠁⠄⠄⠈⠄⠄⠄⢸⣿ 
  ⣿⣿⡜⢰⡾⢻⣧⣰⣿⣿⣿⣿⣿⣿⣷⠄⣼⣷⣶⣶⡆⠄⠄⠄⠄⠄⠄⣿ 
  ⣿⣿⣧⢸⠄⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⠄⠄⠄⠄⠄⠄⠄⣿ 
  ⣿⣿⣿⣿⡿⢿⡟⠉⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⠄⠄⢀⡀⠄⠘⣿ 
  ⣿⣿⣿⣿⣿⣆⢻⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠋⠄⠄⠈⠁⠄⠄⣿ 
  ⣿⣿⣿⣿⣿⣿⡆⢻⣿⣿⣿⣿⣿⣿⡿⠛⠛⠛⠃⠄⠄⠄⠄⠄⠄⠄⢀⣿ 
  ⣿⣿⣿⣿⣿⣿⣿⣆⣻⣿⣿⣿⣿⣿⣷⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢸⣿

    `;
  }

  // Проверка на порно
  if (PORN_CATEGORIES.some((word) => words.includes(word))) {
    return 'Вы ищете не на том сайте 👀, но мы вас не осуждаем 😇';
  }

  // Проверка на мат
  if (SWEAR_WORDS.some((word) => words.includes(word))) {
    return 'И этими губами ты свою маму целуешь? 🫣';
  }

  // Дополнительные локальные пасхалки
  if (words.includes('диета')) return 'Какая диета? Один раз живем! 🍔';
  if (q === 'бесплатно' || q === 'халява')
    return 'Бесплатный сыр только в мышеловке 🧀';
  if (q === 'рекурсия') return 'Возможно, вы искали: рекурсия 🔄';
  if (q === 'наркотики') return 'Чем это мы балуемся?)';
  if (q === 'девушка') return 'Удачи с этим 🫂';
  if (q === 'привет') return 'Пока, пока!';
  if (q === 'салам') return 'Уалейкум родной 🤝';
  if (q === 'поиск') return 'Вам заняться нечем? 👀 Нам-то за такие приколы платят. А вы-то что?...';
  if (q === 'дети') return '...';

  return null;
};

export default function SearchResults() {
  const { searchQuery } = useUIStore();
  const venue = useVenueStore((state) => state.data);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const easterEggMessage = checkEasterEggs(searchQuery);

  // 🔥 DEBOUNCE: Ждем 500мс после ввода, прежде чем слать запрос
  useEffect(() => {
    // Убрал дублирование проверки
    if (!searchQuery.trim() || easterEggMessage) {
      setProducts([]);
      return;
    }

    const timerId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://imenu.kg/api/v2/products/?venueSlug=${
            venue?.slug
          }&search=${encodeURIComponent(searchQuery)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchQuery, venue?.slug, easterEggMessage]);

  if (!searchQuery) {
    return (
      <div className='flex flex-col items-center justify-center pt-20 text-gray-400 animate-fadeIn'>
        <div className='text-4xl mb-2'>🔍</div>
        <p>Введите название блюда</p>
      </div>
    );
  }

  if (easterEggMessage) {
    return (
      <div className='flex flex-col items-center justify-center pt-20 animate-fadeIn px-4 text-center'>
        <p className='text-xl font-medium text-gray-700'>{easterEggMessage}</p>
      </div>
    );
  }

  return (
    <div className='px-2 py-4 min-h-[60vh] animate-fadeIn'>
      <h3 className='text-lg font-bold mb-4 px-2'>Результаты поиска</h3>

      {loading ? (
        <div className='flex justify-center py-10'>
          <div className='w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin'></div>
        </div>
      ) : products.length > 0 ? (
        <div className='columns-2 gap-2 space-y-2'>
          {products.map((product) => (
            <div key={product.id} className='break-inside-avoid'>
              <FoodItem product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-10 text-gray-500'>
          Ничего не найдено по запросу &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
}
