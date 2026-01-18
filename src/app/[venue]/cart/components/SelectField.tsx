'use client';

import React from 'react';

type SelectFieldProps = {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  value?: string | null;
  placeholder?: string;
  subLabel?: string;
  onClick?: () => void;
  // Остальные пропсы можно упростить, они редко нужны, но оставим для совместимости
  label?: string; // Добавил лейбл сверху, иногда полезно
};

export default function SelectField({
  leftIcon,
  rightIcon,
  value,
  placeholder,
  subLabel,
  onClick,
  label,
}: SelectFieldProps) {
  const hasValue = !!value;

  return (
    <div className='w-full'>
      {label && <div className='text-xs text-[#A4A4A4] mb-1 ml-1'>{label}</div>}

      <button
        type='button'
        onClick={(e) => {
          // Эффект нажатия
          const target = e.currentTarget;
          target.style.transform = 'scale(0.98)';
          setTimeout(() => (target.style.transform = 'scale(1)'), 100);

          if (navigator.vibrate) navigator.vibrate(20);
          onClick?.();
        }}
        className='w-full bg-[#F5F5F5] rounded-xl p-3 flex items-center gap-3 transition-transform duration-100'
      >
        {/* Иконка слева (если есть) */}
        {leftIcon && <div className='text-[#111111] shrink-0'>{leftIcon}</div>}

        {/* Текст */}
        <div className='flex flex-col items-start flex-1 min-w-0'>
          <span
            className={`text-sm font-medium truncate w-full text-left ${
              hasValue ? 'text-[#111111]' : 'text-[#A4A4A4]'
            }`}
          >
            {value || placeholder}
          </span>
          {subLabel && (
            <span className='text-xs text-[#939393] truncate w-full text-left mt-0.5'>
              {subLabel}
            </span>
          )}
        </div>

        {/* Иконка справа (стрелка) */}
        {rightIcon && <div className='shrink-0 opacity-50'>{rightIcon}</div>}
      </button>
    </div>
  );
}
