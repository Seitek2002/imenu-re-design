'use client';

import { FC } from 'react';
import { useTranslations } from 'next-intl';
import { useVenueStore } from '@/store/venue';

interface Props {
  total: number;
  isSubmitting: boolean;
  onPay: () => void;
}

const CheckoutFooter: FC<Props> = ({ total, isSubmitting, onPay }) => {
  const t = useTranslations('Cart.footer');
  const tCart = useTranslations('Cart');
  const venue = useVenueStore((s) => s.data);
  const accrualPercent = venue?.isBonusSystemEnabled ? (venue?.bonusAccrualPercent ?? 0) : 0;
  const earnedBonus = accrualPercent > 0 ? Math.floor((total * accrualPercent) / 100) : 0;
  return (
    <div className='flex items-center gap-4'>
      <div className='flex flex-col'>
        <span className='text-xs text-gray-500 font-medium'>{t('totalDue')}</span>
        <span className='text-2xl font-bold text-[#111111]'>{total} c.</span>
      </div>

      <button
        onClick={onPay}
        disabled={isSubmitting}
        className={`
          flex-1 h-14 rounded-2xl font-bold text-white text-lg shadow-lg
          transition-all active:scale-95 flex flex-row items-center justify-center gap-2 leading-tight
          ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand'}
        `}
      >
        {isSubmitting ? (
          <div className='flex items-center gap-2'>
            <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
            <span>{t('processing')}</span>
          </div>
        ) : (
          <>
            <span>{t('pay')}</span>
            {earnedBonus > 0 && (
              <span className='text-xs font-semibold opacity-90 px-2 py-0.5 rounded-full bg-white/20'>
                +{earnedBonus} {tCart('bonusShort')}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};

export default CheckoutFooter;
