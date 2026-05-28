'use client';

import { Flame, Snowflake, Leaf } from 'lucide-react';

interface VariantChipProps {
  variantType: 'ice' | 'hot' | 'lactose_free' | null | undefined;
  label: string;
  active?: boolean;
  onClick: () => void;
}

export function VariantChip({ variantType, label, active = false, onClick }: VariantChipProps) {
  const Icon =
    variantType === 'ice' ? Snowflake
    : variantType === 'hot' ? Flame
    : variantType === 'lactose_free' ? Leaf
    : null;

  return (
    <button
      type='button'
      onClick={onClick}
      style={{
        backdropFilter: 'blur(12.2px)',
        boxShadow: 'inset 1px 1px 1.3px #FFFFFF, inset -1px -1px 1.3px rgba(255,255,255,0.62)',
      }}
      className={`
        relative shrink-0 w-21 h-[90px] rounded-[20px] flex flex-col items-center justify-between
        pt-2.5 pb-2.5 overflow-hidden active:scale-95 transition-all duration-150
        ${active
          ? 'bg-white/75 ring-2 ring-white shadow-md'
          : 'bg-white/25 backdrop-blur-md ring-1 ring-white/30'
        }
      `}
      aria-label={label}
      aria-pressed={active}
    >
      <span className='text-[11px] font-semibold text-white text-center leading-tight line-clamp-2 w-full px-1.5 shrink-0'>
        {label}
      </span>
      <div className='flex-1 flex items-center justify-center w-full'>
        {Icon
          ? <Icon size={26} strokeWidth={1.5} className='text-white' />
          : <div className='w-7 h-7 rounded-full bg-white/20' />
        }
      </div>
    </button>
  );
}

interface DecafChipProps {
  label: string;
  onClick: () => void;
}

export function DecafChip({ label, onClick }: DecafChipProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='relative shrink-0 w-21 h-[90px] rounded-[20px] flex flex-col items-center justify-between pt-2.5 pb-2.5 overflow-hidden active:scale-95 transition-all duration-150'
      style={{
        backgroundColor: 'rgba(161, 122, 80, 0.67)',
        backdropFilter: 'blur(12.2px)',
        boxShadow: 'inset 1px 1px 1.3px #FFFFFF, inset -1px -1px 1.3px rgba(255,255,255,0.62)',
      }}
      aria-label={label}
    >
      <span className='text-[11px] font-semibold text-white text-center leading-tight line-clamp-2 w-full px-1.5 shrink-0'>
        {label}
      </span>
      <div className='flex-1 flex items-center justify-center w-full'>
        <img src='/test/chips/decaf-icon.svg' width={26} height={26} alt='' aria-hidden='true' />
      </div>
    </button>
  );
}
