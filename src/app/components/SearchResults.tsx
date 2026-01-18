'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/ui';
import { useVenueStore } from '@/store/venue';
import { Product } from '@/types/api'; // Убедись, что тип Product у тебя есть
import FoodItem from '../[venue]/products/[slug]/components/FoodItem';

export default function SearchResults() {
  const { searchQuery } = useUIStore();
  const venue = useVenueStore((state) => state.data);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔥 DEBOUNCE: Ждем 500мс после ввода, прежде чем слать запрос
  useEffect(() => {
    if (!searchQuery.trim()) {
      setProducts([]);
      return;
    }

    const timerId = setTimeout(async () => {
      setLoading(true);
      try {
        // Запрос к API (замени URL на правильный, если отличается)
        const res = await fetch(
          `https://imenu.kg/api/v2/products/?venueSlug=${
            venue?.slug
          }&search=${encodeURIComponent(searchQuery)}`
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
  }, [searchQuery, venue?.slug]);

  if (!searchQuery) {
    return (
      <div className='flex flex-col items-center justify-center pt-20 text-gray-400 animate-fadeIn'>
        <div className='text-4xl mb-2'>🔍</div>
        <p>Введите название блюда</p>
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
        // Используем твою сетку товаров (Masonry или Grid)
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
