'use client';

import { useTranslations } from 'next-intl';
import { CreditCard } from 'lucide-react';

interface Props {
  paymentUrl: string;
}

/**
 * Кнопка «Продолжить оплату» на странице деталей заказа.
 * Kuma 2026-05-25 §1.4: `paymentUrl` приходит из бэка только для живых
 * инвойсов — на любом терминальном статусе бэк его сам обнуляет, так
 * что фронту достаточно проверить наличие URL.
 */
export default function PayNowButton({ paymentUrl }: Props) {
  const t = useTranslations('OrderDetail');
  return (
    <a
      href={paymentUrl}
      className='w-full h-12 rounded-2xl bg-[#21201F] text-white text-[14px] font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.99] transition-transform'
    >
      <CreditCard size={18} />
      {t('payNow')}
    </a>
  );
}
