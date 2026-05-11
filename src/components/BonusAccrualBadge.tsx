'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useVenueStore } from '@/store/venue';
import coinIcon from '@/assets/Widgets/widget-2.png';

interface Props {
  /** Сумма, с которой считаются баллы (итог после всех скидок). */
  total: number;
  className?: string;
}

export default function BonusAccrualBadge({ total, className = '' }: Props) {
  const t = useTranslations('Cart.summary');
  const venue = useVenueStore((s) => s.data);
  const accrualPercent = venue?.isBonusSystemEnabled
    ? (venue?.bonusAccrualPercent ?? 0)
    : 0;
  const earnedBonus =
    accrualPercent > 0 ? Math.floor((total * accrualPercent) / 100) : 0;

  if (earnedBonus <= 0) return null;

  return (
    <div
      className={`flex items-center justify-between bg-gradient-to-r from-brand/10 to-brand/5 border border-brand/20 rounded-xl px-4 py-3 ${className}`}
    >
      <div className='flex items-center gap-3'>
        <Image
          src={coinIcon}
          alt='bonus'
          width={28}
          height={28}
          className='object-contain'
        />
        <div className='flex flex-col'>
          <span className='text-sm font-bold text-[#111] leading-tight'>
            {t('earnBonus')}
          </span>
          <span className='text-[11px] text-gray-500'>{accrualPercent}%</span>
        </div>
      </div>
      <span className='text-lg font-extrabold text-brand'>+{earnedBonus}</span>
    </div>
  );
}
