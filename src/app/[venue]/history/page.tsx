'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Bike,
  Store,
  ShoppingBag,
  ShoppingBasket,
  MapPin,
  NotebookText,
  Loader2,
  History as HistoryIcon,
} from 'lucide-react';
import { useClientStore } from '@/store/client';
import { useOrdersV2 } from '@/lib/api/queries';
import { ServiceMode } from '@/types/api';
import type { OrderV2 } from '@/lib/order';

type FilterKey = 'all' | ServiceMode;

const FILTERS: { key: FilterKey; label: string; Icon?: typeof Bike }[] = [
  { key: 'all', label: 'Все' },
  { key: ServiceMode.Delivery, label: 'Доставка', Icon: Bike },
  { key: ServiceMode.DineIn, label: 'На месте', Icon: Store },
  { key: ServiceMode.Takeaway, label: 'Самовывоз', Icon: ShoppingBag },
];

const TYPE_LABEL: Record<number, { label: string; bg: string; fg: string }> = {
  [ServiceMode.Delivery]: { label: 'Доставка', bg: 'bg-[#E7F1FF]', fg: 'text-[#2E7DFF]' },
  [ServiceMode.DineIn]: { label: 'На месте', bg: 'bg-[#E8F8EE]', fg: 'text-[#22A05A]' },
  [ServiceMode.Takeaway]: { label: 'Самовывоз', bg: 'bg-[#F1ECFF]', fg: 'text-[#7A5AF8]' },
};

const fmtMoney = (s: string) => {
  const n = Math.round(Number(s));
  return Number.isFinite(n) ? n.toLocaleString('ru-RU').replace(/,/g, ' ') : s;
};

const monthShort = [
  'янв', 'фев', 'мар', 'апр', 'май', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
];

const fmtDate = (iso?: string) => {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  const date = `${d.getDate()} ${monthShort[d.getMonth()]}`;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return { date, time };
};

const itemsCount = (o: OrderV2) =>
  o.orderProducts?.reduce((acc, p) => acc + (p.count || 0), 0) ?? 0;

const subtitleFor = (o: OrderV2): string => {
  if (o.serviceMode === ServiceMode.DineIn && o.table?.tableNum) {
    return `Стол №${o.table.tableNum}`;
  }
  const first = o.orderProducts?.[0]?.product?.productName;
  const extra = (o.orderProducts?.length ?? 0) - 1;
  if (!first) return '';
  return extra > 0 ? `${first} +${extra}` : first;
};

export default function HistoryPage() {
  const { venue } = useParams<{ venue: string }>();
  const phone = useClientStore((s) => s.phone);
  const [filter, setFilter] = useState<FilterKey>('all');

  const { data, isLoading, isError, refetch } = useOrdersV2({
    phone,
    venueSlug: venue,
    limit: 50,
    includeUnpaid: true,
  });

  const orders = useMemo(() => {
    const list = data?.results ?? [];
    return filter === 'all' ? list : list.filter((o) => o.serviceMode === filter);
  }, [data, filter]);

  if (!phone) {
    return <EmptyState venueSlug={venue} />;
  }

  return (
    <div className='min-h-svh pb-24'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venue}`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label='Назад'
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>История</h1>
      </header>

      <div className='px-4 pt-2 overflow-x-auto no-scrollbar'>
        <div className='flex gap-2 w-max'>
          {FILTERS.map(({ key, label, Icon }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-medium whitespace-nowrap transition ${
                  active
                    ? 'bg-[#21201F] text-white'
                    : 'bg-white text-[#21201F] border border-[#EDEAE7]'
                }`}
              >
                {Icon && <Icon size={16} strokeWidth={2} />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className='px-4 mt-4 flex flex-col gap-3'>
        {isLoading && (
          <div className='py-16 flex items-center justify-center text-[#9E9E9E]'>
            <Loader2 size={20} className='animate-spin' />
          </div>
        )}

        {isError && (
          <div className='py-12 text-center text-[13px] text-[#9E9E9E]'>
            Не удалось загрузить историю.{' '}
            <button onClick={() => refetch()} className='text-[#21201F] underline'>
              Повторить
            </button>
          </div>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className='py-16 text-center text-[#9E9E9E] text-[13px]'>
            {filter === 'all'
              ? 'Заказов пока нет — оформите первый!'
              : 'В этой категории заказов нет'}
          </div>
        )}

        {orders.map((o) => {
          const t = TYPE_LABEL[o.serviceMode];
          const { date, time } = fmtDate(o.created_at);
          const subtitle = subtitleFor(o);
          return (
            <Link
              key={o.id}
              href={`/${venue}/history/${o.id}`}
              className='block bg-white rounded-2xl px-4 py-4 active:scale-[0.99] transition-transform'
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-[13px] font-semibold text-[#21201F]'>
                      <NotebookText size={18} strokeWidth={2} className='text-[#21201F]' />
                      <span>№ {o.id}</span>
                    </div>
                    {date && (
                      <div className='text-[13px] text-[#9E9E9E] flex items-center gap-1.5'>
                        <span>{date}</span>
                        <span className='inline-block w-[3px] h-[3px] rounded-full bg-[#C4C4C4]' />
                        <span>{time}</span>
                      </div>
                    )}
                  </div>

                  <div className='mt-2.5 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      {t && (
                        <span
                          className={`h-[26px] px-3 rounded-full text-[11px] font-medium inline-flex items-center ${t.bg} ${t.fg}`}
                        >
                          {t.label}
                        </span>
                      )}
                      <span className='flex items-center gap-1 text-[13px] text-[#21201F]'>
                        <ShoppingBasket size={16} strokeWidth={2} className='text-[#9E9E9E]' />
                        {itemsCount(o)}
                      </span>
                    </div>
                    <div className='text-[15px] font-bold text-[#21201F]'>
                      {fmtMoney(o.totalPrice)} с
                    </div>
                  </div>

                  {subtitle && (
                    <div className='mt-3 flex items-center gap-1.5 text-[13px] text-[#21201F] min-w-0'>
                      <MapPin size={16} strokeWidth={2} className='text-[#9E9E9E] shrink-0' />
                      <span className='truncate'>{subtitle}</span>
                    </div>
                  )}
                </div>
                <ChevronRight size={20} className='text-[#C4C4C4] mt-9' />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ venueSlug }: { venueSlug: string }) {
  return (
    <div className='min-h-svh pb-24 flex flex-col'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venueSlug}`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label='Назад'
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>История</h1>
      </header>

      <div className='flex-1 flex flex-col items-center justify-center px-6 text-center'>
        <div className='w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-5'>
          <HistoryIcon size={36} className='text-[#C4B59C]' strokeWidth={1.5} />
        </div>
        <h2 className='text-[18px] font-bold text-[#21201F]'>История пуста</h2>
        <p className='mt-2 text-[13px] text-[#9E9E9E] max-w-xs'>
          Оформите первый заказ — он появится здесь, как и все следующие.
        </p>
        <Link
          href={`/${venueSlug}`}
          className='mt-6 inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-[#21201F] text-white text-[14px] font-medium active:scale-[0.99] transition-transform'
        >
          Перейти в меню
        </Link>
      </div>
    </div>
  );
}
