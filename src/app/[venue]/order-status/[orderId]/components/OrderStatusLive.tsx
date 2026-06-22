'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useVenueStore } from '@/store/venue';
import { OrderV2 } from '@/lib/order';
import { OrderStatus } from '@/types/api';
import { useOrderByIdV2 } from '@/lib/api/queries';
import StatusProgressBar from './StatusProgressBar';
import OrderItemsList from './OrderItemsList';
import OrderBreakdown from './OrderBreakdown';
import PaymentCountdown from './PaymentCountdown';
import PaymentResumeAction from './PaymentResumeAction';
import { markPaymentSuccess } from './PaymentSuccessOverlay';
import { getPendingPayment } from '@/lib/payment-link-store';

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

  const prevStatusRef = useRef<number>(initialOrder.status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (
      prev === OrderStatus.PendingPayment &&
      order.status !== OrderStatus.PendingPayment &&
      order.status !== OrderStatus.Cancelled
    ) {
      markPaymentSuccess(order.id);
    }
    prevStatusRef.current = order.status;
  }, [order.status, order.id, initialOrder.status]);

  // Быстрая оплата: бэк может провести платёж раньше, чем пользователь вернётся
  // на эту страницу. Тогда SSR уже отдаёт не-pending статус, live-перехода
  // (эффект выше) не происходит — и экран успеха терялся. Если для заказа есть
  // локальная отметка «мы уводили на шлюз» (savePendingPayment ставит её перед
  // редиректом) и заказ уже в успешном состоянии — показываем успех явно.
  // При просмотре оплаченного заказа из истории отметки нет → ложно не сработает.
  useEffect(() => {
    if (!getPendingPayment(order.id)) return;
    const succeeded =
      order.paymentStatus === 'paid' ||
      (order.status !== OrderStatus.PendingPayment &&
        order.status !== OrderStatus.Cancelled);
    if (succeeded) markPaymentSuccess(order.id);
    // Только на маунте: ловим уже-успешное состояние из SSR; дальнейшие
    // переходы покрывает эффект выше.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {isPendingPayment && (
        <PaymentResumeAction
          orderId={order.id}
          paymentUrl={order.paymentUrl}
          paymentStatus={order.paymentStatus}
          paymentExpiresAt={order.paymentExpiresAt}
        />
      )}
      <OrderItemsList items={order.orderProducts} />
      <OrderBreakdown order={order} />

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
