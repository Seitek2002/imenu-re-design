'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, Loader2 } from 'lucide-react';
import {
  clearPendingPayment,
  getPendingPayment,
} from '@/lib/payment-link-store';
import { useCancelOrderV2 } from '@/lib/api/queries';

interface Props {
  orderId: number;
  /** ISO-8601 from order.paymentExpiresAt; if null, treated as still valid. */
  expiresAt?: string | null;
  /** Payment URL coming from the backend (order.paymentUrl). Used as a fallback when no link is cached locally. */
  paymentUrl?: string | null;
}

function isExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  const target = new Date(expiresAt).getTime();
  if (Number.isNaN(target)) return false;
  return target <= Date.now();
}

export default function PaymentResumeAction({ orderId, expiresAt, paymentUrl: paymentUrlProp }: Props) {
  const t = useTranslations('OrderStatus');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(paymentUrlProp ?? null);
  const [, setNow] = useState(() => Date.now());
  const [cancelError, setCancelError] = useState<string | null>(null);

  const cancelMutation = useCancelOrderV2();

  useEffect(() => {
    // Бэк — источник правды (Kuma 2026-05-24 §3): order.paymentUrl выживает
    // через смену устройства и очистку localStorage. На localStorage падаем
    // только если бэк его ещё не вернул (e.g. сразу после createOrder, до
    // первого рефетча).
    const saved = getPendingPayment(orderId);
    setPaymentUrl(paymentUrlProp ?? saved?.paymentUrl ?? null);
  }, [orderId, paymentUrlProp]);

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!paymentUrl) return null;
  if (isExpired(expiresAt)) return null;

  const handleResume = () => {
    window.location.href = paymentUrl;
  };

  const handleCancel = async () => {
    setCancelError(null);
    try {
      await cancelMutation.mutateAsync(orderId);
      clearPendingPayment(orderId);
      setPaymentUrl(null);
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
        className='w-full h-10 rounded-xl text-[#6B6B6B] text-sm font-medium active:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5'
      >
        {cancelMutation.isPending && <Loader2 size={14} className='animate-spin' />}
        {t('cancelResume')}
      </button>
      {cancelError && (
        <p className='text-center text-xs text-red-500'>{cancelError}</p>
      )}
    </div>
  );
}
