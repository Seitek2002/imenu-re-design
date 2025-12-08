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
import ModalPortal from '@/components/ui/ModalPortal';
import okIcon from '@/assets/OrderStatus/check.svg';

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
      setShowWaiterModal(true);
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

  // Single source of truth for totals
  const { total } = useBasketTotals(orderType);

  const [showWaiterModal, setShowWaiterModal] = useState(false);

  function handleOpenCheckout() {
    // Always open the drawer; validation, shaking, and vibration happen inside DrawerCheckout on Pay
    openSheet();
  }

  return (
    <footer className='fixed -bottom-6 left-0 right-0 flex flex-col items-center z-10 max-w-[700px] mx-auto'>
      <div
        className='flex w-full items-center'
        style={{
          justifyContent: collapsed ? 'space-between' : 'center',
        }}
      >
        {isBasketPage && (
          <div
            className='w-full flex items-center gap-3 p-4 bg-white rounded-t-2xl'
            style={{ marginRight: tableId ? '10px' : '0px' }}
          >
            <div className='total-price'>
              <div className='font-semibold text-xl'>
                {Math.round(total * 100) / 100} с
              </div>
              <div className='text-[#939393] text-xs'>{t('total')}</div>
            </div>
            {hydrated && itemCount > 0 && (
              <button
                className='bg-brand py-4 text-white rounded-3xl flex-1 font-medium'
                onClick={handleOpenCheckout}
              >
                {t('checkoutProceed')}
              </button>
            )}
          </div>
        )}
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
            className='block text-center bg-brand text-white rounded-3xl py-3.5 font-semibold'
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
            className={`group flex items-center min-w-10 bg-brand text-white rounded-3xl overflow-hidden transition-all duration-1000 ${
              collapsed ? 'p-4 mr-2 mb-0' : 'py-4 px-11 gap-2 mb-2.5'
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
      </div>
      <Nav />

      <ModalPortal
        open={showWaiterModal}
        onClose={() => setShowWaiterModal(false)}
        zIndex={100}
      >
        <button
          type='button'
          aria-label='Закрыть'
          onClick={() => setShowWaiterModal(false)}
          className='absolute top-2 right-2 h-8 w-8 rounded-full bg-[#F5F5F5] text-[#111111] flex items-center justify-center'
        >
          ✕
        </button>
        <div className='flex flex-col items-center gap-3 p-4'>
          <Image src={okIcon} alt='ok' />
          <h3 className='text-base font-semibold'>
            {t('waiterCalled', { defaultValue: 'Официант вызван' })}
          </h3>
          <button
            type='button'
            onClick={() => setShowWaiterModal(false)}
            className='mt-1 bg-brand text-white rounded-2xl py-2 px-4'
          >
            OK
          </button>
        </div>
      </ModalPortal>
    </footer>
  );
};

export default Footer;
