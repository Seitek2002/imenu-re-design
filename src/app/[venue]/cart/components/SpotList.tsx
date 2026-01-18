'use client';

import Image from 'next/image';
import selectArrow from '@/assets/Cart/Drawer/select-arrow.svg';

// Тип для Spot (можно вынести в types)
type SpotMock = {
  id: number;
  title: string;
  address: string;
};

type SpotListProps = {
  spots: SpotMock[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export default function SpotList({
  spots,
  selectedId,
  onSelect,
}: SpotListProps) {
  return (
    <div className='flex flex-col gap-2'>
      {spots.map((s) => {
        const isActive = s.id === selectedId;
        return (
          <button
            key={s.id}
            type='button'
            onClick={() => onSelect(s.id)}
            className={`w-full px-4 py-3 text-left flex items-center justify-between rounded-xl transition-colors ${
              isActive
                ? 'bg-[#F0F0F0] border border-gray-200'
                : 'bg-white border border-transparent'
            }`}
          >
            <div className='flex flex-col'>
              <span className='text-[#111111] font-medium'>{s.title}</span>
              <span className='text-xs text-[#939393] mt-0.5'>{s.address}</span>
            </div>
            {isActive && (
              <Image src={selectArrow} alt='selected' className='rotate-90' />
            )}
          </button>
        );
      })}
    </div>
  );
}
