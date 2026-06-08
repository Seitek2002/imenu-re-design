'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';

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

// Палитра дизайн-системы Figma 402:591: монохром #323232/#7F7F7F + акцент-точка
// по статусу. Текст в `text-` нужен для livePulse (рисуется через currentColor).
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

/**
 * Активный заказ — компактный чип в одну строку (Figma 402:591).
 *   [● статус-точка] Заказ #id · СТАТУС            мета  ›
 *   тонкий прогресс-бар снизу
 * Тап ведёт на /order-status/[id] — детальные действия («Забрать», «Чек»)
 * живут там, чип лишь сигнализирует «заказ в работе».
 */
export default function ActiveOrderCard({ order, venueSlug }: Props) {
  const t = useTranslations('Widgets');

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

  // Мета справа: сумма для pending, иначе «прошло X». На «Готов»/«Отменён»
  // прячем — там статус самодостаточен.
  const meta = isPending
    ? `${order.totalPrice} ${t('currencyShort')}`
    : isCancelled || isReady
      ? null
      : elapsedLabel;

  return (
    <Link
      href={`/${venueSlug}/order-status/${order.id}`}
      className='relative block w-full cursor-pointer overflow-hidden rounded-[16px] bg-white px-4 py-3 shadow-[0px_4px_12px_rgba(115,115,115,0.12)] transition-[background-color,box-shadow] hover:bg-[#FAFAFA] hover:shadow-[0px_8px_20px_rgba(115,115,115,0.16)] active:bg-[#F5F5F5]'
    >
      <div className='flex items-center gap-2.5'>
        <span
          aria-hidden
          className={`h-2 w-2 shrink-0 rounded-full ${TONE_DOT_BG[tone]} ${
            isCancelled ? '' : styles.livePulse
          }`}
        />
        <span className='min-w-0 flex-1 truncate text-[13px] leading-tight'>
          <span className='font-medium text-[#7F7F7F]'>{t('orderLabel')} </span>
          <span className='font-semibold tabular-nums text-[#323232]'>
            #{order.id}
          </span>
          <span className='text-[#7F7F7F]'> · </span>
          <span className='font-semibold uppercase text-[#323232]'>
            {statusWord}
          </span>
        </span>
        {meta && (
          <span className='shrink-0 text-[12px] font-medium tabular-nums text-[#7F7F7F]'>
            {meta}
          </span>
        )}
        <ChevronRight
          aria-hidden
          size={18}
          strokeWidth={2}
          className='shrink-0 text-[#C4C4C4]'
        />
      </div>

      {!isCancelled && (
        <div className='mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[#E5E5E5]'>
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${TONE_BAR[tone]}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
      )}
    </Link>
  );
}
