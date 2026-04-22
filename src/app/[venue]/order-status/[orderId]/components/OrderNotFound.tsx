'use client';

import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props {
  venueSlug: string;
}

export default function OrderNotFound({ venueSlug }: Props) {
  const t = useTranslations('OrderStatus');
  return (
    <main className='min-h-svh bg-[#F8F6F7] flex flex-col items-center justify-center p-4'>
      <div className='bg-white p-8 rounded-4xl shadow-sm flex flex-col items-center text-center max-w-sm w-full'>
        <div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6'>
          <SearchX className='w-10 h-10 text-gray-400' />
        </div>

        <h1 className='text-2xl font-bold text-[#111111] mb-2'>
          {t('notFound')}
        </h1>

        <p className='text-gray-500 mb-8 text-sm'>
          {t('notFoundDesc')}
        </p>

        {/* Кнопка использует класс bg-brand, который подхватит цвет из твоего VenueInitializer */}
        <Link
          href={`/${venueSlug}`}
          className='w-full bg-brand text-white font-bold h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform shadow-md'
        >
          {t('backToMenu')}
        </Link>
      </div>
    </main>
  );
}
