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
  n.toLocaleString(locale === 'en' ? 'en-US' : 'ru-RU').replace(/,/g, ' ');

/**
 * Бонус-чип для ряда «активный заказ + бонусы» — в дизайн-системе Figma
 * 402:591: белая карточка rounded-24, тёмный текст #323232 / серый #7F7F7F,
 * оранжевая точка статуса, чип «+N%» начисления.
 */
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
      className='block rounded-[24px] bg-white p-4 shadow-[0px_4px_12px_rgba(115,115,115,0.12)] transition-colors active:bg-[#FAFAFA]'
    >
      <div className='flex items-center gap-1.5'>
        <span aria-hidden className='h-2 w-2 rounded-full bg-[#EDB583]' />
        <span className='text-[12px] font-medium uppercase text-[#7F7F7F]'>
          {t('bonus.balance')}
        </span>
      </div>
      <div className='mt-3 flex flex-wrap items-end gap-x-1.5 gap-y-0.5'>
        <span className='text-[clamp(1.75rem,9vw,2.5rem)] font-semibold leading-none text-[#323232] tabular-nums'>
          {fmt(balance, locale)}
        </span>
        <span className='text-[12px] font-medium uppercase text-[#7F7F7F]'>
          {t('bonus.points')}
        </span>
      </div>
      <div className='mt-2.5 flex items-center gap-1'>
        <span className='inline-flex shrink-0 items-center whitespace-nowrap rounded-[10px] bg-[#E5E5E5] px-1.5 py-1 text-[12px] font-medium leading-none text-[#323232] tabular-nums'>
          +{accrualPercent}%
        </span>
        <span className='text-[12px] font-medium leading-tight text-[#7F7F7F]'>
          {t('chip.pointsSub')}
        </span>
      </div>
    </Link>
  );
}
