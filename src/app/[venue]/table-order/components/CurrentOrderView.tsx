'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { useVenueStore } from '@/store/venue';
import {
  useCreatePosPaymentLink,
  useCurrentPosOrder,
} from '@/lib/api/pos-orders';
import { useTableOrderSocket } from '@/hooks/useTableOrderSocket';
import { useMounted } from '@/hooks/useMounted';
import { PosOrder } from '@/types/pos-order';

interface Props {
  venueSlug: string;
}

function toNumber(value: string | undefined | null): number {
  if (!value) return 0;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(value: string): string {
  return Math.round(toNumber(value)).toString();
}

function formatQty(qty: string): string {
  const n = toNumber(qty);
  // Trim trailing zeros for whole numbers.
  return Number.isInteger(n) ? String(n) : n.toString();
}

export default function CurrentOrderView({ venueSlug }: Props) {
  const t = useTranslations('TableOrder');
  const queryClient = useQueryClient();
  const mounted = useMounted();
  const tableId = useVenueStore((s) => s.tableId);
  const tableNumberFromStore = useVenueStore((s) => s.tableNumber);

  const {
    data: restOrder,
    isLoading,
    isError,
    refetch,
  } = useCurrentPosOrder(tableId);

  const {
    order: wsOrder,
    hasSnapshot,
    isConnected,
    reconnectKey,
  } = useTableOrderSocket(tableId);

  // Resync REST after WS reconnects (per spec).
  useEffect(() => {
    if (reconnectKey > 0) {
      queryClient.invalidateQueries({
        queryKey: ['pos-order', 'current', tableId],
      });
    }
  }, [reconnectKey, queryClient, tableId]);

  // WS snapshot wins once received; otherwise fall back to REST.
  const order: PosOrder | null = hasSnapshot ? wsOrder : (restOrder ?? null);

  const paymentMutation = useCreatePosPaymentLink();
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const tableLabel = order?.tableName ?? tableNumberFromStore ?? '';

  const totalNum = toNumber(order?.total);
  const paidNum = toNumber(order?.paidAmount);
  const remaining = Math.max(0, totalNum - paidNum);
  const canPay = !!order && remaining > 0;

  const onPay = async () => {
    if (!order) return;
    setPaymentError(null);
    try {
      const res = await paymentMutation.mutateAsync(order.id);
      if (res.payment_url) {
        window.location.href = res.payment_url;
      }
    } catch (err: unknown) {
      const errObj = err as { error?: string } | null;
      setPaymentError(errObj?.error || t('payment.unavailable'));
    }
  };

  const statusVariant = useMemo(() => {
    if (!order) return null;
    return order.status;
  }, [order]);

  if (!mounted) {
    return (
      <div className='bg-white rounded-2xl shadow-sm p-6 text-center text-[#6B6B6B]'>
        {t('loading')}
      </div>
    );
  }

  if (!tableId) {
    return (
      <div className='bg-white rounded-2xl shadow-sm p-6 text-center text-[#6B6B6B]'>
        {t('noTable')}
      </div>
    );
  }

  if (isLoading && !hasSnapshot) {
    return (
      <div className='bg-white rounded-2xl shadow-sm p-6 text-center text-[#6B6B6B]'>
        {t('loading')}
      </div>
    );
  }

  if (isError && !hasSnapshot) {
    return (
      <div className='bg-white rounded-2xl shadow-sm p-6 text-center'>
        <p className='text-[#6B6B6B] mb-3'>{t('loadError')}</p>
        <button
          onClick={() => refetch()}
          className='px-4 py-2 bg-brand text-white rounded-xl text-sm font-bold'
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='bg-white rounded-2xl shadow-sm p-6 text-center text-[#6B6B6B]'>
        {t('empty')}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3 lg:max-w-md lg:mx-auto'>
      {/* Заголовок стола / статус */}
      <div className='bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between'>
        <div>
          <div className='text-xs text-[#A4A4A4]'>{t('tableLabel')}</div>
          <div className='text-lg font-bold text-[#111111]'>
            {tableLabel || '—'}
          </div>
        </div>
        <div className='flex flex-col items-end'>
          <span className='text-xs text-[#A4A4A4]'>{t('statusLabel')}</span>
          <span className='text-sm font-bold text-brand uppercase'>
            {statusVariant}
          </span>
          <span
            className={`text-[10px] mt-1 ${
              isConnected ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            {isConnected ? t('live.connected') : t('live.disconnected')}
          </span>
        </div>
      </div>

      {/* Список товаров */}
      <ul className='bg-white rounded-2xl shadow-sm divide-y divide-[#E7E7E7]'>
        {order.items.length === 0 && (
          <li className='p-6 text-center text-[#6B6B6B]'>{t('noItems')}</li>
        )}
        {order.items.map((item) => (
          <li key={item.id} className='px-4 py-3'>
            <div className='flex justify-between items-start gap-3'>
              <div className='flex-1'>
                <div className='font-medium text-[#111111]'>
                  {item.productName}
                </div>
                <div className='text-xs text-[#A4A4A4] mt-0.5'>
                  {formatQty(item.qty)} × {formatMoney(item.price)}{' '}
                  {t('currency')}
                </div>
                {item.modifiers.length > 0 && (
                  <ul className='mt-1.5 space-y-0.5'>
                    {item.modifiers.map((m) => (
                      <li
                        key={m.id}
                        className='text-xs text-[#6B6B6B] flex justify-between'
                      >
                        <span>
                          + {m.name}
                          {toNumber(m.count) > 1 ? ` ×${m.count}` : ''}
                        </span>
                        {toNumber(m.sum) > 0 && (
                          <span>
                            {formatMoney(m.sum)} {t('currency')}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {item.comment ? (
                  <div className='text-xs text-[#A4A4A4] mt-1 italic'>
                    {item.comment}
                  </div>
                ) : null}
              </div>
              <div className='font-bold text-[#111111] whitespace-nowrap'>
                {formatMoney(item.sum)} {t('currency')}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Итоги */}
      <div className='bg-white rounded-2xl shadow-sm px-4 py-3 text-sm space-y-1.5'>
        <div className='flex justify-between text-[#6B6B6B]'>
          <span>{t('subtotal')}</span>
          <span>
            {formatMoney(order.subtotal)} {t('currency')}
          </span>
        </div>
        <div className='flex justify-between font-bold text-[#111111]'>
          <span>{t('total')}</span>
          <span>
            {formatMoney(order.total)} {t('currency')}
          </span>
        </div>
        {paidNum > 0 && (
          <div className='flex justify-between text-green-700'>
            <span>{t('paid')}</span>
            <span>
              {formatMoney(order.paidAmount)} {t('currency')}
            </span>
          </div>
        )}
        {paidNum > 0 && remaining > 0 && (
          <div className='flex justify-between font-bold text-[#111111]'>
            <span>{t('remaining')}</span>
            <span>
              {Math.round(remaining)} {t('currency')}
            </span>
          </div>
        )}
      </div>

      {paymentError && (
        <div className='bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3'>
          {paymentError}
        </div>
      )}

      {/* Кнопка оплаты */}
      {canPay && (
        <button
          onClick={onPay}
          disabled={paymentMutation.isPending}
          className='w-full bg-brand text-white font-bold h-12 rounded-xl active:scale-95 transition-transform shadow-lg disabled:opacity-50 disabled:active:scale-100'
        >
          {paymentMutation.isPending
            ? t('payment.creating')
            : t('payment.pay', { amount: Math.round(remaining) })}
        </button>
      )}

      {/* venueSlug пригодится в будущем для редиректа после оплаты,
          сам redirect_url формирует бэкенд. */}
      <input type='hidden' value={venueSlug} readOnly />
    </div>
  );
}
