'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { useCheckout } from '@/store/checkout';
import { useOrdersV2, useClientBonus } from '@/lib/api/queries';
import { OrderStatus } from '@/types/api';

import ScheduleModal from '@/components/modals/ScheduleModal';
import CircularProgress from '@/components/ui/CircularProgress';

import widget1 from '@/assets/Widgets/widget-1.png';
import widget2 from '@/assets/Widgets/widget-2.png';
import widget3 from '@/assets/Widgets/widget-3.png';
import { calculateOrderProgress } from '@/lib/helpers/progressHelper';

interface IWidgetsProps {
  venueSlug: string;
}

const Widgets = ({ venueSlug }: IWidgetsProps) => {
  const [isScheduleOpen, setScheduleOpen] = useState(false);
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
          (() => {
            const progress = calculateOrderProgress(
              featuredOrder.status,
              featuredOrder.serviceMode,
            );
            // Если активных > 1, виджет ведёт на список (история), иначе — на конкретный заказ.
            const href =
              extraCount > 0
                ? `/${venueSlug}/history`
                : `/${venueSlug}/order-status/${featuredOrder.id}`;
            return (
              <Link
                href={href}
                className='home-widget bg-[#FAFAFA] rounded-3xl min-w-30 p-4 text-xs text-center snap-start active:scale-95 transition-transform relative overflow-hidden group'
              >
                {extraCount > 0 && (
                  <span className='absolute top-1.5 right-1.5 z-30 bg-brand text-white text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-full shadow-sm'>
                    +{extraCount}
                  </span>
                )}
                <div className='text-[#0404138C] font-bold text-xs mb-2 relative z-10 leading-tight'>
                  {t('orderStatus')}
                </div>
                <div className='relative w-full h-14 flex items-center justify-center'>
                  <Image
                    src={widget1}
                    alt='Orders'
                    fill
                    className='object-contain transition-all duration-500 opacity-10 scale-90 blur-[1px]'
                    sizes='120px'
                  />
                  <div className='absolute inset-0 z-20 flex items-center justify-center animate-in zoom-in duration-500'>
                    <div className='relative flex items-center justify-center'>
                      <CircularProgress value={progress} size={50} strokeWidth={4} />
                      <span className='absolute text-[12px] font-bold text-brand'>
                        {progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })()
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
    </>
  );
};

export default Widgets;
