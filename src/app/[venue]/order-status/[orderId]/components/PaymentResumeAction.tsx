'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard } from 'lucide-react';
import {
  clearPendingPayment,
  getPendingPayment,
} from '@/lib/payment-link-store';

interface Props {
  orderId: number;
  /** ISO-8601 from order.paymentExpiresAt; if null, treated as still valid. */
  expiresAt?: string | null;
  /** Payment URL coming from the backend (order.paymentUrl). Used as a fallback when no link is cached locally — e.g. opened from /history on another device. */
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

  useEffect(() => {
    const saved = getPendingPayment(orderId);
    setPaymentUrl(saved?.paymentUrl ?? paymentUrlProp ?? null);
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

  const handleDismiss = () => {
    clearPendingPayment(orderId);
    setPaymentUrl(null);
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
        onClick={handleDismiss}
        className='w-full h-10 rounded-xl text-[#6B6B6B] text-sm font-medium active:bg-gray-100 transition-colors'
      >
        {t('cancelResume')}
      </button>
    </div>
  );
}
