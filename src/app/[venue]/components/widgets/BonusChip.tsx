'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface Props {
  balance: number;
  accrualPercent: number;
  venueSlug: string;
  locale: string;
}

const fmt = (n: number, locale: string) =>
  n
    .toLocaleString(locale === 'en' ? 'en-US' : 'ru-RU')
    .replace(/,/g, ' ');

export default function BonusChip({
  balance,
  accrualPercent,
  venueSlug,
  locale,
}: Props) {
  const t = useTranslations('Widgets');
  return (
    <Link
      href={`/${venueSlug}/profile/points`}
      className='relative overflow-hidden rounded-[18px] bg-white p-3.5 shadow-[0_1px_0_rgba(40,28,16,0.04),_0_8px_20px_-16px_rgba(40,28,16,0.10)] active:scale-[0.985] transition-transform cursor-pointer block'
    >
      <div className='flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[#8E8780]'>
        <span
          aria-hidden
          className='h-2 w-2 rounded-full shadow-inner'
          style={{ background: 'linear-gradient(140deg, #E8C99B, #8E6A3D)' }}
        />
        {t('chip.points')}
      </div>
      <div className='mt-2 flex items-baseline gap-1 text-[32px] font-black leading-none tracking-tight text-[#0E0E0F] tabular-nums'>
        {fmt(balance, locale)}
      </div>
      <div className='mt-1.5 text-[11.5px] leading-tight font-medium text-[#8E8780]'>
        <span className='font-extrabold text-brand'>+{accrualPercent}%</span>{' '}
        {t('chip.pointsSub')}
      </div>
    </Link>
  );
}
