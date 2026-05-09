'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useVenueStore } from '@/store/venue';
import { OrderV2 } from '@/lib/order';
import { OrderStatus } from '@/types/api';
import { useOrderByIdV2 } from '@/lib/api/queries';
import StatusProgressBar from './StatusProgressBar';
import OrderItemsList from './OrderItemsList';
import PaymentCountdown from './PaymentCountdown';

interface Props {
  initialOrder: OrderV2;
}

export default function OrderStatusLive({ initialOrder }: Props) {
  const t = useTranslations('OrderStatus');
  const params = useParams();
  const venueSlug = params.venue as string;
  const { data } = useOrderByIdV2(initialOrder.id, initialOrder);
  const order = data ?? initialOrder;

  const tableId = useVenueStore((s) => s.tableId);
  const spotId = useVenueStore((s) => s.spotId);
  const isKioskMode = useVenueStore((s) => s.isKioskMode);

  const isCompleted = order.status === OrderStatus.Completed;
  const isPendingPayment = order.status === OrderStatus.PendingPayment;

  let backUrl = `/${venueSlug}`;
  if (tableId && spotId) {
    backUrl = isKioskMode
      ? `/${venueSlug}/d/${spotId}/${tableId}`
      : `/${venueSlug}/${spotId}/${tableId}`;
  }

  return (
    <>
      <StatusProgressBar
        serviceMode={order.serviceMode}
        status={order.status}
      />
      {isPendingPayment && order.paymentExpiresAt && (
        <PaymentCountdown expiresAt={order.paymentExpiresAt} />
      )}
      <OrderItemsList items={order.orderProducts} />
      <div className='bg-white rounded-[20px] p-5 mt-4 shadow-sm flex justify-between items-center'>
        <span className='text-gray-500 font-medium'>{t('totalDue')}</span>
        <span className='text-2xl font-bold text-brand'>
          {order.totalPrice} с.
        </span>
      </div>

      {isCompleted && (
        <Link
          href={backUrl}
          className='mt-4 w-full flex items-center justify-center h-12 rounded-xl bg-brand text-white font-bold text-base active:scale-95 transition-transform'
        >
          {t('backToMenu')}
        </Link>
      )}
    </>
  );
}
