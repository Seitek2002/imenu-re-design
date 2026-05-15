'use client';

import { FC, useState, useEffect, useRef } from 'react';
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

  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = () => {
    if (isSubmitting) return;
    if (!confirming) {
      setConfirming(true);
      timerRef.current = setTimeout(() => setConfirming(false), 3000);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setConfirming(false);
    onPay();
  };

  return (
    <div className='flex items-center gap-4'>
      <div className='flex flex-col'>
        <span className='text-xs text-gray-500 font-medium'>{t('totalDue')}</span>
        <span className='text-2xl font-bold text-[#111111]'>{total} c.</span>
      </div>

      <button
        onClick={handleClick}
        disabled={isSubmitting}
        className={`
          flex-1 h-14 rounded-2xl font-bold text-white text-lg shadow-lg
          transition-all active:scale-95 flex flex-row items-center justify-center gap-2 leading-tight
          ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : confirming ? 'bg-green-600 animate-pulse' : 'bg-brand'}
        `}
      >
        {isSubmitting ? (
          <span>{t('processing')}</span>
        ) : confirming ? (
          <span>{t('confirm')}</span>
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
