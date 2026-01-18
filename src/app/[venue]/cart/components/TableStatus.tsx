'use client';

import { UtensilsCrossed } from 'lucide-react';
import { useVenueStore } from '@/store/venue';

export default function TableStatus() {
  // 1. Просто достаем готовый номер из памяти. Мгновенно.
  const tableNumber = useVenueStore((state) => state.tableNumber);

  // Если вдруг tableNumber еще null (хотя проверка isTableOrder снаружи не пустит),
  // покажем просто заглушку или ничего.

  return (
    <div className='flex justify-center pb-3 animate-fadeIn'>
      <div className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-md border border-gray-100'>
        <UtensilsCrossed size={16} className='text-brand' />

        <span className='text-brand font-bold text-sm'>
          {tableNumber ? `Стол №${tableNumber}` : 'Заказ в зале'}
        </span>
      </div>
    </div>
  );
}
