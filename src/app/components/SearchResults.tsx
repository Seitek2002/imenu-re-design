'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/ui';
import { useVenueStore } from '@/store/venue';
import { Product } from '@/types/api';
import FoodItem from '../[venue]/products/[slug]/components/FoodItem';
import { useEasterEggs } from './useEasterEggs';
import { API_V2_URL } from '@/lib/config';

export default function SearchResults() {
  const { searchQuery } = useUIStore();
  const venue = useVenueStore((state) => state.data);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Получаем данные квеста из хука
  const { easterEggMessage, questState, setQuestState } =
    useEasterEggs(searchQuery);

  useEffect(() => {
    // ВАЖНО: Добавили questState, чтобы не слать запрос к API, пока идет квест
    if (!searchQuery.trim() || easterEggMessage || questState) {
      setProducts([]);
      return;
    }

    const timerId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_V2_URL}/products/?venueSlug=${
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
  }, [searchQuery, venue?.slug, easterEggMessage, questState]);

  if (!searchQuery) {
    return (
      <div className='flex flex-col items-center justify-center pt-20 text-gray-400 animate-fadeIn'>
        <div className='text-4xl mb-2'>🔍</div>
        <p>Введите &apos;название блюда&apos;</p>
      </div>
    );
  }

  // --- 🎭 РЕНДЕР КВЕСТА ---
  if (questState?.type === 'camera') {
    return (
      <div className='flex flex-col items-center justify-center pt-20 animate-fadeIn px-4 text-center space-y-6'>
        {/* Шаг 1: Пользователь ввел слово */}
        {questState.step === 1 && (
          <p className='text-xl font-medium text-gray-700 whitespace-pre-wrap animate-pulse'>
            А теперь зайди в камеру и сделай селфи! 📸
          </p>
        )}

        {/* Шаг 2: Пользователь вернулся из камеры */}
        {questState.step === 2 && (
          <div className='flex flex-col items-center space-y-5 animate-fadeIn'>
            <p className='text-xl font-medium text-gray-700'>
              Положи сюда свое селфи, ща будет прикол 👇
            </p>
            {/* Прячем стандартный инпут и стилизуем label под кнопку */}
            <label className='cursor-pointer bg-brand text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-opacity shadow-md'>
              Загрузить фото
              <input
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(e) => {
                  // Если файл выбран - переходим к финалу
                  if (e.target.files && e.target.files.length > 0) {
                    setQuestState({ type: 'camera', step: 3 });
                  }
                }}
              />
            </label>
          </div>
        )}

        {/* Шаг 3: Финал после загрузки фото */}
        {questState.step === 3 && (
          <div className='animate-fadeIn flex flex-col items-center space-y-2'>
            <p className='text-2xl font-bold text-red-600'>
              Теперь мы знаем как ты выглядишь))) 👀
            </p>
            <p className='text-sm text-gray-500'>
              (Расслабься, мы никуда это не сохраняем)
            </p>
          </div>
        )}
      </div>
    );
  }

  // --- 📝 РЕНДЕР ОБЫЧНЫХ ПАСХАЛОК ---
  if (easterEggMessage) {
    return (
      <div className='flex flex-col items-center justify-center pt-20 animate-fadeIn px-4 text-center'>
        <pre className='text-sm md:text-base font-medium text-gray-700 whitespace-pre-wrap text-left inline-block'>
          {easterEggMessage}
        </pre>
      </div>
    );
  }

  // --- 🍔 РЕНДЕР РЕЗУЛЬТАТОВ ПОИСКА ---
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
