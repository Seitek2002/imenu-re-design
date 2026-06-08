'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, History } from 'lucide-react';

import type { HoursChipSchedule } from './HoursChip';

import styles from './widgets.module.css';

interface Props {
  balance: number;
  accrualPercent: number;
  maxDeductiblePercent: number;
  /** Имя текущей группы лояльности из `bonusData.clientGroup.name`. null у
   *  не-Poster venue или гостя — рендерим «Гость». */
  currentGroupName: string | null;
  nextGroupName: string | null;
  /** Decimal-string `turnoverToNext` from BonusResponse, parsed to number. */
  turnoverToNext: number | null;
  /** `totalPayedSum` — накопленный оборот клиента (для истинной доли прогресса). */
  totalPayedSum: number | null;
  /** `clientGroup.requiredTurnover` — нижняя граница текущего уровня. */
  currentGroupRequiredTurnover: number | null;
  /** `nextGroup.requiredTurnover` — порог следующего уровня. */
  nextGroupRequiredTurnover: number | null;
  /** `nextGroup.discountPercent` — выгода следующего уровня (% начисления или скидки). */
  nextGroupDiscountPercent: number | null;
  /** `nextGroup.loyaltyType` — 'bonus' (начисление) | 'discount' (скидка). */
  nextGroupLoyaltyType: 'bonus' | 'discount' | '' | null;
  /** Расписание venue — для блока «Открыто / 24 ч». */
  schedules: HoursChipSchedule[];
  /** Тап по карточке часов открывает ScheduleModal (график). */
  onScheduleClick?: () => void;
  venueSlug: string;
  locale: string;
}

const fmt = (n: number, locale: string) =>
  n.toLocaleString(locale === 'en' ? 'en-US' : 'ru-RU').replace(/,/g, ' ');

function timeToMinutes(t?: string): number {
  if (!t) return 0;
  const [h, m] = t.split(':');
  return Number(h) * 60 + Number(m);
}

function fmtTime(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Бонусный счёт — единая карточка по макету Figma 402:591.
 *   header: «ВАШ СТАТУС» + пилюля статуса  |  «ИСТОРИЯ» (ссылка)
 *   ряд 1: баланс баллов + чип «до N%»  |  watermark «+N%» (начисление)
 *   ряд 2: «Открыто / 12:00 - 22:00» |  светлая карточка прогресса до след. статуса
 */
export default function BonusHero({
  balance,
  accrualPercent,
  maxDeductiblePercent,
  currentGroupName,
  nextGroupName,
  turnoverToNext,
  totalPayedSum,
  currentGroupRequiredTurnover,
  nextGroupRequiredTurnover,
  nextGroupDiscountPercent,
  nextGroupLoyaltyType,
  schedules,
  onScheduleClick,
  venueSlug,
  locale,
}: Props) {
  const t = useTranslations('Widgets');
  const tc = useTranslations('Common');

  // Часы работы на сегодня — упрощённый вариант логики HoursChip.
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const jsDay = now.getDay();
  const todayDow = jsDay === 0 ? 7 : jsDay; // Mon=1..Sun=7
  const today = schedules.find((s) => s.dayOfWeek === todayDow);
  const is24 = today?.is24h ?? false;
  const closeMinRaw = timeToMinutes(today?.workEnd);
  const closeMin = closeMinRaw === 0 ? 24 * 60 : closeMinRaw;
  const openMin = timeToMinutes(today?.workStart);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const isOpen =
    !!today &&
    (is24 ||
      (!today.isDayOff && minutesNow >= openMin && minutesNow < closeMin));

  const hoursLabel = isOpen ? t('chip.openLabel') : t('chip.closedLabel');
  const hoursValue = is24
    ? t('chip.open24')
    : isOpen
      ? `${fmtTime(openMin)} - ${fmtTime(closeMin)}`
      : t('chip.closedShort');

  const showProgress =
    nextGroupName != null && turnoverToNext != null && turnoverToNext > 0;

  // Истинная доля прогресса до следующего уровня. Данные пришли от Kuma
  // 2026-05-24: totalPayedSum (накоплено) + requiredTurnover у групп.
  //   pct = (накоплено − нижняя граница уровня) / (порог следующего − граница)
  // Порог следующего берём из nextGroup.requiredTurnover, а если его нет —
  // выводим как накоплено + turnoverToNext. Нижняя граница (currentGroup
  // requiredTurnover) опциональна → fallback 0. Если посчитать нельзя
  // (нет totalPayedSum) — бар не рисуем, показываем только остаток текстом.
  const progressPct = (() => {
    if (turnoverToNext == null || turnoverToNext <= 0) return null;
    if (totalPayedSum == null) return null;
    const nextReq = nextGroupRequiredTurnover ?? totalPayedSum + turnoverToNext;
    const from = currentGroupRequiredTurnover ?? 0;
    const band = nextReq - from;
    if (band <= 0) return null;
    return Math.max(0, Math.min(100, ((totalPayedSum - from) / band) * 100));
  })();

  // Выгода следующего уровня: чип «+N%» (начисление) или «скидка N%».
  const nextBenefit =
    nextGroupDiscountPercent != null && nextGroupDiscountPercent > 0
      ? nextGroupLoyaltyType === 'discount'
        ? t('bonus.nextDiscount', { n: nextGroupDiscountPercent })
        : `+${nextGroupDiscountPercent}%`
      : null;

  return (
    <div className='rounded-[24px] bg-white p-4 shadow-[0px_4px_12px_rgba(115,115,115,0.12)]'>
      {/* header */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex min-w-0 items-center gap-2.5'>
          <span className='text-[12px] font-medium uppercase text-[#323232]'>
            {t('bonus.statusLabel')}
          </span>
          <div className='inline-flex items-center gap-1.5 rounded-[10px] bg-[#323232] px-2.5 py-1.5'>
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full bg-[#EDB583] text-[#EDB583] ${styles.livePulse}`}
            />
            <span className='truncate text-[10px] font-medium uppercase text-white'>
              {currentGroupName?.trim() || t('bonus.tierGuest')}
            </span>
          </div>
        </div>
        <Link
          href={`/${venueSlug}/profile/points`}
          className='flex shrink-0 cursor-pointer items-center gap-1.5 text-[#323232] transition-opacity hover:opacity-70 active:opacity-60'
        >
          <History size={16} className='shrink-0' strokeWidth={1.8} />
          <span className='text-[14px] font-medium uppercase'>
            {t('bonus.history')}
          </span>
        </Link>
      </div>

      {/* body */}
      <div className='mt-2.5 flex flex-col gap-2.5'>
        {/* ряд 1 */}
        <div className='grid grid-cols-2 gap-2.5'>
          {/* баланс + «до N%» */}
          <div className='flex min-w-0 flex-col gap-2.5 rounded-[16px] bg-[#F3F3F3] p-4'>
            <div className='flex flex-wrap items-end gap-x-[7px] gap-y-0.5'>
              <span className='text-[clamp(1.75rem,8vw,3.25rem)] font-semibold leading-[0.86] text-[#323232] tabular-nums'>
                {fmt(balance, locale)}
              </span>
              <span className='text-[12px] font-medium uppercase text-[#7F7F7F]'>
                {t('bonus.points')}
              </span>
            </div>
            <div className='h-px w-full bg-[#7F7F7F]/20' />
            <div className='flex items-center gap-1'>
              <span className='inline-flex shrink-0 items-center whitespace-nowrap rounded-[10px] bg-[#E5E5E5] px-1.5 py-1 text-[12px] font-medium leading-none text-[#323232] tabular-nums'>
                {t('bonus.upTo', { n: maxDeductiblePercent })}
              </span>
              <span className='text-[12px] font-medium leading-tight text-[#7F7F7F]'>
                {t('chip.redeemSub')}
              </span>
            </div>
          </div>

          {/* watermark «+N%» — начисление */}
          <div className='relative flex min-w-0 flex-col justify-between overflow-hidden rounded-[16px] bg-[#F3F3F3] p-4'>
            <span
              aria-hidden
              className='pointer-events-none text-[clamp(3rem,16vw,4.625rem)] font-semibold leading-[0.8] text-black opacity-10 tabular-nums'
            >
              +{accrualPercent}%
            </span>
            <span className='mt-auto text-[12px] font-normal leading-tight text-black'>
              {t('bonus.accrualLabel')}
            </span>
          </div>
        </div>

        {/* ряд 2 — side-by-side как в Figma при ширине колонки ≈700px,
            на узких экранах складывается вертикально, чтобы диапазон часов
            не обрезался в узкой 0.38fr-колонке. */}
        <div
          className={`grid grid-cols-1 gap-2.5 ${
            showProgress
              ? 'min-[700px]:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]'
              : ''
          }`}
        >
          {/* открыто / 24 ч — тап открывает график (ScheduleModal) */}
          <button
            type='button'
            onClick={onScheduleClick}
            className='group relative flex min-w-0 cursor-pointer flex-col justify-center gap-1 overflow-hidden rounded-[16px] bg-[#F3F3F3] px-4 py-2.5 text-left transition-colors hover:bg-[#ECECEC] active:bg-[#E5E5E5]'
          >
            <span className='text-[12px] font-medium text-[#7F7F7F]'>
              {hoursLabel}
            </span>
            <span className='whitespace-nowrap text-[clamp(1.5rem,4.4vw,1.75rem)] font-medium leading-none text-[#323232] tabular-nums'>
              {hoursValue}
            </span>
            <Clock
              aria-hidden
              size={120}
              strokeWidth={1.2}
              className='pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 text-black opacity-[0.04] transition-opacity group-hover:opacity-[0.08]'
            />
          </button>

          {/* прогресс до следующего статуса */}
          {showProgress && (
            <div className='flex min-w-0 flex-col justify-center gap-4 rounded-[16px] bg-[#F3F3F3] p-4'>
              <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1'>
                <span className='flex min-w-0 items-center gap-1.5'>
                  <span className='min-w-0 text-[14px] font-medium leading-tight text-[#323232]'>
                    {t('bonus.toNextStatus', { name: nextGroupName! })}
                  </span>
                  {nextBenefit && (
                    <span className='inline-flex shrink-0 items-center whitespace-nowrap rounded-[8px] bg-[#E5E5E5] px-1.5 py-0.5 text-[11px] font-medium leading-none text-[#323232] tabular-nums'>
                      {nextBenefit}
                    </span>
                  )}
                </span>
                <span className='text-[12px] font-medium tabular-nums text-[#7F7F7F]'>
                  <span className='text-[#323232]'>
                    {t('bonus.turnoverLeft')} {fmt(turnoverToNext!, locale)}{' '}
                    {tc('currency')}
                  </span>{' '}
                  {t('bonus.turnoverSuffix')}
                </span>
              </div>
              {progressPct != null && (
                <div className='h-2 w-full overflow-hidden rounded-[10px] bg-[#E5E5E5]'>
                  <div
                    className='h-full rounded-[10px] bg-[#323232] transition-[width] duration-500'
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
