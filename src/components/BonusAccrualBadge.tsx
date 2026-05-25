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
  // Серверный процент — приоритет, но только если он > 0. Backend возвращает
  // bonusAccrualPercent=0 / bonusEarned=0 для анонимных гостей (без phone /
  // clientGroup) — в этом случае показываем venue-дефолт, иначе бейдж всегда
  // прятался бы для незалогиненных.
  const accrualPercent =
    bonusAccrualPercent != null && bonusAccrualPercent > 0
      ? bonusAccrualPercent
      : venue?.isBonusSystemEnabled
        ? (venue?.bonusAccrualPercent ?? 0)
        : 0;
  const earnedBonus =
    bonusEarned != null && bonusEarned > 0
      ? bonusEarned
      : accrualPercent > 0
        ? Math.floor((total * accrualPercent) / 100)
        : 0;

  if (earnedBonus <= 0) return null;

  return (
    <div
      className={`flex items-center justify-between bg-gradient-to-r from-emerald-50 to-emerald-50/60 border border-emerald-500 rounded-xl px-4 py-2.5 ${className}`}
    >
      <div className='flex items-center gap-2'>
        <Image
          src={coinIcon}
          alt='bonus'
          width={22}
          height={22}
          className='object-contain'
        />
        <span className='text-sm font-semibold text-[#111]'>
          {t('earnBonus')}
        </span>
      </div>
      <div className='flex items-center gap-1.5'>
        <span className='text-sm text-gray-400'>{accrualPercent}%</span>
        <span className='text-gray-300 text-sm'>→</span>
        <span className='text-base font-extrabold text-brand'>+{earnedBonus}</span>
      </div>
    </div>
  );
}
