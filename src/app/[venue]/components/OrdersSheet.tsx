'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useMounted } from '@/hooks/useMounted';
import { OrderV2 } from '@/lib/order';
import { OrderStatus, ServiceMode } from '@/types/api';
import {
  calculateOrderProgress,
  statusToStepIndex,
} from '@/lib/helpers/progressHelper';

interface Props {
  open: boolean;
  onClose: () => void;
  orders: OrderV2[];
  venueSlug: string;
}

type Tone = 'brand' | 'green' | 'amber' | 'red';

function modeKey(mode: number): 'takeout' | 'delivery' | 'dinein' {
  if (mode === ServiceMode.Delivery) return 'delivery';
  if (mode === ServiceMode.DineIn) return 'dinein';
  return 'takeout';
}

function statusTone(status: number): Tone {
  if (status === OrderStatus.PendingPayment) return 'amber';
  if (status === OrderStatus.Cancelled) return 'red';
  if (status === OrderStatus.Ready) return 'green';
  return 'brand';
}

const TONE_CLASS: Record<Tone, string> = {
  brand: 'bg-brand/10 text-brand',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-700',
};

const PROGRESS_TONE_CLASS: Record<Tone, string> = {
  brand: 'bg-brand',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

export default function OrdersSheet({
  open,
  onClose,
  orders,
  venueSlug,
}: Props) {
  const mounted = useMounted();
  const t = useTranslations('Widgets');
  const ts = useTranslations('OrderStatus');
  const tc = useTranslations('Common');

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!mounted || !open) return null;

  const statusLabel = (order: OrderV2): string => {
    if (order.status === OrderStatus.PendingPayment)
      return ts('pendingPayment');
    if (order.status === OrderStatus.Cancelled) return ts('cancelled');
    const stepIdx = statusToStepIndex(order.status, order.serviceMode);
    return ts(`steps.${modeKey(order.serviceMode)}.${stepIdx}_title`);
  };

  return createPortal(
    <div className='fixed inset-0 z-100 flex items-end sm:items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200'
        onClick={onClose}
      />
      <div className='relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 pb-8 shadow-2xl z-10 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='font-bold text-lg text-gray-900'>
            {t('activeOrdersTitle', { count: orders.length })}
          </h3>
          <button
            onClick={onClose}
            aria-label='close'
            className='w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 active:scale-95 transition-transform'
          >
            <X size={18} />
          </button>
        </div>

        <ul className='space-y-2 max-h-[60vh] overflow-y-auto'>
          {orders.map((order) => {
            const tone = statusTone(order.status);
            const progress = calculateOrderProgress(
              order.status,
              order.serviceMode,
            );
            return (
              <li key={order.id}>
                <Link
                  href={`/${venueSlug}/order-status/${order.id}`}
                  onClick={onClose}
                  className='flex items-center gap-3 p-3 rounded-2xl bg-[#FAFAFA] active:scale-[0.98] transition-transform'
                >
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between gap-2 mb-1'>
                      <span className='text-sm font-bold text-gray-900'>
                        #{order.id}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TONE_CLASS[tone]}`}
                      >
                        {statusLabel(order)}
                      </span>
                    </div>
                    <div className='h-1 bg-gray-200 rounded-full overflow-hidden'>
                      <div
                        className={`h-full transition-all duration-500 ${PROGRESS_TONE_CLASS[tone]}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className='mt-1 flex justify-between items-center text-[11px] text-gray-500'>
                      <span>
                        {order.totalPrice} {tc('currency')}
                      </span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className='text-gray-300 shrink-0'
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
