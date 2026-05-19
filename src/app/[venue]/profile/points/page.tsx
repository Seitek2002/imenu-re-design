'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

const fmtBalance = (n: number) =>
  n.toLocaleString('ru-RU').replace(/,/g, ' ');

const fmtAmountStr = (s: string) => {
  const n = Math.round(Number(s));
  return Number.isFinite(n) ? fmtBalance(n) : s;
};

const MONTHS_FULL = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(d: Date, now: Date): string {
  const today = dayKey(now);
  const yesterday = dayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const key = dayKey(d);
  if (key === today) return 'Сегодня';
  if (key === yesterday) return 'Вчера';
  return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]}`;
}

function timeLabel(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

interface DayGroup {
  title: string;
  entries: BonusTransaction[];
}

function groupByDay(list: BonusTransaction[]): DayGroup[] {
  const now = new Date();
  const order: string[] = [];
  const map = new Map<string, DayGroup>();
  for (const tx of list) {
    const d = new Date(tx.createdAt);
    const key = dayKey(d);
    let g = map.get(key);
    if (!g) {
      g = { title: dayLabel(d, now), entries: [] };
      map.set(key, g);
      order.push(key);
    }
    g.entries.push(tx);
  }
  return order.map((k) => map.get(k)!);
}

export default function PointsHistoryPage() {
  const { venue } = useParams<{ venue: string }>();
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const hasToken = useAuthStore((s) => !!s.accessToken);

  const { data, isLoading, isError, refetch } = useBonusTransactions({
    venueSlug: venue,
    limit: 50,
  });

  const groups = useMemo(
    () => (data ? groupByDay(data.results) : []),
    [data],
  );

  const summary = data?.summary;

  return (
    <div className='min-h-svh pb-24'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venue}/profile`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label='Назад'
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>История бонусов</h1>
      </header>

      <div className='px-4 mt-2 flex flex-col gap-3'>
        <section className='bg-white rounded-2xl px-4 py-4 flex items-stretch'>
          <div className='flex-1 pr-3'>
            <div className='text-[13px] text-[#9E9E9E]'>Баланс</div>
            <div className='mt-1 text-[22px] font-extrabold text-[#21201F]'>
              {summary ? `${fmtBalance(summary.balance)} б.` : '—'}
            </div>
          </div>
          <div className='w-px bg-[#EDEAE7]' />
          <div className='flex-1 pl-4 flex flex-col gap-1.5 justify-center'>
            <Stat label='Накоплено всего' value={summary ? fmtAmountStr(summary.earnedTotal) : '—'} />
            <Stat label='Списано всего' value={summary ? fmtAmountStr(summary.redeemedTotal) : '—'} />
          </div>
        </section>

        <button className='self-start inline-flex items-center gap-2 h-9 px-3 rounded-full bg-white border border-[#EDEAE7] text-[13px] text-[#21201F]'>
          <Calendar size={16} className='text-[#9E9E9E]' />
          За месяц
          <ChevronDown size={16} className='text-[#9E9E9E]' />
        </button>

        {bootstrapped && !hasToken && (
          <div className='bg-white rounded-2xl px-4 py-8 text-center text-[13px] text-[#9E9E9E]'>
            Войдите по SMS, чтобы увидеть историю бонусов —{' '}
            <Link href={`/${venue}/profile`} className='text-[#21201F] underline'>
              перейти к входу
            </Link>
            .
          </div>
        )}

        {hasToken && isLoading && (
          <div className='bg-white rounded-2xl px-4 py-12' />
        )}

        {hasToken && isError && (
          <div className='bg-white rounded-2xl px-4 py-8 text-center text-[13px] text-[#9E9E9E]'>
            Не удалось загрузить.{' '}
            <button onClick={() => refetch()} className='text-[#21201F] underline'>
              Повторить
            </button>
          </div>
        )}

        {hasToken && !isLoading && !isError && groups.length === 0 && (
          <div className='bg-white rounded-2xl px-4 py-8 text-center text-[13px] text-[#9E9E9E]'>
            Операций с бонусами пока нет.
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
                          </div>
                        </div>
                        <div className='text-right shrink-0'>
                          <div
                            className={`text-[15px] font-bold ${
                              e.isCredit ? 'text-[#22A05A]' : 'text-[#E0533A]'
                            }`}
                          >
                            {e.isCredit ? '+' : '−'}
                            {fmtAmountStr(e.amount)}
                          </div>
                          <div className='text-[12px] text-[#9E9E9E]'>
                            {timeLabel(new Date(e.createdAt))}
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
