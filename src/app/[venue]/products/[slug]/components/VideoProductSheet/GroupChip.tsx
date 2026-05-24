'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { GroupItem, GroupModification } from '@/types/api';

interface Props {
  group: GroupModification;
  /** Иконка группы — показывается ТОЛЬКО когда выбрано >1 элемента */
  icon?: string;
  active: boolean;
  selectedCount: number;
  /** Единственный выбранный элемент (для single-select или когда 1 из multiple) */
  selectedItem?: GroupItem;
  onClick: () => void;
}

/**
 * Чип группы в нижнем горизонтальном ряду.
 *
 * Три состояния:
 * 1. Ничего не выбрано — «+» кружок плавает ВЫШЕ карточки, имя группы внутри
 * 2. Выбран 1 элемент — фото выбранного элемента + его название
 * 3. Выбрано >1 элементов — иконка группы + бейдж числа
 */
export default function GroupChip({
  group,
  icon,
  active,
  selectedCount,
  selectedItem,
  onClick,
}: Props) {
  const [imgError, setImgError] = useState(false);

  const showSelectedPhoto = selectedCount === 1 && !!selectedItem?.photo && !imgError;
  const showGroupIcon    = selectedCount > 1 && !!icon && !imgError;
  const isSelected       = selectedCount > 0;
  const showPlus         = !isSelected;
  const showImage        = showSelectedPhoto || showGroupIcon;

  const imageUrl = showSelectedPhoto ? selectedItem!.photo! : (icon ?? '');
  const label    = selectedCount === 1 && selectedItem ? selectedItem.name : group.name;

  return (
    <button
      type='button'
      onClick={onClick}
      className='relative shrink-0 w-21 active:scale-95 transition-all duration-150 outline-none'
      aria-pressed={active}
      aria-label={selectedCount > 0 ? `${label}, выбрано: ${selectedCount}` : label}
    >
      {/* «+» кружок — плавает НАД карточкой, перекрывает её верхний край */}
      {showPlus && (
        <div className='flex justify-center pb-2'>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 transition-colors duration-150 ${
              active
                ? 'border-white bg-white/60 backdrop-blur-sm'
                : 'border-[#21201F]/50 bg-white/65 backdrop-blur-sm'
            }`}
          >
            <Plus size={19} strokeWidth={2.5} className='text-[#21201F]' />
          </div>
        </div>
      )}

      {/* Карточка чипа */}
      <div
        className={`
          w-full rounded-[20px] bg-white/25 backdrop-blur-md flex flex-col items-center pb-2.5
          overflow-hidden
          transition-all duration-150
          ${active ? 'ring-2 ring-white shadow-md' : 'ring-1 ring-white/30'}
          ${showPlus ? '-mt-5 pt-0' : 'pt-2.5 h-[108px]'}
        `}
      >
        {/* Бейдж для >1 выбранных */}
        {selectedCount > 1 && (
          <span className='absolute top-1.5 right-1.5 z-10 bg-[#21201F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center'>
            {selectedCount}
          </span>
        )}

        {/* Фото (только в image-режиме) */}
        {!showPlus && (
          <div className='flex-1 flex items-center justify-center w-full'>
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=''
                onError={() => setImgError(true)}
                className='w-14 h-14 object-contain'
              />
            ) : (
              <div className='w-14 h-14 rounded-xl bg-white/20' />
            )}
          </div>
        )}

        {/* Пространство под «+» кружком внутри карточки */}
        {showPlus && <div className='h-3' />}

        {/* Название */}
        <span className='text-[11px] font-semibold text-[#21201F] text-center leading-tight line-clamp-2 w-full px-1.5'>
          {label}
        </span>
      </div>
    </button>
  );
}
