'use client';
import { FC, useEffect, useMemo, useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import Image from 'next/image';

import Nav from './Nav';
import Link from 'next/link';
import { PAGES } from '@/config/pages.config';
import { useBasket } from '@/store/basket';

import bellIcon from '@/assets/Footer/bell.svg';
import { useVenueQuery } from '@/store/venue';
import { useCallWaiterV2 } from '@/lib/api/queries';
import { useCheckout } from '@/store/checkout';
import { useBasketTotals } from '@/lib/hooks/use-basket-totals';
import { useTranslation } from 'react-i18next';

const Footer: FC = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const params = useParams<{ venue?: string }>();
  const venueRoot = params?.venue ? `/${params.venue}` : '';
  const isHome = pathname === venueRoot;
  const collapsed = !isHome;

  const { tableId, tableNum } = useVenueQuery();
  const callWaiter = useCallWaiterV2();

  async function handleCallWaiter() {
    try {
      if (!tableId) return;
      const id =
        typeof tableId === 'string' ? Number.parseInt(tableId, 10) : tableId;
      if (!Number.isFinite(id as number)) {
        console.warn('Invalid tableId for call-waiter:', tableId);
        return;
      }
      await callWaiter.mutateAsync({ tableId: id as number });
    } catch (e) {
      console.error('call-waiter:v2:error', e);
    }
  }

  const isBasket = pathname === PAGES.BASKET(venueRoot);

  // pages allowed for Next button (/menu and /foods)
  const isMenuPage = pathname.startsWith(`${venueRoot}/menu`);
  const isFoodsPage = pathname.startsWith(`${venueRoot}/foods`);
  const isBasketPage = pathname.startsWith(`${venueRoot}/basket`);
  const allowNext = isMenuPage || isFoodsPage;

  // basket/hydration
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const itemsMap = useBasket((s) => s.items);
  const itemCount = useMemo(
    () => Object.values(itemsMap).reduce((acc, it) => acc + it.quantity, 0),
    [itemsMap]
  );
  const showNext = hydrated && itemCount > 0 && !isBasket && allowNext;

  // Order type and checkout sheet signal from shared store
  const orderType = useCheckout((s) => s.orderType);
  const { openSheet } = useCheckout();
  const { phone, address, bumpShake, setAddress } = useCheckout();

  // Single source of truth for totals
  const { total } = useBasketTotals(orderType);

  function handleOpenCheckout() {
    // Always open the drawer; validation, shaking, and vibration happen inside DrawerCheckout on Pay
    openSheet();
  }

  return (
    <footer className='fixed -bottom-6 left-0 right-0 flex flex-col items-center z-10'>
      <div
        className='flex w-full items-center'
        style={{
          justifyContent: collapsed ? 'space-between' : 'center',
        }}
      >
        <div
          className='p-2.5 overflow-hidden transition-all duration-500'
          style={{
            maxHeight: showNext ? 80 : 0,
            padding: showNext ? '10px' : '0',
            paddingBottom: showNext ? '10px' : '0',
            width: showNext ? '70%' : '0%',
          }}
        >
          <Link
            href={PAGES.BASKET(venueRoot)}
            className='block text-center bg-[#FF7A00] text-white rounded-3xl py-3.5 font-semibold'
            style={{ opacity: showNext ? 1 : 0, transition: 'opacity 500ms' }}
          >
            {t('goToBasket')} · {Math.round(total * 100) / 100} c
          </Link>
        </div>
        {tableId && (
          <button
            aria-label='Позвать официанта'
            onClick={handleCallWaiter}
            disabled={callWaiter.isPending}
            aria-busy={callWaiter.isPending}
            className={`group flex items-center min-w-10 bg-[#FF8127] text-white rounded-3xl overflow-hidden transition-all duration-1000 ${
              collapsed ? 'p-4 mr-2' : 'py-4 px-11 gap-2'
            } ${callWaiter.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Image src={bellIcon} alt='bell icon' />
            <span
              className={`whitespace-nowrap transition-all duration-1000 ${
                collapsed
                  ? 'max-w-0 opacity-0 ml-0'
                  : 'max-w-[300px] opacity-100 ml-2'
              }`}
            >
              {t('callWaiter', { table: tableNum ?? tableId })}
            </span>
          </button>
        )}
        {isBasketPage && (
          <div className='w-full flex items-center gap-3 p-4 bg-white rounded-t-2xl'>
            <div className='total-price'>
              <div className='font-semibold text-xl'>
                {Math.round(total * 100) / 100} с
              </div>
              <div className='text-[#939393] text-xs'>{t('total')}</div>
            </div>
            <button
              className='bg-[#FF8127] py-4 text-white rounded-3xl flex-1 font-medium'
              onClick={handleOpenCheckout}
            >
              {t('checkoutProceed')}
            </button>
          </div>
        )}
      </div>
      <Nav />
    </footer>
  );
};

export default Footer;
