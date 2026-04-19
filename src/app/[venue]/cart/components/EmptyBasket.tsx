'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useVenueStore } from '@/store/venue';
import { useVenueProducts } from '@/lib/api/queries';
import FoodItem from '@/app/[venue]/products/[slug]/components/FoodItem';

const RECOMMEND_LIMIT = 6;

export default function EmptyBasket() {
  const venueSlug = useVenueStore((state) => state.data?.slug);
  const { data: products, isLoading } = useVenueProducts(venueSlug);

  const recommended = useMemo(() => {
    if (!products || products.length === 0) return [];

    const flagged = products.filter((p) => p.isRecommended);
    const pool = flagged.length > 0 ? flagged : products;
    return pool.slice(0, RECOMMEND_LIMIT);
  }, [products]);

  const menuHref = venueSlug ? `/${venueSlug}` : '/';

  return (
    <div className='flex flex-col items-center py-10 px-2 text-center'>
      <div className='w-20 h-20 rounded-full bg-[#F1F2F3] flex items-center justify-center text-4xl mb-4'>
        🛒
      </div>
      <h3 className='text-lg font-bold text-[#21201F]'>Корзина пуста</h3>
      <p className='text-gray-400 text-sm mt-1 max-w-xs'>
        Присмотрите что-нибудь из наших рекомендаций или зайдите в меню
      </p>

      <Link
        href={menuHref}
        className='mt-5 bg-brand text-white font-semibold rounded-2xl px-6 py-3 text-sm active:scale-95 transition-transform shadow-sm'
      >
        Перейти в меню
      </Link>

      {(isLoading || recommended.length > 0) && (
        <div className='w-full mt-8 text-left'>
          <h4 className='text-base font-bold text-[#21201F] px-1 mb-3'>
            Популярное
          </h4>

          {isLoading ? (
            <div className='grid grid-cols-2 gap-3'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className='aspect-square rounded-2xl bg-gray-100 animate-pulse'
                />
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-3'>
              {recommended.map((product, index) => (
                <FoodItem key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
