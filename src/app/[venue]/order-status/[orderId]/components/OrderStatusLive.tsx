'use client';

import { useTranslations } from 'next-intl';
import { OrderV2 } from '@/lib/order';
import { useOrderByIdV2 } from '@/lib/api/queries';
import StatusProgressBar from './StatusProgressBar';
import OrderItemsList from './OrderItemsList';

interface Props {
  initialOrder: OrderV2;
}

export default function OrderStatusLive({ initialOrder }: Props) {
  const t = useTranslations('OrderStatus');
  const { data } = useOrderByIdV2(initialOrder.id, initialOrder);
  const order = data ?? initialOrder;

  return (
    <>
      <StatusProgressBar
        serviceMode={order.serviceMode}
        status={order.status}
      />
      <OrderItemsList items={order.orderProducts} />
      <div className='bg-white rounded-[20px] p-5 mt-4 shadow-sm flex justify-between items-center'>
        <span className='text-gray-500 font-medium'>{t('totalDue')}</span>
        <span className='text-2xl font-bold text-brand'>
          {order.totalPrice} с.
        </span>
      </div>
    </>
  );
}
