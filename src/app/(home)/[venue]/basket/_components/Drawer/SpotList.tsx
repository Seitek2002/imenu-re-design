'use client';

import React from 'react';
import Image from 'next/image';
import selectArrow from '@/assets/Basket/Drawer/select-arrow.svg';
import { Spot, formatSpotSubtitle, formatSpotTitle } from './helpers';

type SpotListProps = {
  spots: Spot[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export default function SpotList({ spots, selectedId, onSelect }: SpotListProps) {
  return (
    <div role="listbox">
      {spots.map((s) => {
        const isActive = s?.id === selectedId;
        const title = formatSpotTitle(s);
        const sub = formatSpotSubtitle(s);

        return (
          <button
            key={s?.id}
            type="button"
            role="option"
            aria-selected={isActive}
            onClick={() => onSelect(s.id)}
            className={`w-full px-4 py-3 text-left flex items-center justify-between rounded-lg ${
              isActive ? 'bg-[#F5F5F5]' : ''
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[#111111] font-medium">{title}</span>
              {sub ? <span className="text-xs text-[#A4A4A4] mt-0.5">{sub}</span> : null}
            </div>
            <Image src={selectArrow} alt="selectArrow" />
          </button>
        );
      })}
    </div>
  );
}
