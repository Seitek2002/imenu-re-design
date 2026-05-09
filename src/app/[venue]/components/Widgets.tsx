'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { useCheckout } from '@/store/checkout';
import { useOrdersV2, useClientBonus } from '@/lib/api/queries';
import { OrderStatus } from '@/types/api';
import { OrderV2 } from '@/lib/order';

import ScheduleModal from '@/components/modals/ScheduleModal';
import CircularProgress from '@/components/ui/CircularProgress';
import OrdersSheet from './OrdersSheet';

import widget2 from '@/assets/Widgets/widget-2.png';
import widget3 from '@/assets/Widgets/widget-3.png';
import widget1 from '@/assets/Widgets/widget-1.png';
import { calculateOrderProgress, statusToStepIndex } from '@/lib/helpers/progressHelper';
import { ServiceMode } from '@/types/api';
import { Check, Clock, Truck, Wallet, ChefHat } from 'lucide-react';

interface IWidgetsProps {
  venueSlug: string;
}

const Widgets = ({ venueSlug }: IWidgetsProps) => {
  const [isScheduleOpen, setScheduleOpen] = useState(false);
  const [isOrdersOpen, setOrdersOpen] = useState(false);
  const t = useTranslations('Widgets');
  const locale = useLocale();

  const { phone } = useCheckout();

  const { data: bonusData } = useClientBonus({ phone, venueSlug });
  const { data: ordersData } = useOrdersV2({
    phone,
    venueSlug,
    limit: 20,
    includeUnpaid: true,
  });

  const activeOrders = ordersData?.results?.filter(
    (o) =>
      o.status !== OrderStatus.Completed &&
      o.status !== OrderStatus.Cancelled,
  ) ?? [];

  // Самый срочный = с максимальным прогрессом (ближе всего к готовности).
  // Так пользователь видит то, что вот-вот изменится; остальные доступны в /history.
  const featuredOrder = activeOrders.length
    ? activeOrders.reduce((best, o) =>
        calculateOrderProgress(o.status, o.serviceMode) >
        calculateOrderProgress(best.status, best.serviceMode)
          ? o
          : best,
      )
    : null;

  const extraCount = Math.max(0, activeOrders.length - 1);
  const hasActiveOrders = featuredOrder !== null;

  return (
    <>
      <div className='home-widgets bg-white rounded-4xl p-4 mt-2 flex gap-2 overflow-x-auto snap-x no-scrollbar'>
        {hasActiveOrders ? (
          <ActiveOrderWidget
            featuredOrder={featuredOrder}
            extraCount={extraCount}
            venueSlug={venueSlug}
            onMultiClick={() => setOrdersOpen(true)}
          />
        ) : (
          <Link
            href={`/${venueSlug}/history`}
            className='home-widget bg-[#FAFAFA] rounded-3xl min-w-30 p-4 text-xs text-center snap-start active:scale-95 transition-transform relative overflow-hidden group'
          >
            <div className='text-[#0404138C] font-bold text-xs mb-2 relative z-10 leading-tight'>
              {t('myOrders')}
            </div>
            <div className='relative w-full h-14 flex items-center justify-center'>
              <Image
                src={widget1}
                alt='Orders'
                fill
                className='object-contain transition-all duration-500 opacity-100 scale-100'
                sizes='120px'
              />
            </div>
          </Link>
        )}

        <div className='home-widget bg-[#FAFAFA] rounded-3xl min-w-35 p-4 text-xs text-center snap-start'>
          <div className='text-[#0404138C] font-bold text-xs mb-2 leading-tight'>
            {t('bonus')}
          </div>
          <div className='flex items-center justify-center gap-2 mt-3'>
            <Image src={widget2} alt='Points' width={24} height={24} />
            <span className='text-xl font-black leading-none text-[#111111]'>
              {(bonusData?.bonus ?? 0).toLocaleString(locale)}
            </span>
          </div>
        </div>

        <button
          type='button'
          onClick={() => setScheduleOpen(true)}
          className='home-widget bg-[#FAFAFA] rounded-3xl min-w-30 p-4 text-xs text-center snap-start active:scale-95 transition-transform cursor-pointer'
        >
          <div className='text-[#0404138C] font-bold text-xs mb-2 leading-tight'>
            {t('schedule')}
          </div>
          <div className='relative w-full h-12'>
            <Image
              src={widget3}
              alt='Schedule'
              fill
              className='object-contain'
              sizes='120px'
            />
          </div>
        </button>
      </div>

      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setScheduleOpen(false)}
      />

      <OrdersSheet
        open={isOrdersOpen}
        onClose={() => setOrdersOpen(false)}
        orders={activeOrders}
        venueSlug={venueSlug}
      />
    </>
  );
};

interface ActiveOrderWidgetProps {
  featuredOrder: OrderV2;
  extraCount: number;
  venueSlug: string;
  onMultiClick: () => void;
}

type Tone = 'brand' | 'green' | 'amber' | 'red';

const TONE_BG: Record<Tone, string> = {
  brand: 'bg-[#FAFAFA]',
  green: 'bg-green-50',
  amber: 'bg-amber-50',
  red: 'bg-red-50',
};

const TONE_TEXT: Record<Tone, string> = {
  brand: 'text-brand',
  green: 'text-green-600',
  amber: 'text-amber-700',
  red: 'text-red-600',
};

const TONE_RING_COLOR: Record<Tone, string> = {
  brand: 'var(--brand)',
  green: '#16a34a',
  amber: '#d97706',
  red: '#dc2626',
};

function modeKey(mode: number): 'takeout' | 'delivery' | 'dinein' {
  if (mode === ServiceMode.Delivery) return 'delivery';
  if (mode === ServiceMode.DineIn) return 'dinein';
  return 'takeout';
}

function pickTone(status: number): Tone {
  if (status === OrderStatus.PendingPayment) return 'amber';
  if (status === OrderStatus.Cancelled) return 'red';
  if (status === OrderStatus.Ready) return 'green';
  return 'brand';
}

function StatusIcon({ status, serviceMode, tone }: { status: number; serviceMode: number; tone: Tone }) {
  const cls = `${TONE_TEXT[tone]}`;
  if (status === OrderStatus.PendingPayment) return <Wallet size={20} className={cls} strokeWidth={2.5} />;
  if (status === OrderStatus.Ready) return <Check size={22} className={cls} strokeWidth={3} />;
  if (status === OrderStatus.InDelivery) return <Truck size={20} className={cls} strokeWidth={2.5} />;
  if (status === OrderStatus.Preparing) return <ChefHat size={20} className={cls} strokeWidth={2.5} />;
  if (serviceMode === ServiceMode.Delivery) return <Truck size={20} className={cls} strokeWidth={2.5} />;
  return <Clock size={20} className={cls} strokeWidth={2.5} />;
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function PaymentTimer({ expiresAt }: { expiresAt: string }) {
  const target = new Date(expiresAt).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (Number.isNaN(target)) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (Number.isNaN(target)) return null;
  const remaining = target - now;
  const expired = remaining <= 0;
  return (
    <span className={`text-[10px] font-bold leading-none ${expired ? 'text-red-600' : 'text-amber-700'}`}>
      {expired ? '0:00' : formatRemaining(remaining)}
    </span>
  );
}

function ActiveOrderWidget({
  featuredOrder,
  extraCount,
  venueSlug,
  onMultiClick,
}: ActiveOrderWidgetProps) {
  const ts = useTranslations('OrderStatus');
  const isMulti = extraCount > 0;
  const { status, serviceMode, paymentExpiresAt } = featuredOrder;
  const tone = pickTone(status);
  const progress = calculateOrderProgress(status, serviceMode);
  const showProgress = tone === 'brand' || tone === 'green';

  const statusText: string = (() => {
    if (status === OrderStatus.PendingPayment) return ts('pendingPayment');
    if (status === OrderStatus.Cancelled) return ts('cancelled');
    const stepIdx = statusToStepIndex(status, serviceMode);
    return ts(`steps.${modeKey(serviceMode)}.${stepIdx}_title`);
  })();

  const className = `home-widget rounded-3xl min-w-32 p-4 text-xs text-center snap-start active:scale-95 transition-transform relative overflow-hidden ${TONE_BG[tone]}`;

  const inner = (
    <>
      {extraCount > 0 && (
        <span className='absolute top-1.5 right-1.5 z-30 bg-brand text-white text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-full shadow-sm'>
          +{extraCount}
        </span>
      )}
      <div className={`font-bold text-[10px] mb-2 leading-tight uppercase tracking-wide ${TONE_TEXT[tone]} opacity-70`}>
        #{featuredOrder.id}
      </div>
      <div className='relative w-full h-12 flex items-center justify-center mb-1.5 animate-in zoom-in duration-500'>
        {showProgress ? (
          <CircularProgress
            value={tone === 'green' ? 100 : progress}
            size={44}
            strokeWidth={3}
            color={TONE_RING_COLOR[tone]}
          >
            <StatusIcon status={status} serviceMode={serviceMode} tone={tone} />
          </CircularProgress>
        ) : (
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center ${
              tone === 'amber' ? 'bg-amber-100' : 'bg-red-100'
            }`}
          >
            <StatusIcon status={status} serviceMode={serviceMode} tone={tone} />
          </div>
        )}
      </div>
      <div className={`font-bold text-[11px] leading-tight ${TONE_TEXT[tone]}`}>
        {statusText}
      </div>
      {status === OrderStatus.PendingPayment && paymentExpiresAt && (
        <div className='mt-1 flex items-center justify-center gap-1'>
          <Clock size={10} className='text-amber-700' strokeWidth={2.5} />
          <PaymentTimer expiresAt={paymentExpiresAt} />
        </div>
      )}
    </>
  );

  if (isMulti) {
    return (
      <button type='button' onClick={onMultiClick} className={className}>
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={`/${venueSlug}/order-status/${featuredOrder.id}`}
      className={className}
    >
      {inner}
    </Link>
  );
}

export default Widgets;
