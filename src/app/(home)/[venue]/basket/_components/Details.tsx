import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useBasket } from '@/store/basket';
import { useVenueQuery } from '@/store/venue';

import arrow from '@/assets/Basket/details-arrow.svg';
import Image from 'next/image';

type DetailsProps = {
  orderType: 'takeout' | 'dinein' | 'delivery';
};

const Details = ({ orderType }: DetailsProps) => {
  const { getSubtotal } = useBasket();
  const { venue } = useVenueQuery();

  const detailsRef = useRef<HTMLDivElement | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsHeight, setDetailsHeight] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const subtotal = getSubtotal();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (detailsOpen) {
      const h = detailsRef.current?.scrollHeight ?? 0;
      setDetailsHeight(h);
    } else {
      setDetailsHeight(0);
    }
  }, [detailsOpen]);

  // Parse venue delivery fee and free-from threshold
  const { deliveryFeeApplied, deliveryFeeRaw } = useMemo(() => {
    const fee = typeof (venue as any)?.deliveryFixedFee === 'string'
      ? parseFloat((venue as any).deliveryFixedFee)
      : Number((venue as any)?.deliveryFixedFee ?? 0);

    const freeFrom = typeof (venue as any)?.deliveryFreeFrom === 'string'
      ? parseFloat((venue as any).deliveryFreeFrom)
      : (venue as any)?.deliveryFreeFrom != null
      ? Number((venue as any).deliveryFreeFrom)
      : null;

    const applied = orderType === 'delivery'
      ? (freeFrom != null && subtotal >= freeFrom ? 0 : (Number.isFinite(fee) ? fee : 0))
      : 0;

    return {
      deliveryFeeApplied: Number.isFinite(applied) ? applied : 0,
      deliveryFeeRaw: Number.isFinite(fee) ? fee : 0,
    };
  }, [orderType, subtotal, venue]);

  return (
    <div className='bg-[#FAFAFA] p-3 rounded-[12px] mt-3'>
      <button
        type='button'
        onClick={() => setDetailsOpen((v) => !v)}
        className='w-full flex items-center justify-between text-[#80868B]'
      >
        <span className='text-base font-medium'>Детали заказа</span>
        <span
          className={`inline-block transition-transform duration-300 ${
            detailsOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <Image src={arrow} alt='arrow' />
        </span>
      </button>

      <div
        ref={detailsRef}
        style={{ height: `${detailsHeight}px` }}
        className='overflow-hidden transition-[height] duration-300 ease-in-out mt-2 rounded-[8px]'
      >
        <div className='flex items-center justify-between px-3 py-2 text-[#80868B] border-t-[#E7E7E7] border-t pt-3'>
          <span>Сумма товаров</span>
          <span>{hydrated ? Math.round(subtotal * 100) / 100 : 0} c</span>
        </div>
        <div className='flex items-center justify-between px-3 py-2 text-[#80868B]'>
          <span>Сервисный сбор</span>
          <span>0%</span>
        </div>
        {orderType === 'delivery' && (
          <div className='flex items-center justify-between px-3 py-2 text-[#80868B]'>
            <span>Доставка</span>
            <span>
              {hydrated ? Math.round(deliveryFeeApplied * 100) / 100 : 0} c
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;
