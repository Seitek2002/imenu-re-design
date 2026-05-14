'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import type { GroupModification } from '@/types/api';

interface Props {
  group: GroupModification;
  /** Иконка-картинка. Если нет — показываем «+» в кружке. */
  icon?: string;
  active: boolean;
  selectedCount: number;
  onClick: () => void;
}

/**
 * Чип группы в нижнем горизонтальном ряду.
 *
 * Если у группы есть иконка-картинка (например, splash молока), она занимает
 * верхнюю часть карточки. Если иконки нет — показываем плюс в обводке.
 * Бэйдж количества появляется, как только в группе что-то выбрано.
 */
export default function GroupChip({
  group,
  icon,
  active,
  selectedCount,
  onClick,
}: Props) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`relative shrink-0 w-28 h-32 rounded-3xl flex flex-col items-center justify-end p-2.5 active:scale-95 transition-all bg-gradient-to-b from-white/70 to-white/50 backdrop-blur-md ${
        active ? 'ring-2 ring-white shadow-lg' : 'ring-1 ring-white/30'
      }`}
      aria-pressed={active}
      aria-label={
        selectedCount > 0
          ? `${group.name}, выбрано: ${selectedCount}`
          : group.name
      }
    >
      {selectedCount > 0 && (
        <span className='absolute top-1.5 right-1.5 bg-[#21201F] text-white text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-full min-w-4 text-center'>
          {selectedCount}
        </span>
      )}

      <div className='flex-1 w-full flex items-center justify-center min-h-0'>
        {icon ? (
          <div className='relative w-20 h-20 -mt-3'>
            <Image
              src={icon}
              alt=''
              fill
              className='object-contain'
              sizes='100px'
            />
          </div>
        ) : (
          <div className='w-9 h-9 rounded-full border-2 border-[#21201F]/70 flex items-center justify-center'>
            <Plus size={20} strokeWidth={2.5} className='text-[#21201F]' />
          </div>
        )}
      </div>

      <div className='text-sm font-medium text-[#21201F] leading-none pb-1'>
        {group.name}
      </div>
    </button>
  );
}
