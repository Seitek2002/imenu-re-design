'use client';

import Link from 'next/link';
import { SearchX } from 'lucide-react';

interface Props {
  venueSlug: string;
}

export default function OrderNotFound({ venueSlug }: Props) {
  return (
    <main className='min-h-svh bg-[#F8F6F7] flex flex-col items-center justify-center p-4'>
      <div className='bg-white p-8 rounded-4xl shadow-sm flex flex-col items-center text-center max-w-sm w-full'>
        <div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6'>
          <SearchX className='w-10 h-10 text-gray-400' />
        </div>

        <h1 className='text-2xl font-cruinn font-bold text-[#111111] mb-2'>
          Заказ не найден
        </h1>

        <p className='text-gray-500 mb-8 text-sm'>
          Возможно, вы перешли по неверной ссылке или этот заказ уже перемещен в
          архив.
        </p>

        {/* Кнопка использует класс bg-brand, который подхватит цвет из твоего VenueInitializer */}
        <Link
          href={`/${venueSlug}`}
          className='w-full bg-brand text-white font-bold h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform shadow-md'
        >
          Вернуться к меню
        </Link>
      </div>
    </main>
  );
}
