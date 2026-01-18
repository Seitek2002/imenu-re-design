'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { useCheckout } from '@/store/checkout';
import { useOrdersV2, useClientBonus } from '@/lib/api/queries';

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

  const { phone } = useCheckout();

  const { data: bonusData } = useClientBonus({ phone, venueSlug });
  const { data: ordersData } = useOrdersV2({ phone, venueSlug });

  const lastOrder = ordersData?.results?.[0];

  const hasActiveOrder = !!lastOrder;

  const progress = hasActiveOrder
    ? calculateOrderProgress(lastOrder.status, lastOrder.serviceMode)
    : 0;

  const orderWidgetLink = lastOrder
    ? `/${venueSlug}/order-status/${lastOrder.id}`
    : `/${venueSlug}/history`;

  return (
    <>
      <div className='home-widgets bg-white rounded-4xl p-4 mt-2 flex gap-2 overflow-x-auto snap-x scrollbar-hide'>
        <Link
          href={orderWidgetLink}
          className='home-widget bg-[#FAFAFA] rounded-3xl min-w-30 p-4 text-xs text-center snap-start active:scale-95 transition-transform relative overflow-hidden group'
        >
          <div className='text-[#0404138C] font-bold text-xs whitespace-nowrap mb-2 relative z-10'>
            {hasActiveOrder ? 'Статус заказа' : 'Мои заказы'}
          </div>

          <div className='relative w-full h-14 flex items-center justify-center'>
            <Image
              src={widget1}
              alt='Orders'
              fill
              className={`
                object-contain transition-all duration-500 
                ${
                  hasActiveOrder
                    ? 'opacity-10 scale-90 blur-[1px]'
                    : 'opacity-100 scale-100'
                }
              `}
              sizes='120px'
            />

            {hasActiveOrder && (
              <div className='absolute z-20 animate-in zoom-in duration-500'>
                <CircularProgress value={progress} size={50} strokeWidth={5} />
              </div>
            )}
          </div>
        </Link>

        <div className='home-widget bg-[#FAFAFA] rounded-3xl min-w-35 p-4 text-xs text-center snap-start'>
          <div className='text-[#0404138C] font-bold text-xs whitespace-nowrap mb-2'>
            Бонусные баллы
          </div>
          <div className='flex items-center justify-center gap-2 mt-3'>
            <Image src={widget2} alt='Points' width={24} height={24} />
            <span className='text-xl font-black font-cruinn leading-none text-[#111111]'>
              {(bonusData?.bonus ?? 0).toLocaleString('ru-RU')}
            </span>
          </div>
        </div>

        <button
          type='button'
          onClick={() => setScheduleOpen(true)}
          className='home-widget bg-[#FAFAFA] rounded-3xl min-w-30 p-4 text-xs text-center snap-start active:scale-95 transition-transform cursor-pointer'
        >
          <div className='text-[#0404138C] font-bold text-xs whitespace-nowrap mb-2'>
            График
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
