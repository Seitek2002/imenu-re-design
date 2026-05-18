'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { GroupItem } from '@/types/api';

interface Props {
  item: GroupItem;
  count: number;
  canIncrement: boolean;
  /** Тёмный стиль выделения (используется для группы настройки стакана) */
  darkSelected?: boolean;
  onInc: () => void;
  onDec: () => void;
}

const haptic = (ms = 30) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
};

export default function GroupGridItem({
  item,
  count,
  canIncrement,
  darkSelected = false,
  onInc,
  onDec,
}: Props) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const selected = count > 0;
  const photo = item.photo || '/splash-placeholder.svg';
  const priceNum = Number(item.price);
  const bruttoNum = Number(item.brutto);

  // Подпись: "200 г • +50 с" / "2 г • беспл." / "+30 с" / "беспл."
  const weightStr = bruttoNum > 0 ? `${Math.round(bruttoNum)} г` : '';
  const priceStr =
    priceNum > 0
      ? `+${Math.round(priceNum)} с`
      : bruttoNum > 0
        ? 'беспл.'
        : '';
  const sep = weightStr && priceStr ? ' · ' : '';

  const darkBg = selected && darkSelected;

  return (
    <div
      className={`
        relative rounded-2xl p-2 pt-3 flex flex-col items-center
        transition-all duration-150
        ${darkBg
          ? 'bg-[#7D6150] ring-0'
          : selected
            ? 'bg-linear-to-b from-white/70 to-white/40 backdrop-blur-md ring-2 ring-white shadow-lg'
            : 'bg-linear-to-b from-white/55 to-white/30 backdrop-blur-md ring-1 ring-white/20'
        }
      `}
    >
      {/* Фото с skeleton */}
      <div className='relative w-14 h-14 shrink-0'>
        {!imgLoaded && (
          <div className='absolute inset-0 rounded-lg bg-white/30 animate-pulse' />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt={item.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Название */}
      <div
        className={`text-[13px] font-bold mt-1 text-center leading-tight line-clamp-2 ${
          darkBg ? 'text-white' : 'text-[#21201F]'
        }`}
      >
        {item.name}
      </div>

      {/* Вес · цена */}
      {(weightStr || priceStr) && (
        <div
          className={`text-[11px] mt-0.5 text-center whitespace-nowrap ${
            darkBg ? 'text-white/70' : 'text-[#21201F]/60'
          }`}
        >
          {weightStr}
          {sep}
          {priceStr && (
            <span>
              {priceStr.startsWith('+') ? (
                <>
                  +{Math.round(priceNum)} <u>с</u>
                </>
              ) : (
                priceStr
              )}
            </span>
          )}
        </div>
      )}

      {/* Кнопки +/− */}
      <div className='mt-1.5 flex items-center justify-center gap-2 min-h-7'>
        {selected ? (
          <>
            <button
              type='button'
              onClick={() => { haptic(); onDec(); }}
              className='w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform'
              aria-label='Уменьшить'
            >
              <Minus size={14} strokeWidth={2.5} className='text-[#21201F]' />
            </button>
            <span className={`font-bold text-sm w-4 text-center select-none ${darkBg ? 'text-white' : 'text-[#21201F]'}`}>
              {count}
            </span>
            <button
              type='button'
              onClick={() => { haptic(); onInc(); }}
              disabled={!canIncrement}
              className='w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40'
              aria-label='Увеличить'
            >
              <Plus size={14} strokeWidth={2.5} className='text-[#21201F]' />
            </button>
          </>
        ) : (
          <button
            type='button'
            onClick={() => { haptic(); onInc(); }}
            disabled={!canIncrement}
            className='w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40'
            aria-label={`Добавить ${item.name}`}
          >
            <Plus size={16} strokeWidth={2.5} className='text-[#21201F]' />
          </button>
        )}
      </div>
    </div>
  );
}
