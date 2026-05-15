'use client';

import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';

interface Props {
  open: boolean;
  phone: string;
  isLoading: boolean;
  error?: string | null;
  onConfirm: (code: string) => void;
  onClose: () => void;
}

export default function OtpModal({ open, phone, isLoading, error, onConfirm, onClose }: Props) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  if (!open) return null;

  const handleChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    if (digit && idx < 3) refs[idx + 1].current?.focus();
    if (next.every((d) => d !== '')) {
      onConfirm(next.join(''));
    }
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const next = pasted.split('');
      setDigits(next);
      refs[3].current?.focus();
      onConfirm(pasted);
    }
  };

  const maskedPhone = phone
    ? `+${phone.slice(0, -3).replace(/\d/g, '*')}${phone.slice(-3)}`
    : '';

  return (
    <div className='fixed inset-0 z-200 flex items-end lg:items-center justify-center'>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300' onClick={onClose} />
      <div className='relative w-full lg:max-w-sm bg-white rounded-t-4xl lg:rounded-3xl p-6 pb-10 lg:pb-6 shadow-2xl animate-in slide-in-from-bottom-4 lg:zoom-in-95 duration-300'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-[#111111] font-bold text-lg'>Подтверждение</h2>
          <button
            onClick={onClose}
            className='w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] text-[#6B6B6B]'
          >
            ✕
          </button>
        </div>

        <p className='text-[#6B6B6B] text-sm mb-6'>
          Введите 4-значный код, отправленный на {maskedPhone}
        </p>

        <div className='flex gap-3 justify-center mb-6'>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type='tel'
              inputMode='numeric'
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              autoFocus={i === 0}
              className='w-14 h-14 text-center text-xl font-bold text-[#111111] bg-[#F5F5F5] rounded-2xl outline-none border-2 border-transparent focus:border-[#111111] transition-colors'
            />
          ))}
        </div>

        {error && (
          <p className='text-red-500 text-sm text-center mb-4'>{error}</p>
        )}

        <button
          disabled={isLoading || digits.some((d) => !d)}
          onClick={() => onConfirm(digits.join(''))}
          className='w-full py-4 rounded-2xl bg-[#111111] text-white font-semibold text-base disabled:opacity-40 transition-opacity'
        >
          {isLoading ? 'Проверяем...' : 'Подтвердить'}
        </button>
      </div>
    </div>
  );
}
