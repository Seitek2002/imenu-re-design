'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { safeImageSrc } from '@/lib/image';
import { useTranslations } from 'next-intl';
import { ChefHat } from 'lucide-react';

import { OrderStatus, ServiceMode } from '@/types/api';
import type { OrderV2 } from '@/lib/order';
import { statusToStepIndex } from '@/lib/helpers/progressHelper';

import styles from './widgets.module.css';

type Tone = 'brand' | 'green' | 'amber' | 'red';

interface Props {
  order: OrderV2;
  venueSlug: string;
}

function pickTone(status: number): Tone {
  if (status === OrderStatus.PendingPayment) return 'amber';
  if (status === OrderStatus.Cancelled) return 'red';
  if (status === OrderStatus.Ready) return 'green';
  return 'brand';
}

function statusShortKey(status: number, mk: string): string {
  if (status === OrderStatus.PendingPayment) return 'pending';
  if (status === OrderStatus.Cancelled) return 'cancelled';
  if (status === OrderStatus.Ready) return 'ready';
  if (status === OrderStatus.InDelivery || mk === 'delivery') return 'delivery';
  if (status === OrderStatus.Preparing) return 'preparing';
  return 'accepted';
}

function modeKey(mode: number): 'takeout' | 'delivery' | 'dinein' {
  if (mode === ServiceMode.Delivery) return 'delivery';
  if (mode === ServiceMode.DineIn) return 'dinein';
  return 'takeout';
}

// Палитра дизайн-системы Figma 402:591 (BonusHero): монохром #323232/#7F7F7F +
// акценты по статусу. Карточка переиспользует его язык — пилюля статуса в
// шапке, серые #F3F3F3 под-карточки, тёмный прогресс-бар как у «До статуса».
const TONE_DOT_BG: Record<Tone, string> = {
  brand: 'bg-[#F28A1A] text-[#F28A1A]',
  green: 'bg-[#34C759] text-[#34C759]',
  amber: 'bg-[#F59E0B] text-[#F59E0B]',
  red: 'bg-[#EF4444] text-[#EF4444]',
};
const TONE_BAR: Record<Tone, string> = {
  brand: 'bg-[#F28A1A]',
  green: 'bg-[#34C759]',
  amber: 'bg-[#F59E0B]',
  red: 'bg-[#EF4444]',
};

export default function ActiveOrderCard({ order, venueSlug }: Props) {
  const t = useTranslations('Widgets');
  const ts = useTranslations('OrderStatus');

  const tone = pickTone(order.status);
  const mk = modeKey(order.serviceMode);
  const stepIdx = statusToStepIndex(order.status, order.serviceMode);
  const isPending = order.status === OrderStatus.PendingPayment;
  const isReady = order.status === OrderStatus.Ready;
  const isCancelled = order.status === OrderStatus.Cancelled;

  const stepCount = mk === 'dinein' ? 3 : 4;
  const clampedIdx = Math.max(0, Math.min(stepCount - 1, stepIdx));
  const fillPct =
    isReady || order.status === OrderStatus.Completed
      ? 100
      : isPending
        ? 8
        : Math.min(100, (clampedIdx / (stepCount - 1)) * 100);

  // Elapsed since createdAt — ETA с бэка ещё нет, показываем «прошло X мин»
  // как сигнал, что заказ живой. Тикаем раз в 30 сек.
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const createdMs = order.createdAt ? new Date(order.createdAt).getTime() : NaN;
  const elapsedMin = Number.isFinite(createdMs)
    ? Math.max(0, Math.floor((now - createdMs) / 60_000))
    : 0;
  const elapsedLabel =
    elapsedMin < 1
      ? t('elapsedJustNow')
      : t('elapsedAgo', { min: elapsedMin });

  const statusWord = t(`statusShort.${statusShortKey(order.status, mk)}`);

  // Заголовок прогресс-блока: текущий шаг (для pending — «Ожидает оплату»).
  const progressLabel = isPending
    ? ts('pendingPayment')
    : ts(`steps.${mk}.${clampedIdx}_title`);

  // Мета справа в прогресс-блоке: сумма для pending, иначе «прошло X».
  const progressMeta = isPending
    ? `${order.totalPrice} ${t('currencyShort')}`
    : elapsedLabel;

  return (
    <Link
      href={`/${venueSlug}/order-status/${order.id}`}
      className='block w-full rounded-[24px] bg-white p-4 shadow-[0px_4px_12px_rgba(115,115,115,0.12)] transition-colors active:bg-[#FAFAFA]'
    >
      {/* шапка: ЗАКАЗ #id  |  пилюля статуса */}
      <div className='flex items-center justify-between gap-2'>
        <span className='min-w-0 truncate text-[12px] font-medium uppercase text-[#7F7F7F]'>
          {t('orderLabel')}{' '}
          <span className='font-semibold tabular-nums text-[#323232]'>
            #{order.id}
          </span>
        </span>
        <div className='inline-flex shrink-0 items-center gap-1.5 rounded-[10px] bg-[#323232] px-2.5 py-1.5'>
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full ${TONE_DOT_BG[tone]} ${
              isCancelled ? '' : styles.livePulse
            }`}
          />
          <span className='text-[10px] font-medium uppercase text-white'>
            {statusWord}
          </span>
        </div>
      </div>

      {/* тело */}
      <div className='mt-2.5 flex flex-col gap-2.5'>
        {isCancelled ? (
          <div className='rounded-[16px] bg-[#F3F3F3] p-4'>
            <p className='text-[16px] font-semibold leading-tight text-[#323232]'>
              {ts('cancelled')}
            </p>
            <p className='mt-1 text-[12px] font-medium leading-tight text-[#7F7F7F]'>
              {ts('cancelledDesc')}
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-3 rounded-[16px] bg-[#F3F3F3] p-4'>
            <div className='flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1'>
              <span className='min-w-0 text-[14px] font-medium leading-tight text-[#323232]'>
                {progressLabel}
              </span>
              <span className='text-[12px] font-medium tabular-nums text-[#7F7F7F]'>
                {progressMeta}
              </span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-[10px] bg-[#E5E5E5]'>
              <div
                className={`h-full rounded-[10px] transition-[width] duration-500 ${TONE_BAR[tone]}`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>
        )}

        {isReady ? (
          <div className='flex gap-2'>
            <button
              type='button'
              className='h-[42px] flex-1 rounded-[14px] bg-[#34C759] px-3 text-[13px] font-semibold text-white transition-transform active:scale-[0.98]'
            >
              {mk === 'delivery' ? t('cta.openMap') : t('cta.pickup')}
            </button>
            <button
              type='button'
              className='h-[42px] flex-1 rounded-[14px] bg-[#F3F3F3] px-3 text-[13px] font-semibold text-[#323232] transition-transform active:scale-[0.98]'
            >
              {t('cta.receipt')}
            </button>
          </div>
        ) : !isCancelled && order.orderProducts?.length ? (
          <div className='flex items-center justify-between gap-2 rounded-[16px] bg-[#F3F3F3] px-4 py-3'>
            <ItemsStack products={order.orderProducts} />
            <div className='text-[12px] font-medium text-[#7F7F7F]'>
              <b className='font-semibold text-[#323232] tabular-nums'>
                {order.totalPrice} {t('currencyShort')}
              </b>{' '}
              · {t('itemsCount', { n: order.orderProducts.length })}
            </div>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function ItemsStack({ products }: { products: OrderV2['orderProducts'] }) {
  const shown = products.slice(0, 3);
  const extra = products.length - shown.length;
  return (
    <div className='flex items-center'>
      {shown.map((p, i) => {
        const img = safeImageSrc(
          p.product?.productPhotoSmall || p.product?.productPhoto,
          null,
        );
        return (
          <div
            key={i}
            className='relative -ml-2 grid h-[30px] w-[30px] place-items-center overflow-hidden rounded-full border-2 border-white bg-[#E5E5E5] text-sm shadow-sm first:ml-0'
          >
            {img ? (
              <Image
                src={img}
                alt=''
                fill
                className='object-cover'
                sizes='30px'
              />
            ) : (
              <ChefHat size={14} className='text-[#7F7F7F]' aria-hidden />
            )}
          </div>
        );
      })}
      {extra > 0 && (
        <div className='-ml-2 grid h-[30px] w-[30px] place-items-center rounded-full border-2 border-white bg-[#323232] text-[10px] font-semibold text-white'>
          +{extra}
        </div>
      )}
    </div>
  );
}
