'use client';

import type { ComponentType } from 'react';

export interface PreferenceOption {
  id: string;
  label: string;
}

export interface PreferenceChipDef {
  id: string;
  label: string;
  Icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  options: PreferenceOption[];
}

// ---------------------------------------------------------------------------
// Чип предпочтения — встраивается в строку чипов (всегда первым)
// ---------------------------------------------------------------------------
export function PreferenceChipButton({
  chip,
  active,
  selectedOptionLabel,
  onClick,
}: {
  chip: PreferenceChipDef;
  active: boolean;
  selectedOptionLabel?: string;
  onClick: () => void;
}) {
  const { Icon, label } = chip;
  const isSelected = !!selectedOptionLabel;

  return (
    <button
      type='button'
      onClick={onClick}
      className='relative shrink-0 w-23 active:scale-95 transition-all duration-150 outline-none'
      aria-pressed={active}
      aria-label={selectedOptionLabel ?? label}
    >
      <div
        className={`
          w-full h-[90px] rounded-2xl flex flex-col items-center justify-between
          pt-[10px] pb-[10px] px-4 overflow-hidden transition-all duration-150
          ${
            isSelected
              ? active
                ? 'bg-white/75 ring-2 ring-white shadow-md'
                : 'bg-white/60'
              : active
                ? 'bg-white/50 ring-2 ring-white shadow-md'
                : 'bg-white/30 backdrop-blur-[10px] ring-1 ring-white/30'
          }
        `}
      >
        <div className='flex-1 flex items-center justify-center w-full'>
          <Icon size={28} strokeWidth={1.5} className='text-white' />
        </div>
        <span className='text-[11px] font-semibold text-white text-center leading-tight line-clamp-2 w-full shrink-0'>
          {selectedOptionLabel ?? label}
        </span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Панель выбора — появляется над строкой чипов
// ---------------------------------------------------------------------------
export function PreferenceGrid({
  chip,
  selectedId,
  onSelect,
}: {
  chip: PreferenceChipDef;
  selectedId: string | null;
  onSelect: (optionId: string | null) => void;
}) {
  return (
    <div className='w-full'>
      <div className='flex flex-wrap gap-2'>
        {chip.options.map((opt) => {
          const selected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type='button'
              onClick={() => onSelect(selected ? null : opt.id)}
              className={`
                px-4 py-2.5 rounded-full text-sm font-semibold
                transition-all duration-150 active:scale-95
                ${
                  selected
                    ? 'bg-white text-[#21201F]'
                    : 'bg-white/20 text-white backdrop-blur-sm ring-1 ring-white/30'
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
