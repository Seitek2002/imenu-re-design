'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, Clock } from 'lucide-react';

interface Props {
  paymentUrl: string;
  expiresAt: string | null | undefined;
}

/**
 * Кнопка «Продолжить оплату» на странице деталей заказа.
 * Показывает countdown до paymentExpiresAt; после истечения превращается
 * в disabled-плашку. Клик ведёт на paymentUrl (FreedomPay / ELQR redirect).
 */
export default function PayNowButton({ paymentUrl, expiresAt }: Props) {
  const t = useTranslations('OrderDetail');
  const target = expiresAt ? new Date(expiresAt).getTime() : NaN;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    // первый тик придёт через секунду — это ок, countdown стартанёт чуть позже,
    // зато не дёргаем setState синхронно в effect (react-hooks/set-state-in-effect).
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const remaining = Number.isNaN(target) || now === null ? null : target - now;
  const expired = remaining != null && remaining <= 0;

  let timeText = '';
  if (remaining != null && !expired) {
    const total = Math.floor(remaining / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    timeText = `${m}:${s.toString().padStart(2, '0')}`;
  }

  if (expired) {
    return (
      <div className='w-full h-12 rounded-2xl bg-[#FDECEC] text-[#DC2626] inline-flex items-center justify-center gap-2 text-[14px] font-semibold'>
        <Clock size={18} />
        {t('paymentExpired')}
      </div>
    );
  }

  return (
    <a
      href={paymentUrl}
      className='w-full h-12 rounded-2xl bg-[#21201F] text-white text-[14px] font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.99] transition-transform'
    >
      <CreditCard size={18} />
      {timeText ? t('payNowWithTime', { time: timeText }) : t('payNow')}
    </a>
  );
}
