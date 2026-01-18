'use client';

import { useState } from 'react';

const options = ['RU', 'KG', 'ENG'] as const;

export default function LanguageDropdown() {
  const [lang, setLang] = useState('RU');

  // Функция для закрытия поповера программно после выбора языка
  const closePopover = () => {
    const popover = document.getElementById('lang-menu');
    if (popover && popover.matches(':popover-open')) {
      popover.hidePopover();
    }
  };

  const handleSelect = (opt: string) => {
    setLang(opt);
    if (navigator.vibrate) navigator.vibrate(40);
    closePopover(); // Закрываем меню после выбора
  };

  return (
    <div className='relative'>
      {/* Кнопка-триггер */}
      <button
        popoverTarget='lang-menu'
        className='flex items-center gap-1.5 p-2.5 rounded-[14px] bg-[#FAFAFA] cursor-pointer font-bold text-sm'
      >
        <span>{lang}</span>
        <svg
          width='16'
          height='16'
          viewBox='0 0 18 18'
          fill='none'
          className='opacity-50'
        >
          <path
            d='M13.5 6.75L9 12.375L4.125 6.75'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </button>

      {/* Меню с нативным поведением закрытия */}
      <div
        id='lang-menu'
        popover='auto'
        className='absolute m-0 p-1.5 w-32 rounded-2xl border border-gray-100 bg-white shadow-2xl backdrop:bg-transparent'
        style={{
          // Поповер по дефолту центрируется вьюпортом,
          // поэтому позиционируем его относительно кнопки через стили или anchor
          inset: 'auto',
          top: 'calc(anchor(bottom) + 8px)',
          right: 'anchor(right)',
        }}
      >
        <div className='flex flex-col gap-1'>
          {options.map((opt) => (
            <button
              key={opt}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
                lang === opt
                  ? 'bg-orange-50 text-orange-600 font-bold'
                  : 'active:bg-gray-100'
              }`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
