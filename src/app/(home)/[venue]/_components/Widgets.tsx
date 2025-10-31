'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useVenueQuery } from '@/store/venue';
import ModalPortal from '@/components/ui/ModalPortal';

import widget1 from '@/assets/Widgets/widget-1.png';
import widget2 from '@/assets/Widgets/widget-2.png';
import widget3 from '@/assets/Widgets/widget-3.png';
import { useTranslation } from 'react-i18next';

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

const Widgets = () => {
  const { venue } = useVenueQuery();
  const { t } = useTranslation();
  const [openSchedule, setOpenSchedule] = useState(false);

  const schedules = useMemo(() => {
    const arr = (venue as any)?.schedules ?? [];
    if (!Array.isArray(arr)) return [];
    // ensure Monday(1)..Sunday(7) order
    return [...arr].sort((a: any, b: any) => (a?.dayOfWeek ?? 0) - (b?.dayOfWeek ?? 0));
  }, [venue]);

  const todayIdx = weekdayIndex1to7(new Date());

  return (
    <>
      <div className='home-widgets bg-white rounded-4xl p-4 mt-2 flex gap-2 overflow-x-auto'>
        <div className='home-widget bg-[#FAFAFA] rounded-3xl w-min p-4 text-xs text-center'>
          <h3 className='text-[#0404138C]'>Мои заказы</h3>
          <div className='w-[95px] h-[58px]'>
            <Image src={widget1} alt='widget 1' />
          </div>
        </div>

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

      <ModalPortal open={openSchedule} onClose={() => setOpenSchedule(false)} zIndex={100}>
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
              else timeText = `${formatTime(s?.workStart)} – ${formatTime(s?.workEnd)}`;

              return (
                <li
                  key={s?.dayOfWeek ?? Math.random()}
                  className={`flex items-center justify-between py-2 px-2 rounded-lg ${
                    isToday ? 'bg-[#FFF5EE] border border-[#FF7A00]' : ''
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isToday ? 'text-[#111111] font-semibold' : 'text-[#111111]'
                    }`}
                  >
                    {s?.dayName ?? 'День'}
                  </span>
                  <span
                    className={`text-sm ${
                      isDayOff ? 'text-[#9CA3AF]' : isToday ? 'text-[#FF7A00] font-medium' : 'text-[#374151]'
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
