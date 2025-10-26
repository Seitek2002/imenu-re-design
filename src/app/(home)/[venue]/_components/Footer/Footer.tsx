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

const Footer: FC = () => {
  const pathname = usePathname();
  const params = useParams<{ venue?: string }>();
  const venueRoot = params?.venue ? `/${params.venue}` : '';
  const isHome = pathname === venueRoot;
  const collapsed = !isHome;

  const { venue, tableId, tableNum } = useVenueQuery();
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
      const res = await callWaiter.mutateAsync({ tableId: id as number });
      console.log('call-waiter:v2:success', res);
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

  // subtotal for "Перейти в корзину"
  const subtotal = useMemo(
    () =>
      Object.values(itemsMap).reduce(
        (acc, it) => acc + it.unitPrice * it.quantity,
        0
      ),
    [itemsMap]
  );

  // Order type shared from checkout store
  const orderType = useCheckout((s) => s.orderType);

  // Delivery fee calculation using venue data when delivery mode
  const deliveryFee = useMemo(() => {
    const fee =
      typeof (venue as any)?.deliveryFixedFee === 'string'
        ? parseFloat((venue as any).deliveryFixedFee)
        : Number((venue as any)?.deliveryFixedFee ?? 0);

    const freeFrom =
      typeof (venue as any)?.deliveryFreeFrom === 'string'
        ? parseFloat((venue as any).deliveryFreeFrom)
        : (venue as any)?.deliveryFreeFrom != null
        ? Number((venue as any).deliveryFreeFrom)
        : null;

    if (orderType !== 'delivery') return 0;
    if (freeFrom != null && subtotal >= freeFrom) return 0;
    return Number.isFinite(fee) ? fee : 0;
  }, [orderType, subtotal, venue]);

  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

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
            Перейти в корзину · {Math.round(total * 100) / 100} c
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
              Позвать официанта к <b>{tableNum ?? tableId} столику</b>
            </span>
          </button>
        )}
        {isBasketPage && (
          <div className='w-full flex items-center gap-3 p-4 bg-white rounded-t-2xl'>
            <div className='total-price'>
              <div className='font-semibold text-xl'>
                {Math.round(total * 100) / 100} с
              </div>
              <div className='text-[#939393] text-xs'>Итого</div>
            </div>
            <button className='bg-[#FF8127] py-4 text-white rounded-3xl flex-1 font-medium'>
              К оформлению
            </button>
          </div>
        )}
      </div>
      <Nav />
    </footer>
  );
};

export default Footer;
