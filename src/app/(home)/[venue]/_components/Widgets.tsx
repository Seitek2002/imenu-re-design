'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useVenueQuery } from '@/store/venue';
import ModalPortal from '@/components/ui/ModalPortal';

import widget1 from '@/assets/Widgets/widget-1.png';
// import widget2 from '@/assets/Widgets/widget-2.png';
import widget3 from '@/assets/Widgets/widget-3.png';
import { useTranslation } from 'react-i18next';
import { useCheckout } from '@/store/checkout';
import { useOrdersV2 } from '@/lib/api/queries';
import type { OrderList } from '@/lib/api/types';
import Link from 'next/link';
import { steps } from '../order-status/[id]/OrderStatus.helpers';

function formatTime(t?: string) {
  if (!t) return '';
  // Expect HH:MM[:SS], cut to HH:MM
  const [hh, mm] = t.split(':');
  return `${hh}:${mm}`;
}

function weekdayIndex1to7(d: Date) {
  // JS: Sunday=0 ... Saturday=6; API: Monday=1 ... Sunday=7
  const js = d.getDay(); // 0..6
  return js === 0 ? 7 : js; // map Sunday 0 -> 7
}

const CircularProgress: React.FC<{ size?: number; strokeWidth?: number; value: number; className?: string }> = ({
  size = 48,
  strokeWidth = 6,
  value,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const offset = circumference * (1 - clamped / 100);

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`Прогресс ${clamped}%`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#0404138C"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};

const Widgets = () => {
  const { venue } = useVenueQuery();
  const { t } = useTranslation();
  const [openSchedule, setOpenSchedule] = useState(false);
  const { phone } = useCheckout();
  const [lastOrder, setLastOrder] = useState<OrderList | undefined>(undefined);
  const { data } = useOrdersV2({ phone, venueSlug: venue?.slug });

  const schedules = useMemo(() => {
    const arr = (venue as any)?.schedules ?? [];
    if (!Array.isArray(arr)) return [];
    // ensure Monday(1)..Sunday(7) order
    return [...arr].sort(
      (a: any, b: any) => (a?.dayOfWeek ?? 0) - (b?.dayOfWeek ?? 0)
    );
  }, [venue]);

  const todayIdx = weekdayIndex1to7(new Date());

  // Прогресс по последнему заказу (0..100)
  const progress = useMemo(() => {
    if (!lastOrder) return 0;
    const modeSteps = steps[lastOrder.serviceMode as 1 | 2 | 3] ?? steps[2];
    const total = modeSteps.length || 1;
    const isCancelled = lastOrder.status === 7;
    const clamped = Math.max(0, Math.min(lastOrder.status, total - 1));
    const activeIndex = isCancelled ? 0 : clamped;
    return Math.round(((activeIndex + 1) / total) * 100);
  }, [lastOrder]);

  useEffect(() => {
    if (data && data.results.length > 0) {
      console.log(data.results[0]);
      console.log(phone);

      const modeSteps =
        steps[data.results[0].serviceMode as 1 | 2 | 3] ?? steps[2];
      const total = modeSteps.length;
      const clamped = Math.max(0, Math.min(data.results[0].status, total - 1));
      const isCancelled = data.results[0].status === 7;
      const activeIndex = isCancelled ? 0 : clamped;
      const progress = total <= 1 ? 0 : ((activeIndex + 1) / total) * 100;

      setLastOrder(data.results[0]);
    }
  }, [data]);

  return (
    <>
      <div className='home-widgets bg-white rounded-4xl p-4 mt-2 flex gap-2 overflow-x-auto overflow-y-hidden'>
        <Link
          href={
            lastOrder
              ? `/${venue?.slug}/order-status/${lastOrder?.id}`
              : `/${venue?.slug}`
          }
          className='home-widget bg-[#FAFAFA] rounded-3xl w-min p-4 text-xs text-center'
        >
          <h3 className='text-[#0404138C] text-nowrap'>
            {lastOrder ? 'Статус заказа' : 'Мои заказы'}
          </h3>
          <div className='relative w-[95px] h-[58px]'>
            <Image
              src={widget1}
              alt='widget 1'
              className={lastOrder ? 'opacity-40' : ''}
            />
            {lastOrder && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='relative'>
                  <CircularProgress value={progress} size={48} strokeWidth={6} />
                  <span className='absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-[#040413]'>
                    {progress}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* <div className='home-widget bg-[#FAFAFA] rounded-3xl w-min p-4 text-xs text-center'>
          <h3 className='text-[#0404138C] text-nowrap'>Бонусные баллы</h3>
          <div className='flex items-center mt-2.5'>
            <Image src={widget2} alt='widget 2' width={24} />
            <span className='text-2xl font-extrabold'>2 450</span>
          </div>
        </div> */}

        <button
          type='button'
          className='home-widget bg-[#FAFAFA] rounded-3xl w-min p-4 text-xs text-center hover:shadow-sm transition'
          onClick={() => setOpenSchedule(true)}
        >
          <h3 className='text-[#0404138C] text-nowrap'>{t('schedule')}</h3>
          <div className='h-[50px]'>
            <Image src={widget3} alt='widget 3' />
          </div>
        </button>
      </div>

      <ModalPortal
        open={openSchedule}
        onClose={() => setOpenSchedule(false)}
        zIndex={100}
      >
        <button
          type='button'
          aria-label='Закрыть'
          onClick={() => setOpenSchedule(false)}
          className='absolute top-2 right-2 h-8 w-8 rounded-full bg-[#F5F5F5] text-[#111111] flex items-center justify-center'
        >
          ✕
        </button>

        <h2 className='text-base font-semibold mb-3'>{t('schedule')}</h2>

        {schedules.length === 0 ? (
          <div className='text-[#6B7280]'>{t('infoNotProvided')}</div>
        ) : (
          <ul className='divide-y divide-[#E5E7EB]'>
            {schedules.map((s: any) => {
              const isToday = s?.dayOfWeek === todayIdx;
              const is24h = !!s?.is24h;
              const isDayOff = !!s?.isDayOff;

              let timeText = '';
              if (isDayOff) timeText = t('dayOff');
              else if (is24h) timeText = t('roundTheClock');
              else
                timeText = `${formatTime(s?.workStart)} – ${formatTime(
                  s?.workEnd
                )}`;

              return (
                <li
                  key={s?.dayOfWeek ?? Math.random()}
                  className={`flex items-center justify-between py-2 px-2 rounded-lg ${
                    isToday ? 'bg-[#FFF5EE] border border-[#FF7A00]' : ''
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isToday
                        ? 'text-[#111111] font-semibold'
                        : 'text-[#111111]'
                    }`}
                  >
                    {s?.dayName ?? 'День'}
                  </span>
                  <span
                    className={`text-sm ${
                      isDayOff
                        ? 'text-[#9CA3AF]'
                        : isToday
                        ? 'text-[#FF7A00] font-medium'
                        : 'text-[#374151]'
                    }`}
                  >
                    {timeText}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </ModalPortal>
    </>
  );
};

export default Widgets;
