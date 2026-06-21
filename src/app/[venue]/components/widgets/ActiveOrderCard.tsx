'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Check, ChevronRight } from 'lucide-react';

import { ServiceMode } from '@/types/api';
import type { OrderV2 } from '@/lib/order';
import { statusToStepIndex } from '@/lib/helpers/progressHelper';
import { safeImageSrc } from '@/lib/image';

import styles from './widgets.module.css';

interface Props {
  order: OrderV2;
  venueSlug: string;
}

type ModeKey = 'takeout' | 'delivery' | 'dinein';

function modeKey(mode: number): ModeKey {
  if (mode === ServiceMode.Delivery) return 'delivery';
  if (mode === ServiceMode.DineIn) return 'dinein';
  return 'takeout';
}

// Кол-во шагов на чипе совпадает с STEPS_COUNT в progressHelper (dine-in = 3).
const STEP_COUNT: Record<ModeKey, number> = {
  takeout: 4,
  delivery: 4,
  dinein: 3,
};

/**
 * Активный заказ — карточка с горизонтальным степпером (Figma 471:765).
 *
 *   Заказ №856                              12.04.2026, 12:55
 *   ✓──────●┄┄┄┄┄○┄┄┄┄┄○
 *   Принят  Готовится  Готов   В пути
 *   ──────────────────────────────────────────────────
 *   (•••) 3 позиции                                    ›
 *
 * Шаги:  ✓ пройден (зелёный + галочка), ● текущий (светлое кольцо + точка,
 * пульсирует), ○ предстоящий (серый). Линия слева от текущего — сплошная
 * зелёная, справа — пунктир. Тап ведёт на /order-status/[id], где живут
 * детальные действия («Забрать», «Чек»).
 */
export default function ActiveOrderCard({ order, venueSlug }: Props) {
  const t = useTranslations('Widgets');
  const locale = useLocale();

  const mk = modeKey(order.serviceMode);
  const total = STEP_COUNT[mk];
  const current = Math.max(0, Math.min(total - 1, statusToStepIndex(order.status, order.serviceMode)));

  const products = order.orderProducts ?? [];
  const itemsCount = products.length;
  const avatars = products.slice(0, 3);

  const dateLabel = (() => {
    if (!order.createdAt) return null;
    const d = new Date(order.createdAt);
    if (Number.isNaN(d.getTime())) return null;
    const date = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
    const time = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
    return `${date}, ${time}`;
  })();

  return (
    <Link
      href={`/${venueSlug}/order-status/${order.id}`}
      className='block w-full cursor-pointer rounded-[24px] bg-white p-4 shadow-[0px_4px_12px_rgba(115,115,115,0.12)] transition-[box-shadow] hover:shadow-[0px_8px_20px_rgba(115,115,115,0.16)]'
    >
      <div className='flex flex-col gap-6'>
        {/* Заголовок: № заказа + дата */}
        <div className='flex items-center justify-between gap-2'>
          <p className='truncate text-[16px] font-medium text-[#323232]'>
            {t('orderLabel')} №{order.id}
          </p>
          {dateLabel && (
            <p className='shrink-0 text-[14px] tabular-nums text-[#323232]'>
              {dateLabel}
            </p>
          )}
        </div>

        {/* Степпер — track ≈92% ширины по центру (как w-412 в макете 471:765),
            чтобы крайние узлы не липли к краю карточки. */}
        <div className='flex w-[92%] flex-col gap-2 self-center'>
          {/* Узлы по краям track'а + линии-соединители (flex-1) между ними */}
          <div className='flex items-center'>
            {Array.from({ length: total }, (_, i) => {
              const done = i < current;
              const active = i === current;
              return (
                <Fragment key={i}>
                  <span
                    aria-hidden
                    className={`relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ${
                      done
                        ? 'bg-[#34C759] text-white'
                        : active
                          ? `bg-[rgba(52,199,89,0.26)] text-[#34C759] ${styles.stepRingPulse}`
                          : 'bg-[#ECECEC]'
                    }`}
                  >
                    {done && <Check size={13} strokeWidth={3} />}
                    {active && (
                      <span className='h-2.5 w-2.5 rounded-full bg-[#34C759]' />
                    )}
                  </span>
                  {i < total - 1 && (
                    <span
                      aria-hidden
                      className={`h-[1.5px] flex-1 rounded-full ${
                        done ? 'bg-[#34C759]' : styles.dashLine
                      }`}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>

          {/* Подписи, спозиционированные под центрами узлов */}
          <div className='relative h-4'>
            {Array.from({ length: total }, (_, i) => {
              const done = i < current;
              const active = i === current;
              const isFirst = i === 0;
              const isLast = i === total - 1;
              // Узлы 22px прижаты к краям → центр узла i:
              // 11px + (доступная ширина) * i/(total-1). Крайние подписи
              // выравниваем по краю, чтобы не вылезать за карточку.
              const style = isFirst
                ? { left: 0 }
                : isLast
                  ? { right: 0 }
                  : {
                      left: `calc(11px + (100% - 22px) * ${i} / ${total - 1})`,
                      transform: 'translateX(-50%)',
                    };
              return (
                <span
                  key={i}
                  style={style}
                  className={`absolute top-0 whitespace-nowrap text-[12px] leading-tight ${
                    isFirst ? 'text-left' : isLast ? 'text-right' : 'text-center'
                  } ${
                    active
                      ? 'font-semibold text-[#323232]'
                      : done
                        ? 'font-medium text-[#323232]'
                        : 'font-normal text-[#7F7F7F]'
                  }`}
                >
                  {t(`stepLabels.${mk}.${i}`)}
                </span>
              );
            })}
          </div>
        </div>

        {/* Разделитель */}
        <div className='h-px w-full bg-[#ECECEC]' />

        {/* Футер: позиции + шеврон */}
        <div className='flex items-center justify-between gap-4'>
          <div className='flex min-w-0 items-center gap-4'>
            {avatars.length > 0 && (
              <div className='flex shrink-0 items-center'>
                {avatars.map((p, i) => {
                  const photo = safeImageSrc(
                    p.product.productPhotoSmall || p.product.productPhoto,
                    null,
                  );
                  return (
                    <div
                      key={p.id ?? i}
                      className={`relative h-[30px] w-[30px] overflow-hidden rounded-full bg-[#F1F2F3] ring-2 ring-white ${
                        i > 0 ? '-ml-[14px]' : ''
                      }`}
                      style={{ zIndex: avatars.length - i }}
                    >
                      {photo ? (
                        <Image
                          src={photo}
                          alt={p.product.productName}
                          fill
                          sizes='30px'
                          className='object-cover'
                        />
                      ) : (
                        <span className='flex h-full w-full items-center justify-center text-[12px] font-medium text-[#7F7F7F]'>
                          {p.product.productName?.charAt(0) ?? '·'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <p className='truncate text-[14px] text-[#323232]'>
              {t('itemsCount', { n: itemsCount })}
            </p>
          </div>
          <ChevronRight
            aria-hidden
            size={20}
            strokeWidth={2}
            className='shrink-0 text-[#C4C4C4]'
          />
        </div>
      </div>
    </Link>
  );
}
