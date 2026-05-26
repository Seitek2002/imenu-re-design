'use client';

import { Flame, Snowflake } from 'lucide-react';

interface Props {
  variantType: 'ice' | 'hot' | null | undefined;
  label: string;
  /** true — показывает противоположный тип (чип возврата в ice sheet) */
  inverted?: boolean;
  onClick: () => void;
}

export function VariantChip({ variantType, label, inverted = false, onClick }: Props) {
  const effectiveType = inverted
    ? variantType === 'ice' ? 'hot' : variantType === 'hot' ? 'ice' : null
    : variantType;

  const Icon = effectiveType === 'ice' ? Snowflake : effectiveType === 'hot' ? Flame : null;
  const displayLabel = effectiveType === 'ice' ? 'Айс' : effectiveType === 'hot' ? 'Горячий' : label;

  return (
    <button
      type='button'
      onClick={onClick}
      className='relative shrink-0 w-21 h-27 rounded-[20px] flex flex-col items-center justify-between pt-2.5 pb-2.5 overflow-hidden active:scale-95 transition-all duration-150 bg-white/25 backdrop-blur-md ring-1 ring-white/30'
      aria-label={displayLabel}
    >
      <div className='flex-1 flex items-center justify-center w-full'>
        {Icon
          ? <Icon size={36} strokeWidth={1.5} className='text-white' />
          : <div className='w-10 h-10 rounded-full bg-white/20' />
        }
      </div>
      <span className='text-[11px] font-semibold text-white text-center leading-tight line-clamp-2 w-full px-1.5 shrink-0'>
        {displayLabel}
      </span>
    </button>
  );
}
