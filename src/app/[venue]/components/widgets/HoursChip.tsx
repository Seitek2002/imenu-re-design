'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import styles from './widgets.module.css';

// Local shape — works for both api.ts `WorkSchedule` and store `VenueSchedule`.
export interface HoursChipSchedule {
  dayOfWeek: number;
  workStart: string;
  workEnd: string;
  isDayOff: boolean;
  is24h: boolean;
}

interface Props {
  schedules: HoursChipSchedule[];
  onClick: () => void;
}

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

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export default function HoursChip({ schedules, onClick }: Props) {
  const t = useTranslations('Widgets');
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // JS getDay (Sun=0..Sat=6) → DayOfWeek (Mon=1..Sun=7).
  const jsDay = now.getDay();
  const todayDow = jsDay === 0 ? 7 : jsDay;
  const today = schedules.find((s) => s.dayOfWeek === todayDow);

  if (!today) {
    return (
      <button
        type='button'
        onClick={onClick}
        className='relative w-full overflow-hidden rounded-[24px] bg-white p-4 text-left shadow-[0px_4px_12px_rgba(115,115,115,0.12)] transition-colors active:bg-[#FAFAFA]'
      >
        <div className='text-[12px] font-medium uppercase text-[#7F7F7F]'>
          {t('chip.scheduleLabel')}
        </div>
        <div className='mt-2 text-[clamp(1.5rem,7vw,1.75rem)] font-medium leading-none text-[#323232]'>
          {t('chip.scheduleEmpty')}
        </div>
      </button>
    );
  }

  const openMin = timeToMinutes(today.workStart);
  const closeMinRaw = timeToMinutes(today.workEnd);
  // Treat "00:00" close as midnight (24:00) so a same-day window doesn't
  // collapse to zero length.
  const closeMin = closeMinRaw === 0 ? 24 * 60 : closeMinRaw;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const is24 = today.is24h;
  const isDayOff = today.isDayOff;
  const isOpen =
    is24 || (!isDayOff && minutesNow >= openMin && minutesNow < closeMin);

  // Timeline strip — 06:00 to 02:00 (next day) so cross-midnight windows fit.
  const TL_START = 6 * 60;
  const TL_END = 26 * 60;
  const pct = (v: number) =>
    clamp(((v - TL_START) / (TL_END - TL_START)) * 100, 0, 100);
  const winLeft = pct(openMin);
  const winRight = pct(closeMin);
  const nowLeft = pct(minutesNow);

  const closesInMin = isOpen && !is24 ? closeMin - minutesNow : null;
  const closesInH = closesInMin != null ? Math.floor(closesInMin / 60) : 0;
  const closesInM = closesInMin != null ? closesInMin % 60 : 0;

  return (
    <button
      type='button'
      onClick={onClick}
      className='relative w-full overflow-hidden rounded-[24px] bg-white p-4 text-left shadow-[0px_4px_12px_rgba(115,115,115,0.12)] transition-colors active:bg-[#FAFAFA]'
    >
      <div className='flex items-center gap-1.5 text-[12px] font-medium uppercase text-[#7F7F7F]'>
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full ${
            isOpen ? `bg-[#34C759] ${styles.livePulse}` : 'bg-[#9CA3AF]'
          }`}
        />
        {isOpen ? t('chip.openLabel') : t('chip.closedLabel')}
      </div>

      <div className='mt-2 text-[clamp(1.5rem,7vw,1.75rem)] font-medium leading-none text-[#323232] tabular-nums'>
        {is24
          ? t('chip.open24')
          : isOpen
            ? t('chip.openUntil', { time: fmtTime(closeMin) })
            : t('chip.closedShort')}
      </div>

      <div className='mt-1.5 text-[12px] leading-tight font-medium text-[#7F7F7F]'>
        {is24 ? (
          t('chip.always')
        ) : isOpen && closesInMin != null ? (
          t.rich('chip.closesIn', {
            h: closesInH,
            m: closesInM,
            b: (chunks) => (
              <b className='font-semibold text-[#323232] tabular-nums'>
                {chunks}
              </b>
            ),
          })
        ) : (
          t('chip.opensLater')
        )}
      </div>

      {!is24 && (
        <div className='relative mt-3 h-1.5 rounded-full bg-[#E5E5E5]'>
          <div
            className='absolute inset-y-0 rounded-full bg-[#323232]'
            style={{ left: `${winLeft}%`, right: `${100 - winRight}%` }}
          />
          {isOpen && (
            <div
              className='absolute -top-[3px] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#34C759] bg-white shadow-[0_0_0_2px_rgba(52,199,89,0.15)]'
              style={{ left: `${nowLeft}%` }}
            />
          )}
        </div>
      )}
    </button>
  );
}
