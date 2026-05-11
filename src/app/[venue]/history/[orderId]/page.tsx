import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { API_V2_URL } from '@/lib/config';
import type { Locale } from '@/lib/locale';
import type { OrderV2 } from '@/lib/order';
import { ServiceMode } from '@/types/api';

interface Props {
  params: Promise<{ venue: string; orderId: string }>;
}

async function fetchOrder(id: string, locale: Locale): Promise<OrderV2 | null> {
  try {
    const res = await fetch(`${API_V2_URL}/orders/${id}/`, {
      cache: 'no-store',
      headers: { 'Accept-Language': locale },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error('history detail fetch failed:', e);
    return null;
  }
}

const TYPE_LABEL: Record<number, { label: string; bg: string; fg: string }> = {
  [ServiceMode.Delivery]: { label: 'Доставка', bg: 'bg-[#E7F1FF]', fg: 'text-[#2E7DFF]' },
  [ServiceMode.DineIn]: { label: 'На месте', bg: 'bg-[#E8F8EE]', fg: 'text-[#22A05A]' },
  [ServiceMode.Takeaway]: { label: 'Самовывоз', bg: 'bg-[#F1ECFF]', fg: 'text-[#7A5AF8]' },
};

const monthShort = [
  'янв', 'фев', 'мар', 'апр', 'май', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
];

const fmtDate = (iso?: string) => {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  return {
    date: `${d.getDate()} ${monthShort[d.getMonth()]}`,
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
  };
};

const fmtMoney = (n: number) =>
  Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');

export default async function OrderDetailPage({ params }: Props) {
  const { venue, orderId } = await params;
  const locale = (await getLocale()) as Locale;
  const order = await fetchOrder(orderId, locale);
  if (!order) return notFound();

  const t = TYPE_LABEL[order.serviceMode];
  const { date, time } = fmtDate(order.created_at);
  const totalNum = Number(order.totalPrice);
  const itemsCount = order.orderProducts?.length ?? 0;

  return (
    <div className='min-h-svh pb-24'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venue}/history`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label='Назад'
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>Детали заказа</h1>
      </header>

      <div className='px-4 mt-2 flex flex-col gap-3'>
        <section className='bg-white rounded-2xl px-4 py-4 flex items-start justify-between'>
          <div>
            <div className='text-[15px] font-bold text-[#21201F]'>Заказ № {order.id}</div>
            {date && (
              <div className='mt-1 text-[13px] text-[#9E9E9E] flex items-center gap-1.5'>
                <span>{date}</span>
                <span className='inline-block w-[3px] h-[3px] rounded-full bg-[#C4C4C4]' />
                <span>{time}</span>
              </div>
            )}
          </div>
          {t && (
            <span
              className={`h-[26px] px-3 rounded-full text-[11px] font-medium inline-flex items-center ${t.bg} ${t.fg}`}
            >
              {t.label}
            </span>
          )}
        </section>

        <section className='bg-white rounded-2xl px-4 py-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-[15px] font-bold text-[#21201F]'>Блюда</h2>
            <div className='text-[13px] text-[#9E9E9E]'>{itemsCount} позиций</div>
          </div>

          <ul className='mt-3 flex flex-col gap-3'>
            {order.orderProducts?.map((it) => {
              const img = it.product.productPhotoSmall || it.product.productPhoto;
              const lineTotal = Number(it.price) * it.count;
              return (
                <li key={`${it.id}-${it.modificator}`} className='flex items-center gap-3'>
                  <div className='relative w-[42px] h-[38px] rounded-lg overflow-hidden bg-[#F4F1EE] flex items-center justify-center shrink-0'>
                    {img ? (
                      <Image src={img} alt={it.product.productName} fill className='object-cover' />
                    ) : (
                      <span className='text-lg'>🍔</span>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-[13px] font-medium text-[#21201F] truncate'>
                      {it.product.productName}
                    </div>
                    <div className='text-[12px] text-[#9E9E9E] mt-0.5'>
                      {fmtMoney(Number(it.price))} с
                    </div>
                  </div>
                  <div className='text-[13px] text-[#9E9E9E] w-10 text-right'>{it.count} шт</div>
                  <div className='text-[13px] font-semibold text-[#21201F] w-16 text-right'>
                    {fmtMoney(lineTotal)} с
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className='bg-white rounded-2xl px-4 py-4'>
          <div className='flex items-center justify-between'>
            <span className='text-[14px] text-[#21201F]'>Итого</span>
            <span className='text-[16px] font-bold text-[#21201F]'>{fmtMoney(totalNum)} с</span>
          </div>
        </section>

        {order.serviceMode === ServiceMode.DineIn && order.table?.tableNum && (
          <section className='bg-white rounded-2xl px-4 py-4'>
            <div className='flex items-center justify-between text-[13px]'>
              <span className='text-[#9E9E9E]'>Стол</span>
              <span className='text-[#21201F] font-medium'>№ {order.table.tableNum}</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
