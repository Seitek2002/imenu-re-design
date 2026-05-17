'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { GroupItem, GroupModification } from '@/types/api';

interface Props {
  group: GroupModification;
  /** Иконка группы (показывается когда группа активна и ничего не выбрано) */
  icon?: string;
  /** Активна ли группа (сетка открыта) */
  active: boolean;
  /** Сколько элементов выбрано в группе */
  selectedCount: number;
  /** Первый выбранный элемент (для single или когда 1 выбранный в multiple) */
  selectedItem?: GroupItem;
  onClick: () => void;
}

/**
 * Чип группы в нижнем горизонтальном ряду.
 *
 * Три состояния отображения:
 * 1. Default (ничего не выбрано, группа закрыта): круглый «+» + название группы
 * 2. Active (группа открыта, ничего не выбрано): иконка группы + название
 * 3. Selected (выбран хотя бы один элемент): фото элемента + его название
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

  // Определяем что показывать
  const showSelectedItem = selectedCount === 1 && selectedItem?.photo;
  const showGroupIcon = (active || selectedCount > 1) && icon && !imgError;
  const showPlus = !showSelectedItem && !showGroupIcon;

  const imageUrl = showSelectedItem
    ? selectedItem!.photo!
    : icon ?? '';

  const label = selectedCount === 1 && selectedItem
    ? selectedItem.name
    : group.name;

  return (
    <button
      type='button'
      onClick={onClick}
      className={`
        relative shrink-0 w-21 h-22 rounded-[20px] flex flex-col items-center
        justify-between py-2.5 px-1.5 active:scale-95 transition-all duration-150
        bg-white/25 backdrop-blur-md
        ${active ? 'ring-2 ring-white shadow-md' : 'ring-1 ring-white/30'}
      `}
      aria-pressed={active}
      aria-label={selectedCount > 0 ? `${label}, выбрано: ${selectedCount}` : label}
    >
      {/* Бейдж для multiple > 1 */}
      {selectedCount > 1 && (
        <span className='absolute top-1.5 right-1.5 bg-[#21201F] text-white text-[9px] font-bold leading-none px-1.5 py-0.5 rounded-full min-w-[16px] text-center'>
          {selectedCount}
        </span>
      )}

      {/* Изображение или «+» */}
      <div className='flex-1 w-full flex items-center justify-center min-h-0'>
        {showPlus ? (
          <div className='w-9 h-9 rounded-full border-2 border-[#21201F]/60 flex items-center justify-center'>
            <Plus size={18} strokeWidth={2.5} className='text-[#21201F]' />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=''
            onError={() => setImgError(true)}
            className='w-16 h-16 object-contain'
          />
        )}
      </div>

      {/* Название */}
      <span className='text-[11px] font-semibold text-[#21201F] text-center leading-tight line-clamp-2 w-full px-0.5'>
        {label}
      </span>
    </button>
  );
}
