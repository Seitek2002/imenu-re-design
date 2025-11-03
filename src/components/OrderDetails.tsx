'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import arrow from '@/assets/Basket/details-arrow.svg';
import { formatCurrency } from '@/lib/utils/pricing';

type OrderTypeUnion = 'takeout' | 'dinein' | 'delivery';

export type OrderDetailsProps = {
  orderType: OrderTypeUnion;
  subtotal: number;
  deliveryFee?: number;
  hydrated?: boolean;
  className?: string;
  title?: string;
};

const OrderDetails: React.FC<OrderDetailsProps> = ({
  orderType,
  subtotal,
  deliveryFee = 0,
  hydrated = true,
  className,
  title = 'Детали заказа',
}) => {
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsHeight, setDetailsHeight] = useState(0);

  useEffect(() => {
    if (detailsOpen) {
      const h = detailsRef.current?.scrollHeight ?? 0;
      setDetailsHeight(h);
    } else {
      setDetailsHeight(0);
    }
  }, [detailsOpen]);

  return (
    <div className={`bg-[#FAFAFA] p-3 rounded-[12px] mt-3 ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(50);
          setDetailsOpen((v) => !v);
        }}
        className="w-full flex items-center justify-between text-[#80868B]"
      >
        <span className="text-base font-medium">{title}</span>
        <span
          className={`inline-block transition-transform duration-300 ${
            detailsOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <Image src={arrow} alt="arrow" />
        </span>
      </button>

      <div
        ref={detailsRef}
        style={{ height: `${detailsHeight}px` }}
        className="overflow-hidden transition-[height] duration-300 ease-in-out mt-2 rounded-[8px]"
      >
        <div className="flex items-center justify-between px-3 py-2 text-[#80868B] border-t-[#E7E7E7] border-t pt-3">
          <span>Сумма товаров</span>
          <span>{hydrated ? formatCurrency(subtotal) : formatCurrency(0)}</span>
        </div>
        <div className="flex items-center justify-between px-3 py-2 text-[#80868B]">
          <span>Сервисный сбор</span>
          <span>0%</span>
        </div>
        {orderType === 'delivery' && (
          <div className="flex items-center justify-between px-3 py-2 text-[#80868B]">
            <span>Доставка</span>
            <span>
              {hydrated ? formatCurrency(Math.max(0, deliveryFee)) : formatCurrency(0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
