'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Coins } from 'lucide-react';

import type { OrderV2 } from '@/lib/order';

const fmtMoney = (n: number, locale: string) => {
  const intl = locale === 'en' ? 'en-US' : 'ru-RU';
  return Math.round(n).toLocaleString(intl).replace(/,/g, ' ');
};

type Row = {
  label: string;
  value: string;
  tone?: 'free' | 'minus' | 'plus';
};

export default function OrderBreakdown({ order }: { order: OrderV2 }) {
  const t = useTranslations('OrderDetail');
  const tStatus = useTranslations('OrderStatus');
  const locale = useLocale();
  const currency = t('currency');

  const rows: Row[] = [];

  if (order.itemsTotal && Number(order.itemsTotal) > 0) {
    rows.push({
      label: t('breakdown.itemsTotal'),
      value: `${fmtMoney(Number(order.itemsTotal), locale)} ${currency}`,
    });
  }
  if (order.containerTotal && Number(order.containerTotal) > 0) {
    rows.push({
      label: t('breakdown.containerTotal'),
      value: `${fmtMoney(Number(order.containerTotal), locale)} ${currency}`,
    });
  }
  if (
    order.promotionDiscountAmount &&
    Number(order.promotionDiscountAmount) > 0
  ) {
    rows.push({
      label: t('breakdown.promotionDiscount'),
      value: `−${fmtMoney(Number(order.promotionDiscountAmount), locale)} ${currency}`,
      tone: 'minus',
    });
  }
  if (order.servicePrice && Number(order.servicePrice) > 0) {
    rows.push({
      label: t('breakdown.servicePrice'),
      value: `${fmtMoney(Number(order.servicePrice), locale)} ${currency}`,
    });
  }
  if (order.deliveryPrice != null) {
    const n = Number(order.deliveryPrice);
    rows.push({
      label: t('breakdown.deliveryPrice'),
      value: n > 0 ? `${fmtMoney(n, locale)} ${currency}` : t('breakdown.free'),
      tone: n > 0 ? undefined : 'free',
    });
  }

  const totalNum = Number(order.totalPrice);

  return (
    <section className='bg-white rounded-[20px] px-5 py-4 mt-4 shadow-sm flex flex-col gap-2'>
      {rows.map((r) => (
        <div
          key={r.label}
          className='flex items-center justify-between text-[13px]'
        >
          <span className='text-gray-500'>{r.label}</span>
          <span
            className={`inline-flex items-center gap-1 font-medium tabular-nums ${
              r.tone === 'minus'
                ? 'text-[#E0533A]'
                : r.tone === 'free'
                  ? 'text-[#22A05A]'
                  : 'text-[#21201F]'
            }`}
          >
            {r.value}
          </span>
        </div>
      ))}
      {order.bonus != null && order.bonus > 0 && (
        <div className='flex items-center justify-between text-[13px]'>
          <span className='text-gray-500'>{t('breakdown.bonus')}</span>
          <span className='inline-flex items-center gap-1 font-medium text-[#21201F] tabular-nums'>
            −{fmtMoney(order.bonus, locale)}
            <Coins size={14} strokeWidth={2} className='text-[#E0871A]' />
          </span>
        </div>
      )}
      {rows.length > 0 && <div className='h-px bg-[#EDEAE7] my-1' />}
      <div className='flex items-center justify-between'>
        <span className='text-gray-500 font-medium'>{tStatus('totalDue')}</span>
        <span className='text-2xl font-bold text-brand tabular-nums'>
          {fmtMoney(totalNum, locale)} {currency}
        </span>
      </div>
      {order.bonusEarned != null && order.bonusEarned > 0 && (
        <div className='flex items-center justify-between text-[12px]'>
          <span className='text-gray-500'>{t('breakdown.bonusEarned')}</span>
          <span className='inline-flex items-center gap-1 font-medium text-[#21201F] tabular-nums'>
            +{fmtMoney(order.bonusEarned, locale)}
            <Coins size={14} strokeWidth={2} className='text-[#E0871A]' />
          </span>
        </div>
      )}
    </section>
  );
}
