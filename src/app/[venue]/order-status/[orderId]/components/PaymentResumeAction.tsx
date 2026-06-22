'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, Loader2 } from 'lucide-react';
import {
  clearPendingPayment,
  getPendingPayment,
} from '@/lib/payment-link-store';
import { useCancelOrderV2 } from '@/lib/api/queries';
import { startPaymentRedirect } from '@/store/payment-redirect';
import type { PaymentStatus } from '@/lib/order';

interface Props {
  orderId: number;
  /** Payment URL coming from the backend (order.paymentUrl). Used as a fallback when no link is cached locally. */
  paymentUrl?: string | null;
  /** Платёжный статус заказа. Если терминальный — оплачивать уже нельзя. */
  paymentStatus?: PaymentStatus;
  /** ISO-дедлайн инвойса. Если в прошлом — окно оплаты закрыто. */
  paymentExpiresAt?: string | null;
}

/** Статусы, в которых оплата ещё возможна. Остальные — терминальные. */
const PAYABLE_STATUSES: ReadonlySet<PaymentStatus> = new Set([
  'pending',
  'processing',
]);

export default function PaymentResumeAction({
  orderId,
  paymentUrl: paymentUrlProp,
  paymentStatus,
  paymentExpiresAt,
}: Props) {
  const t = useTranslations('OrderStatus');

  // Оплатить уже нельзя, если бэк выставил терминальный paymentStatus
  // (failed/expired/cancelled/paid/not_required) или истёк дедлайн инвойса —
  // в этом окне (до cron'а Kuma 2026-05-25 §5.1) status может ещё быть 4,
  // но кэш в sessionStorage хранит протухший paymentUrl. Не воскрешаем его.
  const isExpired = paymentExpiresAt
    ? new Date(paymentExpiresAt).getTime() <= Date.now()
    : false;
  const canPay =
    !isExpired && (paymentStatus == null || PAYABLE_STATUSES.has(paymentStatus));

  // Бэк — источник правды (Kuma 2026-05-24 §3 / 2026-05-25 §1.4):
  // paymentUrl выживает через смену устройства и сам становится null
  // на любом терминальном статусе. На sessionStorage падаем только если
  // бэк его ещё не вернул (e.g. сразу после createOrder).
  const fromBackend =
    paymentUrlProp ??
    (typeof window !== 'undefined'
      ? getPendingPayment(orderId)?.paymentUrl
      : null) ??
    null;
  const [cancelled, setCancelled] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const cancelMutation = useCancelOrderV2();

  const paymentUrl = cancelled || !canPay ? null : fromBackend;
  if (!paymentUrl) return null;

  const handleResume = () => {
    startPaymentRedirect(paymentUrl);
  };

  const handleCancel = async () => {
    setCancelError(null);
    try {
      await cancelMutation.mutateAsync(orderId);
      clearPendingPayment(orderId);
      setCancelled(true);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : t('cancelError'));
    }
  };

  return (
    <div className='mt-4 flex flex-col gap-2'>
      <button
        type='button'
        onClick={handleResume}
        className='w-full h-12 rounded-xl bg-brand text-white font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md'
      >
        <CreditCard size={18} />
        {t('resumePayment')}
      </button>
      <button
        type='button'
        onClick={handleCancel}
        disabled={cancelMutation.isPending}
        className='w-full h-10 rounded-xl text-red-600 text-sm font-semibold active:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5'
      >
        {cancelMutation.isPending && <Loader2 size={14} className='animate-spin' />}
        {t('cancelResume')}
      </button>
      {cancelError && (
        <p className='text-center text-xs text-red-600'>{cancelError}</p>
      )}
    </div>
  );
}
