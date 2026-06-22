'use client';

import { FC } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  total: number;
  isSubmitting: boolean;
  /** Идёт серверный пересчёт — итог ненадёжен, оплату придерживаем. */
  isCalculating?: boolean;
  /** Внешняя блокировка (например, расчёт упал). */
  disabled?: boolean;
  onPay: () => void;
}

const CheckoutFooter: FC<Props> = ({
  total,
  isSubmitting,
  isCalculating = false,
  disabled = false,
  onPay,
}) => {
  const t = useTranslations('Cart.footer');
  const isBlocked = isSubmitting || isCalculating || disabled;
  const label = isSubmitting
    ? t('processing')
    : isCalculating
      ? t('updating')
      : t('pay');

  return (
    <div className='flex items-center gap-4'>
      <div className='flex flex-col'>
        <span className='text-xs text-gray-500 font-medium'>{t('totalDue')}</span>
        <span className='text-2xl font-bold text-[#111111]'>{total} сом</span>
      </div>

      <button
        onClick={onPay}
        disabled={isBlocked}
        className={`
          flex-1 h-14 rounded-2xl font-bold text-white text-lg shadow-lg
          transition-all active:scale-95 flex flex-row items-center justify-center gap-2 leading-tight
          focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none
          ${isBlocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand hover:brightness-110 hover:shadow-xl cursor-pointer'}
        `}
      >
        {label}
      </button>
    </div>
  );
};

export default CheckoutFooter;
