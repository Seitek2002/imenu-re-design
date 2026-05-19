import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { API_V2_URL } from '@/lib/config';
import type { Locale } from '@/lib/locale';
import type { OrderV2 } from '@/lib/order';
import { ServiceMode } from '@/types/api';
import RepeatOrderButton from './RepeatOrderButton';
import PayNowButton from './PayNowButton';

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

const SERVICE_MODE_TONE: Record<number, { bg: string; fg: string }> = {
  [ServiceMode.Delivery]: { bg: 'bg-[#E7F1FF]', fg: 'text-[#2E7DFF]' },
  [ServiceMode.DineIn]: { bg: 'bg-[#E8F8EE]', fg: 'text-[#22A05A]' },
  [ServiceMode.Takeaway]: { bg: 'bg-[#F1ECFF]', fg: 'text-[#7A5AF8]' },
};

const SERVICE_MODE_KEY: Record<number, 'delivery' | 'dineIn' | 'takeaway'> = {
  [ServiceMode.Delivery]: 'delivery',
  [ServiceMode.DineIn]: 'dineIn',
  [ServiceMode.Takeaway]: 'takeaway',
};

const fmtDateParts = (iso: string | undefined, locale: Locale) => {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  const intlLocale = locale === 'ky' ? 'ky-KG' : locale === 'en' ? 'en-US' : 'ru-RU';
  const date = new Intl.DateTimeFormat(intlLocale, {
    day: 'numeric',
    month: 'short',
  }).format(d);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return { date, time };
};

const fmtMoney = (n: number, locale: Locale) => {
  const intlLocale = locale === 'ky' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'ru-RU';
  return Math.round(n).toLocaleString(intlLocale).replace(/,/g, ' ');
};

export default async function OrderDetailPage({ params }: Props) {
  const { venue, orderId } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('OrderDetail');
  const order = await fetchOrder(orderId, locale);
  if (!order) return notFound();

  const tone = SERVICE_MODE_TONE[order.serviceMode];
  const modeKey = SERVICE_MODE_KEY[order.serviceMode];
  const { date, time } = fmtDateParts(order.created_at, locale);
  const totalNum = Number(order.totalPrice);
  const itemsCount = order.orderProducts?.length ?? 0;
  const currency = t('currency');

  return (
    <div className='min-h-svh pb-24'>
      <header className='sticky top-0 z-20 bg-[#F8F6F7]/80 backdrop-blur-md px-4 h-14 flex items-center'>
        <Link
          href={`/${venue}/history`}
          className='w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform'
          aria-label={t('back')}
        >
          <ChevronLeft size={24} />
        </Link>
        <h1 className='absolute left-1/2 -translate-x-1/2 font-bold text-lg'>{t('title')}</h1>
      </header>

      <div className='px-4 mt-2 flex flex-col gap-3'>
        <section className='bg-white rounded-2xl px-4 py-4 flex items-start justify-between'>
          <div>
            <div className='text-[15px] font-bold text-[#21201F]'>
              {t('orderNumber', { id: order.id })}
            </div>
            {date && (
              <div className='mt-1 text-[13px] text-[#9E9E9E] flex items-center gap-1.5'>
                <span>{date}</span>
                <span className='inline-block w-[3px] h-[3px] rounded-full bg-[#C4C4C4]' />
                <span>{time}</span>
              </div>
            )}
          </div>
          {tone && modeKey && (
            <span
              className={`h-[26px] px-3 rounded-full text-[11px] font-medium inline-flex items-center ${tone.bg} ${tone.fg}`}
            >
              {t(`serviceMode.${modeKey}`)}
            </span>
          )}
        </section>

        <section className='bg-white rounded-2xl px-4 py-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-[15px] font-bold text-[#21201F]'>{t('items')}</h2>
            <div className='text-[13px] text-[#9E9E9E]'>{t('positions', { count: itemsCount })}</div>
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
                      {fmtMoney(Number(it.price), locale)} {currency}
                    </div>
                  </div>
                  <div className='text-[13px] text-[#9E9E9E] w-10 text-right'>
                    {t('qty', { count: it.count })}
                  </div>
                  <div className='text-[13px] font-semibold text-[#21201F] w-16 text-right'>
                    {fmtMoney(lineTotal, locale)} {currency}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className='bg-white rounded-2xl px-4 py-4'>
          <div className='flex items-center justify-between'>
            <span className='text-[14px] text-[#21201F]'>{t('total')}</span>
            <span className='text-[16px] font-bold text-[#21201F]'>
              {fmtMoney(totalNum, locale)} {currency}
            </span>
          </div>
        </section>

        <DetailsBlock order={order} />

        {order.paymentStatus === 'pending' && order.paymentUrl && (
          <PayNowButton
            paymentUrl={order.paymentUrl}
            expiresAt={order.paymentExpiresAt}
          />
        )}

        <RepeatOrderButton order={order} />
      </div>
    </div>
  );
}

async function DetailsBlock({ order }: { order: OrderV2 }) {
  const t = await getTranslations('OrderDetail');
  const tableNum = order.tableNum ?? order.table?.tableNum;
  const rows: { label: string; value: string }[] = [];
  if (order.paymentStatus && order.paymentStatus !== 'not_required') {
    const label = t(`paymentStatus.${order.paymentStatus}`);
    rows.push({ label: t('rowPaymentStatus'), value: label });
  }
  if (order.statusText) rows.push({ label: t('rowOrderStatus'), value: order.statusText });
  if (order.serviceMode === ServiceMode.DineIn && tableNum)
    rows.push({ label: t('rowTable'), value: t('rowTableValue', { num: tableNum }) });
  if (order.serviceMode === ServiceMode.Delivery && order.address)
    rows.push({ label: t('rowDeliveryAddress'), value: order.address });
  if (order.needsCutlery) rows.push({ label: t('rowCutlery'), value: t('rowCutleryYes') });
  if (order.comment) rows.push({ label: t('rowComment'), value: order.comment });

  if (rows.length === 0) return null;
  return (
    <section className='bg-white rounded-2xl px-4 py-4 flex flex-col gap-3'>
      {rows.map((r) => (
        <div key={r.label} className='flex items-start justify-between gap-3 text-[13px]'>
          <span className='text-[#9E9E9E] shrink-0'>{r.label}</span>
          <span className='text-[#21201F] font-medium text-right break-words'>{r.value}</span>
        </div>
      ))}
    </section>
  );
}
