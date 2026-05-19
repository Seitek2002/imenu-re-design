'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  ChevronLeft,
  ChevronDown,
  Calendar,
  ShoppingBag,
  BadgePercent,
  Gift,
  Clock,
  RefreshCcw,
  Sliders,
} from 'lucide-react';
import {
  useBonusTransactions,
  type BonusTransaction,
  type BonusTransactionKind,
} from '@/lib/api/bonus-transactions';
import { useAuthStore } from '@/store/auth';
import type { Locale } from '@/lib/locale';

const ICON: Record<BonusTransactionKind, React.ElementType> = {
  accrual: ShoppingBag,
  redeem: ShoppingBag,
  promo: BadgePercent,
  gift: Gift,
  adjust_plus: Sliders,
  adjust_minus: Sliders,
  expire: Clock,
  refund: RefreshCcw,
};

const fmtBalance = (n: number, locale: Locale) =>
  n.toLocaleString(locale === 'ky' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'ru-RU').replace(/,/g, ' ');

const fmtAmountStr = (s: string, locale: Locale) => {
  const n = Math.round(Number(s));
  return Number.isFinite(n) ? fmtBalance(n, locale) : s;
};

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function timeLabel(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

type PeriodKey = 'week' | 'month' | 'quarter' | 'all';

function periodFrom(p: PeriodKey): string | undefined {
  if (p === 'all') return undefined;
  const days = p === 'week' ? 7 : p === 'month' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

interface DayGroup {
  title: string;
  entries: BonusTransaction[];
}

function groupByDay(
  list: BonusTransaction[],
  locale: Locale,
  todayLabel: string,
  yesterdayLabel: string,
): DayGroup[] {
  const now = new Date();
  const todayK = dayKey(now);
  const yesterdayK = dayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  // Intl сам подберёт правильное склонение месяцев для ru/ky/en.
  const monthDayFmt = new Intl.DateTimeFormat(
    locale === 'ky' ? 'ky-KG' : locale === 'en' ? 'en-US' : 'ru-RU',
    { day: 'numeric', month: 'long' },
  );

  const order: string[] = [];
  const map = new Map<string, DayGroup>();
  for (const tx of list) {
    const d = new Date(tx.createdAt);
    const key = dayKey(d);
    let g = map.get(key);
    if (!g) {
      const title =
        key === todayK
          ? todayLabel
          : key === yesterdayK
            ? yesterdayLabel
            : monthDayFmt.format(d);
      g = { title, entries: [] };
      map.set(key, g);
      order.push(key);
    }
    g.entries.push(tx);
  }
  return order.map((k) => map.get(k)!);
}

export default function PointsHistoryPage() {
  const t = useTranslations('ProfileBonus');
  const tProfile = useTranslations('Profile');
  const locale = useLocale() as Locale;
  const { venue } = useParams<{ venue: string }>();
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const hasToken = useAuthStore((s) => !!s.accessToken);

  const [period, setPeriod] = useState<PeriodKey>('month');
  const [periodOpen, setPeriodOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useBonusTransactions({
    venueSlug: venue,
    limit: 100,
    from: periodFrom(period),
  });

  const groups = useMemo(
    () =>
      data
        ? groupByDay(data.results, locale, t('today'), t('yesterday'))
        : [],
    [data, locale, t],
  );

  const summary = data?.summary;

  return (
    <div className='min-h-svh pb-24'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venue}/profile`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label={tProfile('back')}
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>{t('title')}</h1>
      </header>

      <div className='px-4 mt-2 flex flex-col gap-3'>
        <section className='bg-white rounded-2xl px-4 py-4 flex items-stretch'>
          <div className='flex-1 pr-3'>
            <div className='text-[13px] text-[#9E9E9E]'>{t('balance')}</div>
            <div className='mt-1 text-[22px] font-extrabold text-[#21201F]'>
              {summary ? t('balanceUnit', { value: fmtBalance(summary.balance, locale) }) : '—'}
            </div>
          </div>
          <div className='w-px bg-[#EDEAE7]' />
          <div className='flex-1 pl-4 flex flex-col gap-1.5 justify-center'>
            <Stat label={t('earnedTotal')} value={summary ? fmtAmountStr(summary.earnedTotal, locale) : '—'} />
            <Stat label={t('redeemedTotal')} value={summary ? fmtAmountStr(summary.redeemedTotal, locale) : '—'} />
          </div>
        </section>

        <div className='relative self-start'>
          <button
            type='button'
            onClick={() => setPeriodOpen((v) => !v)}
            className='inline-flex items-center gap-2 h-9 px-3 rounded-full bg-white border border-[#EDEAE7] text-[13px] text-[#21201F]'
          >
            <Calendar size={16} className='text-[#9E9E9E]' />
            {t(`period.${period}`)}
            <ChevronDown size={16} className={`text-[#9E9E9E] transition-transform ${periodOpen ? 'rotate-180' : ''}`} />
          </button>
          {periodOpen && (
            <>
              <div
                className='fixed inset-0 z-10'
                onClick={() => setPeriodOpen(false)}
              />
              <div className='absolute left-0 top-full mt-1 z-20 bg-white rounded-2xl shadow-lg border border-[#EDEAE7] py-1 min-w-[10rem] overflow-hidden'>
                {(['week', 'month', 'quarter', 'all'] as PeriodKey[]).map((p) => (
                  <button
                    key={p}
                    type='button'
                    onClick={() => {
                      setPeriod(p);
                      setPeriodOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-[13px] transition-colors ${
                      p === period
                        ? 'bg-[#F4F1EE] text-[#21201F] font-medium'
                        : 'text-[#21201F] hover:bg-[#F8F6F7]'
                    }`}
                  >
                    {t(`period.${p}`)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {bootstrapped && !hasToken && (
          <div className='bg-white rounded-2xl px-4 py-8 text-center text-[13px] text-[#9E9E9E]'>
            {t('loginRequired')} —{' '}
            <Link href={`/${venue}/profile`} className='text-[#21201F] underline'>
              {t('loginLink')}
            </Link>
            .
          </div>
        )}

        {hasToken && isLoading && (
          <div className='bg-white rounded-2xl px-4 py-4 animate-pulse flex flex-col gap-3 divide-y divide-[#EDEAE7]'>
            <div className='pb-3'>
              <div className='h-3 w-16 bg-[#F4F1EE] rounded mb-3' />
              <div className='flex flex-col gap-3'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-3'>
                    <div className='w-[42px] h-[42px] rounded-full bg-[#F4F1EE]' />
                    <div className='flex-1 flex flex-col gap-1.5'>
                      <div className='h-3.5 w-2/3 bg-[#F4F1EE] rounded' />
                      <div className='h-3 w-1/2 bg-[#F8F6F7] rounded' />
                    </div>
                    <div className='flex flex-col items-end gap-1.5'>
                      <div className='h-4 w-12 bg-[#F4F1EE] rounded' />
                      <div className='h-3 w-10 bg-[#F8F6F7] rounded' />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {hasToken && isError && (
          <div className='bg-white rounded-2xl px-4 py-8 text-center text-[13px] text-[#9E9E9E]'>
            {t('loadError')}{' '}
            <button onClick={() => refetch()} className='text-[#21201F] underline'>
              {t('retry')}
            </button>
          </div>
        )}

        {hasToken && !isLoading && !isError && groups.length === 0 && (
          <div className='bg-white rounded-2xl px-4 py-8 text-center text-[13px] text-[#9E9E9E]'>
            {t('empty')}
          </div>
        )}

        {groups.length > 0 && (
          <section className='bg-white rounded-2xl px-4 py-4 flex flex-col divide-y divide-[#EDEAE7]'>
            {groups.map((g) => (
              <div key={g.title} className='py-3 first:pt-0 last:pb-0'>
                <div className='text-[12px] text-[#9E9E9E]'>{g.title}</div>
                <ul className='mt-3 flex flex-col gap-3'>
                  {g.entries.map((e) => {
                    const Icon = ICON[e.kind] ?? ShoppingBag;
                    return (
                      <li key={e.id} className='flex items-center gap-3'>
                        <div className='w-[42px] h-[42px] rounded-full bg-[#F4F1EE] flex items-center justify-center shrink-0'>
                          <Icon size={20} className='text-[#21201F]' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='text-[14px] text-[#21201F] truncate'>{e.title}</div>
                          <div className='text-[12px] text-[#9E9E9E] mt-0.5 truncate'>
                            {e.subtitle}
                            {e.venueName && e.venueSlug !== venue && (
                              <> · {e.venueName}</>
                            )}
                          </div>
                        </div>
                        <div className='text-right shrink-0'>
                          <div
                            className={`text-[15px] font-bold ${
                              e.isCredit ? 'text-[#22A05A]' : 'text-[#E0533A]'
                            }`}
                          >
                            {e.isCredit ? '+' : '−'}
                            {fmtAmountStr(e.amount, locale)}
                          </div>
                          <div className='text-[12px] text-[#9E9E9E]'>
                            {timeLabel(new Date(e.createdAt))}
                            {e.balanceAfter != null && (
                              <> · → {fmtBalance(e.balanceAfter, locale)}</>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between text-[13px]'>
      <span className='text-[#9E9E9E]'>{label}</span>
      <span className='text-[#21201F] font-semibold'>{value}</span>
    </div>
  );
}
