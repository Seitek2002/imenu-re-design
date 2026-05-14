'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidTime(val: string): boolean {
  const m = val.match(/^(\d{2}):(\d{2})$/);
  if (!m) return false;
  const h = parseInt(m[1]), min = parseInt(m[2]);
  return h < 24 && min < 60;
}

export default function TimePickerContent({ onSave }: { onSave: (val: string) => void }) {
  const t = useTranslations('Cart.timePicker');
  const [mode, setMode] = useState<'asap' | 'time'>('asap');
  const [time, setTime] = useState('');

  const valid = isValidTime(time);

  return (
    <div className='p-4'>
      <h2 className='text-lg font-bold mb-4'>{t('title')}</h2>

      <div className='flex flex-col gap-2'>
        <button
          onClick={() => {
            setMode('asap');
            onSave(t('asap'));
          }}
          className={`w-full px-4 py-3 text-left rounded-xl border-2 transition-colors ${
            mode === 'asap' ? 'border-brand bg-brand/5' : 'border-[#F5F5F5] bg-white'
          }`}
        >
          <span className='font-semibold block'>{t('asapWithEmoji')}</span>
          <span className='text-xs text-gray-500'>{t('asapDesc')}</span>
        </button>

        <div
          onClick={() => setMode('time')}
          className={`rounded-xl border-2 transition-colors p-4 ${
            mode === 'time' ? 'border-brand bg-brand/5' : 'border-[#F5F5F5] bg-white'
          }`}
        >
          <div className='text-sm text-gray-500 mb-2 font-medium'>{t('exact')}</div>
          <input
            type='text'
            inputMode='numeric'
            placeholder='чч:мм'
            value={time}
            onChange={(e) => {
              setMode('time');
              setTime(formatTimeInput(e.target.value));
            }}
            className='w-full bg-transparent text-2xl font-bold text-[#111111] outline-none placeholder-gray-300 tracking-widest'
          />
          {mode === 'time' && (
            <button
              disabled={!valid}
              onClick={() => valid && onSave(time)}
              className='mt-3 w-full bg-brand text-white rounded-xl py-3 font-semibold text-sm disabled:opacity-40'
            >
              {t('confirm')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
