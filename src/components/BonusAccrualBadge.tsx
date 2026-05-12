'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useVenueStore } from '@/store/venue';
import coinIcon from '@/assets/Widgets/widget-2.png';

interface Props {
  /** Сумма, с которой считаются баллы (итог после всех скидок). Используется как fallback. */
  total: number;
  /** Точное значение из серверного /calculate/ (учитывает clientGroup). Если задано — используется вместо локального расчёта. */
  bonusEarned?: number;
  /** Процент начисления из серверного /calculate/ (учитывает Poster clientGroup). */
  bonusAccrualPercent?: number;
  className?: string;
}

export default function BonusAccrualBadge({
  total,
  bonusEarned,
  bonusAccrualPercent,
  className = '',
}: Props) {
  const t = useTranslations('Cart.summary');
  const venue = useVenueStore((s) => s.data);
  // Серверный процент — приоритет (учитывает clientGroup из Poster).
  // Если backend не прислал — fallback на venue.bonusAccrualPercent.
  const accrualPercent =
    bonusAccrualPercent != null && bonusAccrualPercent >= 0
      ? bonusAccrualPercent
      : venue?.isBonusSystemEnabled
        ? (venue?.bonusAccrualPercent ?? 0)
        : 0;
  const earnedBonus =
    bonusEarned != null
      ? bonusEarned
      : accrualPercent > 0
        ? Math.floor((total * accrualPercent) / 100)
        : 0;

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
