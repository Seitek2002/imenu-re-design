'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useVenueStore } from '@/store/venue';

interface Props {
  venueSlug: string;
  orderId: number | string;
}

export default function StatusHeader({ venueSlug, orderId }: Props) {
  // 1. Достаем контекст из стора
  const tableId = useVenueStore((state) => state.tableId);
  const spotId = useVenueStore((state) => state.spotId);
  const isKioskMode = useVenueStore((state) => state.isKioskMode);

  // 2. Формируем правильную ссылку "Домой"
  // Дефолт: просто страница доставки
  let backUrl = `/${venueSlug}`;

  // Если есть контекст стола — возвращаем туда
  if (tableId && spotId) {
    if (isKioskMode) {
      // Киоск: /ustukan/d/19/84 (Spot/Table)
      backUrl = `/${venueSlug}/d/${spotId}/${tableId}`;
    } else {
      // Обычный QR: /ustukan/19/84
      backUrl = `/${venueSlug}/${spotId}/${tableId}`;
    }
  }

  return (
    <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
      <Link
        href={backUrl}
        className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
      >
        <ChevronLeft size={24} />
      </Link>
      <span className='ml-4 font-bold text-lg'>Заказ #{orderId}</span>
    </header>
  );
}
