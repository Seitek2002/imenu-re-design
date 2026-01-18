'use client';

import { useState } from 'react';

const SLOTS = ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15'];

export default function TimePickerContent({
  onSave,
}: {
  onSave: (val: string) => void;
}) {
  const [mode, setMode] = useState<'asap' | 'time'>('asap');
  const [customTime, setCustomTime] = useState('');

  return (
    <div>
      <h2 className='text-lg font-bold mb-4'>Время готовности</h2>

      <div className='flex flex-col gap-2'>
        <button
          onClick={() => {
            setMode('asap');
            onSave('Быстрее всего');
          }}
          className={`w-full px-4 py-3 text-left rounded-xl border-2 transition-colors ${
            mode === 'asap'
              ? 'border-brand bg-brand/5'
              : 'border-[#F5F5F5] bg-white'
          }`}
        >
          <span className='font-semibold block'>🚀 Быстрее всего</span>
          <span className='text-xs text-gray-500'>
            Приготовим как можно скорее
          </span>
        </button>

        <div className='rounded-xl border border-[#F5F5F5] p-3 mt-2'>
          <div className='text-sm text-gray-500 mb-2 font-medium'>
            Выбрать точное время
          </div>
          <div className='grid grid-cols-3 gap-2'>
            {SLOTS.map((time) => (
              <button
                key={time}
                onClick={() => {
                  setMode('time');
                  onSave(time);
                }}
                className='bg-[#F5F5F5] py-2 rounded-lg text-sm font-medium hover:bg-[#E5E5E5]'
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
