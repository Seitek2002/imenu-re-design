'use client'; // 1. Делаем клиентским

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getNavItems } from './Nav.helpers';
import ActiveLink from './ActiveLink';
import { useVenueStore } from '@/store/venue';
import { useBasketStore } from '@/store/basket';
import { useUiFloatingStore } from '@/store/ui-floating';
import { useMounted } from '@/hooks/useMounted';

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
  const items = getNavItems(venueSlug, homeUrl, !!tableId);

  const totalItems = useBasketStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  );
  const mounted = useMounted();
  const cartCount = mounted ? totalItems : 0;
  const hasOpenBill = useUiFloatingStore((s) => s.hasOpenBill);

  return (
    <nav className='flex justify-around items-center w-full py-3 h-16 lg:w-auto lg:justify-start lg:gap-1 lg:px-2 lg:py-2 lg:h-auto'>
      {items.map((item) => {
        const label = t(item.key);
        return (
          <ActiveLink
            key={item.key}
            href={item.href}
            className='flex flex-col items-center flex-1 lg:flex-none lg:px-4 lg:py-2 lg:rounded-2xl lg:hover:bg-gray-100 lg:focus-visible:bg-gray-100 lg:focus-visible:outline-none lg:transition-colors'
          >
            <div className='relative'>
              <Image
                src={item.icon}
                alt={label}
                width={24}
                style={{ height: 'auto' }}
              />
              {item.key === 'cart' && cartCount > 0 && (
                <span className='absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none'>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
              {item.key === 'cart' && cartCount === 0 && hasOpenBill && (
                <span className='absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white' />
              )}
            </div>
            <span className='text-[10px] mt-1'>{label}</span>
          </ActiveLink>
        );
      })}
    </nav>
  );
}
