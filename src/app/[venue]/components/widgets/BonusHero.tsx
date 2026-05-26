'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';

import styles from './widgets.module.css';

interface Props {
  balance: number;
  accrualPercent: number;
  maxDeductiblePercent: number;
  nextGroupName: string | null;
  /** Decimal-string `turnoverToNext` from BonusResponse, parsed to number. */
  turnoverToNext: number | null;
  venueSlug: string;
  locale: string;
}

const fmt = (n: number, locale: string) =>
  n
    .toLocaleString(locale === 'en' ? 'en-US' : 'ru-RU')
    .replace(/,/g, ' ');

export default function BonusHero({
  balance,
  accrualPercent,
  maxDeductiblePercent,
  nextGroupName,
  turnoverToNext,
  venueSlug,
  locale,
}: Props) {
  const t = useTranslations('Widgets');
  const tc = useTranslations('Common');

  // Backend does not yet expose `turnoverFrom` — render a fixed 65 % preview
  // bar so the visual is present. Wire to the real ratio once /loyalty/
  // exposes it (Kuma 2026-05-24 §6b).
  const placeholderPct = 65;
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const id = setTimeout(() => {
      if (barRef.current) barRef.current.style.width = `${placeholderPct}%`;
    }, 250);
    return () => clearTimeout(id);
  }, []);

  const showProgress =
    nextGroupName != null && turnoverToNext != null && turnoverToNext > 0;

  return (
    <div
      className={`relative overflow-hidden rounded-[22px] bg-white p-[18px] shadow-[0_1px_0_rgba(40,28,16,0.04),_0_14px_32px_-20px_rgba(40,28,16,0.14)] ${styles.bonusHeroTint}`}
    >
      <div className='relative flex items-center justify-between gap-2.5'>
        <div className='text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8E8780]'>
          {t('bonus.balance')}
        </div>
        <div className='inline-flex items-center gap-1.5 rounded-full border-[0.5px] border-[#8031C9]/20 bg-[#FBF7FD] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#8031C9]'>
          <span
            aria-hidden
            className='h-3 w-3 rounded-full shadow-inner'
            style={{
              background: 'linear-gradient(140deg, #C9A876, #8E6A3D)',
            }}
          />
          {t('bonus.tierGuest')}
        </div>
      </div>

      <div className='relative mt-1.5 flex items-baseline gap-2 text-[48px] font-black leading-none tracking-tight text-[#0E0E0F] tabular-nums'>
        {fmt(balance, locale)}
        <small className='text-[12px] font-semibold text-[#8E8780] tracking-normal'>
          {t('bonus.points')}
        </small>
      </div>

      <div className='relative mt-3.5 grid grid-cols-[1fr_1px_1fr] gap-0 rounded-[14px] border-[0.5px] border-[#ECE6DE] bg-[#FAF6F1] p-3'>
        <div className='px-3.5'>
          <div className='text-[22px] font-extrabold leading-none tracking-tight'>
            <span className='text-brand'>+{accrualPercent}%</span>
          </div>
          <div className='mt-1 text-[11px] leading-tight font-medium text-[#8E8780]'>
            {t('bonus.accrualLabel')}
          </div>
        </div>
        <div className='bg-[#ECE6DE]' />
        <div className='px-3.5'>
          <div className='text-[22px] font-extrabold leading-none tracking-tight text-[#0E0E0F] tabular-nums'>
            {t('bonus.upTo', { n: maxDeductiblePercent })}
          </div>
          <div className='mt-1 text-[11px] leading-tight font-medium text-[#8E8780]'>
            {t('bonus.deductibleLabel')}
          </div>
        </div>
      </div>

      {showProgress && (
        <>
          <div className='relative mt-3.5 mb-[7px] flex items-center justify-between gap-2 text-[12px] font-medium text-[#8E8780]'>
            <span>
              {t.rich('bonus.toNextGroup', {
                name: nextGroupName!,
                b: (chunks) => (
                  <b className='font-bold text-[#0E0E0F]'>{chunks}</b>
                ),
              })}
            </span>
            <span>
              <b className='font-bold text-[#0E0E0F] tabular-nums'>
                {fmt(turnoverToNext!, locale)} {tc('currency')}
              </b>{' '}
              {t('bonus.turnoverSuffix')}
            </span>
          </div>
          <div className='relative h-2 overflow-hidden rounded-full bg-[#F3EDE3]'>
            <div
              ref={barRef}
              className='h-full w-0 rounded-full bg-gradient-to-r from-brand to-[#FFA56B] transition-[width] duration-[1200ms] ease-[cubic-bezier(.2,.8,.2,1)]'
            />
          </div>
        </>
      )}

      <Link
        href={`/${venueSlug}/profile/points`}
        className='relative mt-3 flex items-center justify-between gap-2 rounded-[14px] bg-[#0E0E0F] px-3.5 py-3 text-[12.5px] font-semibold text-white'
      >
        <span>{t('bonus.historyCta')}</span>
        <ChevronRight size={14} className='text-white/70' />
      </Link>
    </div>
  );
}
