'use client';
import { FC, useEffect, useMemo, useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import Nav from './Nav';
import { PAGES } from '@/config/pages.config';
import { useBasket } from '@/store/basket';
import { useVenueQuery } from '@/store/venue';
import { useCallWaiterV2 } from '@/lib/api/queries';
import { useCheckout } from '@/store/checkout';
import { useBasketTotals } from '@/lib/hooks/use-basket-totals';
import { useTranslation } from 'react-i18next';
import ModalPortal from '@/components/ui/ModalPortal';

import bellIcon from '@/assets/Footer/bell.svg';
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

  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const itemsMap = useBasket((s) => s.items);
  const itemCount = useMemo(
    () => Object.values(itemsMap).reduce((acc, it) => acc + it.quantity, 0),
    [itemsMap]
  );

  const isBasketPage = pathname.startsWith(`${venueRoot}/basket`);
  const isBasket = pathname === PAGES.BASKET(venueRoot);
  const allowNext =
    pathname.startsWith(`${venueRoot}/menu`) ||
    pathname.startsWith(`${venueRoot}/foods`);
  const showNext = hydrated && itemCount > 0 && !isBasket && allowNext;

  const orderType = useCheckout((s) => s.orderType);
  const { openSheet } = useCheckout();
  const { total } = useBasketTotals(orderType);

  async function handleCallWaiter() {
    try {
      if (!tableId) return;
      const id =
        typeof tableId === 'string' ? Number.parseInt(tableId, 10) : tableId;
      if (!Number.isFinite(id)) return;
      await callWaiter.mutateAsync({ tableId: id });
      setShowWaiterModal(true);
    } catch (e) {
      console.error('call-waiter:error', e);
    }
  }

  return (
    <footer className='fixed -bottom-6 left-0 right-0 flex flex-col items-center z-50 max-w-[700px] mx-auto'>
      <div
        className='flex w-full items-center pointer-events-auto'
        style={{ justifyContent: collapsed ? 'space-between' : 'center' }}
      >
        {/* Блок корзины (если мы уже в ней) */}
        {isBasketPage && (
          <div className='w-full flex items-center gap-3 p-4 bg-white rounded-t-2xl shadow-lg'>
            <div className='total-price'>
              <div className='font-semibold text-xl'>
                {Math.round(total * 100) / 100} с
              </div>
              <div className='text-[#939393] text-xs'>{t('total')}</div>
            </div>
            {hydrated && itemCount > 0 && (
              <button
                className='bg-brand py-4 text-white rounded-3xl flex-1 font-medium active:scale-95 transition-transform'
                onClick={openSheet}
              >
                {t('checkoutProceed')}
              </button>
            )}
          </div>
        )}

        {/* ОПТИМИЗИРОВАННАЯ КНОПКА "В КОРЗИНУ" */}
        <div
          className='relative flex items-center transition-all duration-500 ease-out will-change-[transform,opacity]'
          style={{
            flex: showNext ? '1 1 70%' : '0 0 0%',
            opacity: showNext ? 1 : 0,
            transform: showNext
              ? 'translateY(0) scale(1)'
              : 'translateY(20px) scale(0.95)',
            pointerEvents: showNext ? 'auto' : 'none',
            display: showNext ? 'flex' : 'none',
          }}
        >
          <Link
            href={PAGES.BASKET(venueRoot)}
            className='w-full text-center bg-brand text-white rounded-3xl py-3.5 font-semibold shadow-md active:scale-95 transition-transform'
          >
            {t('goToBasket')} · {Math.round(total * 100) / 100} c
          </Link>
        </div>

        {/* ОПТИМИЗИРОВАННАЯ КНОПКА ОФИЦИАНТА */}
        {tableId && (
          <button
            onClick={handleCallWaiter}
            disabled={callWaiter.isPending}
            className={`group flex items-center bg-brand text-white rounded-3xl transition-all duration-500 shadow-md will-change-transform active:scale-95 ${
              collapsed ? 'p-4' : 'py-4 px-8 gap-2'
            } ${callWaiter.isPending ? 'opacity-70' : ''}`}
          >
            <Image src={bellIcon} alt='bell' className='shrink-0' />

            {/* Маскирование текста через Grid для плавности без Reflow */}
            <div
              className={`grid transition-all duration-500 ease-in-out ${
                collapsed
                  ? 'grid-cols-[0fr] opacity-0'
                  : 'grid-cols-[1fr] opacity-100 ml-2'
              }`}
            >
              <span className='overflow-hidden whitespace-nowrap font-medium'>
                {t('callWaiter', { table: tableNum ?? tableId })}
              </span>
            </div>
          </button>
        )}
      </div>

      <Nav />

      {/* Модалка осталась без изменений, она вне основного потока анимации */}
      <ModalPortal
        open={showWaiterModal}
        onClose={() => setShowWaiterModal(false)}
        zIndex={100}
      >
        {/* ... (код модалки) ... */}
        <div className='relative flex flex-col items-center gap-3 p-6 bg-white rounded-3xl'>
          <button
            onClick={() => setShowWaiterModal(false)}
            className='absolute top-4 right-4 text-xl'
          >
            ✕
          </button>
          <Image src={okIcon} alt='ok' />
          <h3 className='text-lg font-bold'>{t('waiterCalled')}</h3>
          <button
            onClick={() => setShowWaiterModal(false)}
            className='bg-brand text-white px-8 py-2 rounded-xl'
          >
            OK
          </button>
        </div>
      </ModalPortal>
    </footer>
  );
};

export default Footer;
