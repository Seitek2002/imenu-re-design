'use client';

import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import type { GroupItem } from '@/types/api';

interface Props {
  item: GroupItem;
  count: number;
  canIncrement: boolean;
  onInc: () => void;
  onDec: () => void;
}

/**
 * Карточка одной опции внутри expanded-сетки.
 *
 * Цвета намеренно тёмные на полупрозрачном светлом фоне: видео-фон
 * сильно меняется по яркости, поэтому контрастный текст важнее, чем
 * следование brand-цветам.
 */
export default function GroupGridItem({
  item,
  count,
  canIncrement,
  onInc,
  onDec,
}: Props) {
  const selected = count > 0;
  const photo = item.photo || '/splash-placeholder.svg';
  const priceNum = Number(item.price);
  const bruttoNum = Number(item.brutto);

  return (
    <div
      className={`relative rounded-2xl p-2 pt-3 flex flex-col items-center text-[#21201F] transition-all bg-gradient-to-b from-white/70 to-white/40 backdrop-blur-md ${
        selected ? 'ring-2 ring-white shadow-lg' : 'ring-1 ring-white/20'
      }`}
    >
      <div className='relative w-14 h-14 shrink-0'>
        <Image
          src={photo}
          alt={item.name}
          fill
          className='object-contain'
          sizes='80px'
        />
      </div>

      <div className='text-[13px] font-bold mt-1 text-center leading-tight line-clamp-1'>
        {item.name}
      </div>

      <div className='text-[11px] text-[#21201F]/60 mt-0.5 text-center whitespace-nowrap'>
        {bruttoNum > 0 ? `${Math.round(bruttoNum)} г` : ''}
        {bruttoNum > 0 && priceNum > 0 ? ' · ' : ''}
        {priceNum > 0 && (
          <>
            +{priceNum} <u>c</u>
          </>
        )}
      </div>

      <div className='mt-1.5 flex items-center justify-center gap-2 min-h-7'>
        {selected ? (
          <>
            <button
              type='button'
              onClick={onInc}
              disabled={!canIncrement}
              className='w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40'
              aria-label='Увеличить'
            >
              <Plus size={14} strokeWidth={2.5} className='text-[#21201F]' />
            </button>
            <span className='font-bold text-sm w-4 text-center'>{count}</span>
            <button
              type='button'
              onClick={onDec}
              className='w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform'
              aria-label='Уменьшить'
            >
              <Minus size={14} strokeWidth={2.5} className='text-[#21201F]' />
            </button>
          </>
        ) : (
          <button
            type='button'
            onClick={onInc}
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
