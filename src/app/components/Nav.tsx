'use client'; // 1. Делаем клиентским

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getNavItems } from './Nav.helpers';
import ActiveLink from './ActiveLink';
import { useVenueStore } from '@/store/venue';

export default function Nav({ venueSlug }: { venueSlug: string }) {
  const t = useTranslations('Nav');
  // 3. Достаем контекст из стора
  const tableId = useVenueStore((state) => state.tableId);
  const spotId = useVenueStore((state) => state.spotId);
  const isKioskMode = useVenueStore((state) => state.isKioskMode);

  // 4. Генерируем правильный URL для главной
  let homeUrl = `/${venueSlug}`;

  if (tableId && spotId) {
    if (isKioskMode) {
      // Режим киоска: /ustukan/d/19/84
      homeUrl = `/${venueSlug}/d/${spotId}/${tableId}`;
    } else {
      // Обычный стол: /ustukan/19/84
      homeUrl = `/${venueSlug}/${spotId}/${tableId}`;
    }
  }

  // 5. Передаем этот URL в хелпер
  const items = getNavItems(venueSlug, homeUrl);

  return (
    <nav className='flex justify-around items-center w-full py-3 h-16'>
      {items.map((item) => {
        const label = t(item.key);
        return (
          <ActiveLink
            key={item.key}
            href={item.href}
            className='flex flex-col items-center flex-1'
          >
            <Image
              src={item.icon}
              alt={label}
              width={24}
              style={{ height: 'auto' }}
            />
            <span className='text-[10px] mt-1'>{label}</span>
          </ActiveLink>
        );
      })}
    </nav>
  );
}
