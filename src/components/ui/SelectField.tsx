'use client';

import Image from 'next/image';
import React from 'react';

type SelectFieldProps = {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  value: string;
  placeholder?: string;
  onClick?: () => void;
  ariaHasPopup?: 'dialog' | 'listbox';
  ariaExpanded?: boolean;
  className?: string;
  subLabel?: string;
  valueClassName?: string;
};

/**
 * Reusable select-like row with:
 * - optional left icon
 * - value or placeholder text
 * - optional right icon (e.g., chevron)
 * Whole row is a button for accessibility.
 */
export default function SelectField({
  leftIcon,
  rightIcon,
  value,
  placeholder = '',
  onClick,
  ariaHasPopup,
  ariaExpanded,
  className = '',
  subLabel,
  valueClassName = '',
}: SelectFieldProps) {
  const isPlaceholder = !value || value === placeholder;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {leftIcon ?? null}
      <button
        type="button"
        className="bg-[#F5F5F5] flex items-center justify-between p-4 rounded-lg flex-1 text-left"
        onClick={onClick}
        aria-haspopup={ariaHasPopup}
        aria-expanded={ariaExpanded}
      >
        <div className='flex flex-col'>
          <span className={`${isPlaceholder ? 'text-[#A4A4A4]' : 'text-[#111111]'} ${valueClassName}`}>
            {value || placeholder}
          </span>
          {subLabel ? <span className='text-xs text-[#A4A4A4] mt-0.5'>{subLabel}</span> : null}
        </div>
        {rightIcon ?? null}
      </button>
    </div>
  );
}
