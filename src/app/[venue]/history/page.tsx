'use client';

import { useEffect, useMemo, useState } from 'react';
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
  CreditCard,
  CirclePlus,
  CircleMinus,
  Coins,
  History as HistoryIcon,
} from 'lucide-react';
import { useClientStore } from '@/store/client';
import { useOrdersInfiniteV2 } from '@/lib/api/queries';
import { OrderStatus, ServiceMode } from '@/types/api';
import { type OrderV2 } from '@/lib/order';

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

const STATUS_LABEL: Record<number, string> = {
  [OrderStatus.Created]: 'Оформлен',
  [OrderStatus.Preparing]: 'Готовится',
  [OrderStatus.Ready]: 'Готов',
  [OrderStatus.Completed]: 'Выполнен',
  [OrderStatus.PendingPayment]: 'Ожидает оплату',
  [OrderStatus.InDelivery]: 'В доставке',
  [OrderStatus.Cancelled]: 'Отменён',
};

const STATUS_TONE: Record<number, { bg: string; fg: string }> = {
  [OrderStatus.Created]: { bg: 'bg-[#FFF4E5]', fg: 'text-[#B8731A]' },
  [OrderStatus.Preparing]: { bg: 'bg-[#FFF4E5]', fg: 'text-[#B8731A]' },
  [OrderStatus.Ready]: { bg: 'bg-[#E8F8EE]', fg: 'text-[#22A05A]' },
  [OrderStatus.Completed]: { bg: 'bg-[#EFEFEF]', fg: 'text-[#6B6B6B]' },
  [OrderStatus.PendingPayment]: { bg: 'bg-[#FFF1E0]', fg: 'text-[#D97706]' },
  [OrderStatus.InDelivery]: { bg: 'bg-[#E7F1FF]', fg: 'text-[#2E7DFF]' },
  [OrderStatus.Cancelled]: { bg: 'bg-[#FDECEC]', fg: 'text-[#DC2626]' },
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

type SubtitleKind = 'venue' | 'items';

const subtitleFor = (
  o: OrderV2,
): { text: string; kind: SubtitleKind } | null => {
  // Филиал — основной контекст для каждой строки истории.
  // Для доставки → venue · адрес доставки (куда везли).
  // Для takeaway/dine-in → venue · адрес точки (spot.address) — где забирали /
  // ели (Kuma 2026-05-24 §5). spot пришёл объектом из orders/list.
  if (o.venue?.name) {
    const base = o.venue.name;
    const suffix =
      o.address ??
      o.spot?.address ??
      o.spot?.name ??
      null;
    return {
      text: suffix ? `${base} · ${suffix}` : base,
      kind: 'venue',
    };
  }
  // Системные/исторические записи без venue — фоллбэк на первый товар.
  const first = o.orderProducts?.[0]?.product?.productName;
  const extra = (o.orderProducts?.length ?? 0) - 1;
  if (!first) return null;
  return {
    text: extra > 0 ? `${first} +${extra}` : first,
    kind: 'items',
  };
};

const PAGE_SIZE = 20;

export default function HistoryPage() {
  const { venue } = useParams<{ venue: string }>();
  const phone = useClientStore((s) => s.phone);
  const [filter, setFilter] = useState<FilterKey>('all');

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useOrdersInfiniteV2({
    phone,
    venueSlug: venue,
    limit: PAGE_SIZE,
    includeUnpaid: true,
  });

  const orders = useMemo(() => {
    const list = data?.pages.flatMap((p) => p.results) ?? [];
    return filter === 'all' ? list : list.filter((o) => o.serviceMode === filter);
  }, [data, filter]);

  // IntersectionObserver на sentinel. Используем callback ref через useState —
  // useRef не триггерит rerender, и effect не узнаёт когда node mount'нулся.
  const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelNode || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(sentinelNode);
    return () => io.disconnect();
  }, [sentinelNode, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
          <div className='flex flex-col gap-3'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className='bg-white rounded-2xl px-4 py-4 animate-pulse'
              >
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <div className='h-4 w-20 bg-[#EDEAE7] rounded' />
                      <div className='h-3 w-16 bg-[#F4F1EE] rounded' />
                    </div>
                    <div className='mt-2.5 flex items-center gap-2'>
                      <div className='h-[26px] w-20 bg-[#F4F1EE] rounded-full' />
                      <div className='h-[26px] w-24 bg-[#F4F1EE] rounded-full' />
                      <div className='h-4 w-8 bg-[#F4F1EE] rounded ml-auto' />
                    </div>
                    <div className='mt-3 h-3 w-3/4 bg-[#F4F1EE] rounded' />
                  </div>
                </div>
              </div>
            ))}
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
          const { date, time } = fmtDate(o.createdAt);
          const subtitle = subtitleFor(o);
          const statusLabel = o.statusText || STATUS_LABEL[o.status];
          const statusTone = STATUS_TONE[o.status];
          // Маршрутизация: pending → /order-status (там есть оплата и countdown).
          // Не проверяем здесь paymentExpiresAt vs Date.now() — Date.now() в
          // render нарушает react-hooks/purity, и сама /order-status корректно
          // показывает expired-state когда время вышло.
          const isPending =
            o.status === OrderStatus.PendingPayment ||
            o.paymentStatus === 'pending';
          const href = isPending
            ? `/${venue}/order-status/${o.id}`
            : `/${venue}/history/${o.id}`;
          return (
            <Link
              key={o.id}
              href={href}
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
                    <div className='flex items-center gap-2 flex-wrap'>
                      {t && (
                        <span
                          className={`h-[26px] px-3 rounded-full text-[11px] font-medium inline-flex items-center ${t.bg} ${t.fg}`}
                        >
                          {t.label}
                        </span>
                      )}
                      {statusLabel && statusTone && (
                        <span
                          className={`h-[26px] px-3 rounded-full text-[11px] font-medium inline-flex items-center ${statusTone.bg} ${statusTone.fg}`}
                        >
                          {statusLabel}
                        </span>
                      )}
                      <span className='flex items-center gap-1 text-[13px] text-[#21201F]'>
                        <ShoppingBasket size={16} strokeWidth={2} className='text-[#9E9E9E]' />
                        {itemsCount(o)}
                      </span>
                    </div>
                    <div className='text-[15px] font-bold text-[#21201F]'>
                      {fmtMoney(o.totalPrice)} ⃀
                    </div>
                  </div>

                  {(subtitle ||
                    (o.bonusEarned != null && o.bonusEarned > 0) ||
                    (o.bonus != null && o.bonus > 0)) && (
                    <>
                      <div className='mt-3 h-px bg-[#F1EEEB]' />
                      <div className='mt-3 flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-1.5 text-[13px] text-[#9E9E9E] min-w-0'>
                          {subtitle?.kind === 'items' ? (
                            <ShoppingBag size={16} strokeWidth={2} className='shrink-0' />
                          ) : (
                            <MapPin size={16} strokeWidth={2} className='shrink-0' />
                          )}
                          <span className='truncate'>{subtitle?.text}</span>
                        </div>
                        <div className='flex items-center gap-2 shrink-0 text-[13px] text-[#21201F]'>
                          {o.bonusEarned != null && o.bonusEarned > 0 && (
                            <span className='inline-flex items-center gap-1 font-medium'>
                              <CirclePlus size={16} strokeWidth={2} className='text-[#22A05A]' />
                              {o.bonusEarned}
                              <Coins size={14} strokeWidth={2} className='text-[#E0871A]' />
                            </span>
                          )}
                          {o.bonus != null && o.bonus > 0 && (
                            <span className='inline-flex items-center gap-1 font-medium'>
                              <CircleMinus size={16} strokeWidth={2} className='text-[#E0533A]' />
                              {o.bonus}
                              <Coins size={14} strokeWidth={2} className='text-[#E0871A]' />
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {isPending && (
                    <ResumePaymentRow expiresAt={o.paymentExpiresAt} />
                  )}
                </div>
                <ChevronRight size={20} className='text-[#C4C4C4] mt-9' />
              </div>
            </Link>
          );
        })}

        {hasNextPage && (
          <div ref={setSentinelNode} className='py-4 text-center'>
            {isFetchingNextPage ? (
              <Loader2 size={18} className='inline-block animate-spin text-[#9E9E9E]' />
            ) : (
              <span className='text-[12px] text-[#9E9E9E]'>···</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResumePaymentRow({ expiresAt }: { expiresAt?: string | null }) {
  const target = expiresAt ? new Date(expiresAt).getTime() : NaN;
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (Number.isNaN(target)) return;
    // первый тик через секунду — countdown стартует чуть позже, зато не
    // дёргаем setState синхронно в effect (react-hooks/set-state-in-effect).
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const remaining = Number.isNaN(target) || now === null ? null : target - now;
  const expired = remaining != null && remaining <= 0;

  let timeText = '';
  if (remaining != null && !expired) {
    const total = Math.floor(remaining / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    timeText = ` · ${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div
      className={`mt-3 inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-[13px] font-semibold ${
        expired
          ? 'bg-[#FDECEC] text-[#DC2626]'
          : 'bg-[#21201F] text-white'
      }`}
    >
      <CreditCard size={16} strokeWidth={2.2} />
      <span>{expired ? 'Время оплаты истекло' : `Продолжить оплату${timeText}`}</span>
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
