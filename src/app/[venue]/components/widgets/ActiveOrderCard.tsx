'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { safeImageSrc } from '@/lib/image';
import { useTranslations } from 'next-intl';
import { ChefHat, Wallet } from 'lucide-react';

import { OrderStatus, ServiceMode } from '@/types/api';
import type { OrderV2 } from '@/lib/order';
import { statusToStepIndex } from '@/lib/helpers/progressHelper';

import StepIndicator, { type StepLadder } from './StepIndicator';
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

function modeKey(mode: number): 'takeout' | 'delivery' | 'dinein' {
  if (mode === ServiceMode.Delivery) return 'delivery';
  if (mode === ServiceMode.DineIn) return 'dinein';
  return 'takeout';
}

const TONE_TINT: Record<Tone, string> = {
  brand: styles.toneBrand,
  green: styles.toneGreen,
  amber: styles.toneAmber,
  red: styles.toneRed,
};
const TONE_DOT_BG: Record<Tone, string> = {
  brand: 'bg-brand text-brand',
  green: 'bg-[#22A05A] text-[#22A05A]',
  amber: 'bg-amber-600 text-amber-600',
  red: 'bg-red-600 text-red-600',
};
const TONE_ACCENT: Record<Tone, string> = {
  brand: 'text-brand',
  green: 'text-[#22A05A]',
  amber: 'text-amber-600',
  red: 'text-red-600',
};

export default function ActiveOrderCard({
  order,
  venueSlug,
}: Props) {
  const t = useTranslations('Widgets');
  const ts = useTranslations('OrderStatus');

  const tone = pickTone(order.status);
  const mk = modeKey(order.serviceMode);
  const stepIdx = statusToStepIndex(order.status, order.serviceMode);
  const isPending = order.status === OrderStatus.PendingPayment;
  const isReady = order.status === OrderStatus.Ready;
  const isCancelled = order.status === OrderStatus.Cancelled;

  const stepCount = mk === 'dinein' ? 3 : 4;
  const ladder: StepLadder = Array.from({ length: stepCount }, (_, i) => ({
    key: `${mk}-${i}`,
    label: ts(`steps.${mk}.${i}_title`),
  }));

  // Elapsed since createdAt — ETA с бэка ещё нет, показываем «прошло X мин»
  // как сигнал, что заказ живой. Тикаем раз в 30 сек, чтобы лейбл оставался
  // свежим без перерендера всего виджета.
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

  const headline = (() => {
    if (isPending)
      return (
        <>
          {t('headline.pendingPrefix')}{' '}
          <span className={TONE_ACCENT[tone]}>
            {t('headline.pendingAccent')}
          </span>
        </>
      );
    if (isCancelled) return ts('cancelled');
    if (isReady)
      return (
        <>
          {t('headline.readyPrefix')}{' '}
          <span className={TONE_ACCENT[tone]}>
            {t(`headline.ready_${mk}`)}
          </span>
        </>
      );
    if (order.status === OrderStatus.Preparing)
      return (
        <>
          {t('headline.preparingPrefix')}{' '}
          <span className={TONE_ACCENT[tone]}>
            {t('headline.preparingAccent')}
          </span>
        </>
      );
    if (order.status === OrderStatus.InDelivery)
      return (
        <>
          {t('headline.deliveryPrefix')}{' '}
          <span className={TONE_ACCENT[tone]}>
            {t('headline.deliveryAccent')}
          </span>
        </>
      );
    return (
      <>
        {t('headline.acceptedPrefix')}{' '}
        <span className={TONE_ACCENT[tone]}>
          {t('headline.acceptedAccent')}
        </span>
      </>
    );
  })();

  const sub = (() => {
    if (isPending)
      return t.rich('subPending', {
        b: (chunks) => <b className='font-bold text-[#4B4742]'>{chunks}</b>,
      });
    if (isCancelled) return t('subCancelled');
    if (isReady)
      return mk === 'delivery'
        ? t('subReadyDelivery')
        : t.rich('subReadyTakeout', {
            table: order.tableNum ?? '—',
            b: (chunks) => (
              <b className='font-bold text-[#4B4742]'>{chunks}</b>
            ),
          });
    if (mk === 'delivery')
      return t.rich('subDelivery', {
        elapsed: elapsedLabel,
        address: order.address ?? t('addressFallback'),
        b: (chunks) => (
          <b className='font-bold text-[#4B4742] tabular-nums'>{chunks}</b>
        ),
      });
    if (mk === 'dinein')
      return t.rich('subDinein', {
        elapsed: elapsedLabel,
        table: order.tableNum ?? '—',
        b: (chunks) => (
          <b className='font-bold text-[#4B4742] tabular-nums'>{chunks}</b>
        ),
      });
    return t.rich('subTakeout', {
      elapsed: elapsedLabel,
      b: (chunks) => (
        <b className='font-bold text-[#4B4742] tabular-nums'>{chunks}</b>
      ),
    });
  })();

  const cardCls = `relative overflow-hidden rounded-[22px] p-[18px] bg-white cursor-pointer shadow-[0_1px_0_rgba(40,28,16,0.04),_0_14px_32px_-20px_rgba(40,28,16,0.18)] active:translate-y-px active:scale-[0.997] transition-all block w-full text-left ${TONE_TINT[tone]}`;

  const inner = (
    <>
      <div className='relative flex items-center justify-between gap-2.5'>
        <div className='flex items-center gap-2 text-[11.5px] font-bold tracking-wider text-[#8E8780]'>
          <span
            aria-hidden
            className={`relative h-2 w-2 rounded-full ${TONE_DOT_BG[tone]} ${styles.livePulse}`}
          />
          <span>{t('orderLabel')}&nbsp;</span>
          <span className='tabular-nums font-extrabold text-[#0E0E0F] tracking-wide'>
            #{order.id}
          </span>
        </div>

        {isPending && (
          <div className='inline-flex h-7 items-center gap-1.5 rounded-full bg-amber-100 px-3 text-[12px] font-bold text-amber-700 tabular-nums'>
            <Wallet size={13} />
            {order.totalPrice} {t('currencyShort')}
          </div>
        )}
      </div>

      <h3 className='relative mt-3.5 text-[22px] font-bold leading-tight tracking-tight text-[#0E0E0F]'>
        {headline}
      </h3>
      <p className='relative mt-1 text-[12.5px] leading-snug font-medium text-[#8E8780]'>
        {sub}
      </p>

      {!isCancelled && (
        <StepIndicator ladder={ladder} currentIndex={stepIdx} tone={tone} />
      )}

      {isReady ? (
        <div className='relative mt-3 flex gap-2'>
          <button
            type='button'
            className='h-[42px] flex-1 rounded-[14px] bg-[#22A05A] px-3 text-[13px] font-bold tracking-wide text-white transition-transform active:scale-[0.98]'
          >
            {mk === 'delivery' ? t('cta.openMap') : t('cta.pickup')}
          </button>
          <button
            type='button'
            className='h-[42px] flex-1 rounded-[14px] bg-[#FAF6F1] px-3 text-[13px] font-bold tracking-wide text-[#0E0E0F] transition-transform active:scale-[0.98]'
          >
            {t('cta.receipt')}
          </button>
        </div>
      ) : !isCancelled && order.orderProducts?.length ? (
        <div className='relative mt-1.5 flex items-center justify-between gap-2 border-t border-[#ECE6DE]/60 pt-3.5'>
          <ItemsStack products={order.orderProducts} />
          <div className='text-[12px] font-medium text-[#8E8780]'>
            <b className='font-bold text-[#4B4742] tabular-nums'>
              {order.totalPrice} {t('currencyShort')}
            </b>{' '}
            · {t('itemsCount', { n: order.orderProducts.length })}
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <Link href={`/${venueSlug}/order-status/${order.id}`} className={cardCls}>
      {inner}
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
            className='relative -ml-2 grid h-[30px] w-[30px] place-items-center overflow-hidden rounded-full border-2 border-white bg-[#FAF6F1] text-sm shadow-sm first:ml-0'
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
              <ChefHat size={14} className='text-[#8E8780]' aria-hidden />
            )}
          </div>
        );
      })}
      {extra > 0 && (
        <div className='-ml-2 grid h-[30px] w-[30px] place-items-center rounded-full border-2 border-white bg-[#0E0E0F] text-[10px] font-bold tracking-wide text-white'>
          +{extra}
        </div>
      )}
    </div>
  );
}
