'use client';

import { X, Clock, Calendar } from 'lucide-react';
import { useVenueStore } from '@/store/venue';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Хелпер для времени
const formatTime = (time?: string) => {
  if (!time) return '';
  return time.slice(0, 5);
};

export default function ScheduleModal({ isOpen, onClose }: Props) {
  const venue = useVenueStore((state) => state.data);

  const jsDay = new Date().getDay();
  const currentDayIndex = jsDay === 0 ? 7 : jsDay;

  if (!isOpen || !venue) return null;

  const schedules = [...(venue.schedules || [])].sort(
    (a, b) => (a.dayOfWeek || 0) - (b.dayOfWeek || 0)
  );

  return (
    <div className='fixed inset-0 z-100 flex items-center justify-center px-4'>
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200'
        onClick={onClose}
      />

      <div className='relative w-full max-w-sm bg-white rounded-[30px] p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200'>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-brand'>
              <Clock size={20} />
            </div>
            <div>
              <h3 className='font-bold text-lg leading-tight text-gray-900'>
                График работы
              </h3>
              <p className='text-xs text-gray-400'>Время местное</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 active:scale-95 transition-all'
          >
            <X size={18} />
          </button>
        </div>

        {schedules.length === 0 ? (
          <div className='text-center py-8 text-gray-400'>
            <Calendar size={48} className='mx-auto mb-2 opacity-20' />
            <p>Информация о графике отсутствует</p>
          </div>
        ) : (
          <ul className='space-y-2'>
            {schedules.map((day) => {
              const isToday = day.dayOfWeek === currentDayIndex;
              const isDayOff = day.isDayOff;
              const is24h = day.is24h;

              return (
                <li
                  key={day.dayOfWeek}
                  className={`
                    flex justify-between items-center px-4 py-3 rounded-xl transition-all
                    ${
                      isToday
                        ? 'bg-brand/10 border border-brand/20 shadow-sm'
                        : 'bg-transparent hover:bg-gray-50'
                    }
                  `}
                >
                  <span
                    className={`text-sm font-medium ${
                      isToday ? 'text-brand' : 'text-gray-600'
                    }`}
                  >
                    {day.dayName}
                  </span>

                  <span
                    className={`text-sm font-bold ${
                      isToday ? 'text-brand' : 'text-gray-900'
                    }`}
                  >
                    {isDayOff ? (
                      <span className='text-red-400 font-normal'>Выходной</span>
                    ) : is24h ? (
                      <span className='text-green-600'>Круглосуточно</span>
                    ) : (
                      `${formatTime(day.workStart)} - ${formatTime(
                        day.workEnd
                      )}`
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <button
          onClick={onClose}
          className='w-full mt-6 bg-gray-100 text-gray-900 font-bold py-3.5 rounded-xl active:scale-95 transition-transform'
        >
          Понятно
        </button>
      </div>
    </div>
  );
}
