'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { GroupItem, GroupModification } from '@/types/api';

interface Props {
  group: GroupModification;
  icon?: string;
  active: boolean;
  selectedCount: number;
  selectedItem?: GroupItem;
  onClick: () => void;
}

export default function GroupChip({
  group,
  icon,
  active,
  selectedCount,
  selectedItem,
  onClick,
}: Props) {
  const [imgError, setImgError] = useState(false);

  // Use same fallback as GroupGridItem so the chip image always matches the grid.
  const resolvedPhoto = selectedItem?.photo || '/splash-placeholder.svg';

  const showSelectedPhoto = selectedCount === 1 && !!selectedItem && !imgError;
  const showGroupIcon     = selectedCount > 1 && !!icon && !imgError;
  const isSelected        = selectedCount > 0;
  const showImage         = showSelectedPhoto || showGroupIcon;

  const imageUrl = showSelectedPhoto ? resolvedPhoto : (icon ?? '');

  // Reset error state when the image URL changes (e.g. different item selected).
  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);
  const label    = selectedCount === 1 && selectedItem ? selectedItem.name : group.name;

  return (
    <button
      type='button'
      onClick={onClick}
      className='relative shrink-0 w-23 active:scale-95 transition-all duration-150 outline-none'
      aria-pressed={active}
      aria-label={selectedCount > 0 ? `${label}, выбрано: ${selectedCount}` : label}
    >
      {/* Бейдж для >1 выбранных */}
      {selectedCount > 1 && (
        <span className='absolute top-1.5 right-1.5 z-10 bg-[#21201F] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center'>
          {selectedCount}
        </span>
      )}

      {/* Карточка чипа — единый фиксированный размер */}
      <div
        className={`
          w-full h-[90px] rounded-2xl flex flex-col items-center justify-between
          pt-[10px] pb-[10px] px-4 overflow-hidden
          transition-all duration-150
          ${isSelected
            ? active ? 'bg-white/75 ring-2 ring-white shadow-md' : 'bg-white/60'
            : active ? 'bg-white/50 ring-2 ring-white shadow-md' : 'bg-white/30 backdrop-blur-[10px] ring-1 ring-white/30'
          }
        `}
      >
        {/* Верхняя зона: фото / иконка группы / плюсик */}
        <div className='flex items-center justify-center w-full'>
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=''
              onError={() => setImgError(true)}
              className='w-10 h-10 object-contain'
            />
          ) : isSelected ? (
            <div className='w-10 h-10 rounded-xl bg-white/20' />
          ) : (
            <div className='w-8 h-8 rounded-full bg-white/60 flex items-center justify-center'>
              <Plus size={19} strokeWidth={2.5} className='text-[#21201F]' />
            </div>
          )}
        </div>

        {/* Название */}
        <span className='flex-1 mt-2.5 text-[10px] wrap-break-word font-semibold text-[#21201F] text-center leading-tight line-clamp-2 w-full px-1.5 shrink-0'>
          {label}
        </span>
      </div>
    </button>
  );
}
