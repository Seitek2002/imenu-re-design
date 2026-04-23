'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  onAddressChange: (fullAddress: string) => void;
}

export default function DeliveryInputs({ onAddressChange }: Props) {
  const t = useTranslations('Cart.address');
  const [street, setStreet] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [apt, setApt] = useState('');

  useEffect(() => {
    const parts = [];
    if (street) parts.push(street);
    if (entrance) parts.push(t('entrancePart', { value: entrance }));
    if (floor) parts.push(t('floorPart', { value: floor }));
    if (apt) parts.push(t('aptPart', { value: apt }));
    onAddressChange(parts.join(', '));
  }, [street, entrance, floor, apt, onAddressChange, t]);

  return (
    <div className='flex flex-col gap-2 animate-fadeIn'>
      {/* Улица */}
      <label className='bg-[#F5F5F5] flex flex-col rounded-xl py-2 px-4 focus-within:ring-1 focus-within:ring-brand/20 transition-all'>
        <span className='text-[#A4A4A4] text-xs mb-0.5'>
          {t('streetLabel')}
        </span>
        <input
          type='text'
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className='bg-transparent outline-none text-[#111111] font-medium placeholder-gray-400 w-full'
          placeholder={t('streetPlaceholder')}
        />
      </label>

      {/* Доп поля */}
      <div className='grid grid-cols-3 gap-2'>
        <label className='bg-[#F5F5F5] flex flex-col rounded-xl py-2 px-3 focus-within:ring-1 focus-within:ring-brand/20'>
          <span className='text-[#A4A4A4] text-[10px] mb-0.5'>{t('entranceLabel')}</span>
          <input
            type='text'
            value={entrance}
            onChange={(e) => setEntrance(e.target.value)}
            className='bg-transparent outline-none text-[#111111] w-full text-sm font-medium'
          />
        </label>
        <label className='bg-[#F5F5F5] flex flex-col rounded-xl py-2 px-3 focus-within:ring-1 focus-within:ring-brand/20'>
          <span className='text-[#A4A4A4] text-[10px] mb-0.5'>{t('floorLabel')}</span>
          <input
            type='text'
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className='bg-transparent outline-none text-[#111111] w-full text-sm font-medium'
          />
        </label>
        <label className='bg-[#F5F5F5] flex flex-col rounded-xl py-2 px-3 focus-within:ring-1 focus-within:ring-brand/20'>
          <span className='text-[#A4A4A4] text-[10px] mb-0.5'>{t('aptLabel')}</span>
          <input
            type='text'
            value={apt}
            onChange={(e) => setApt(e.target.value)}
            className='bg-transparent outline-none text-[#111111] w-full text-sm font-medium'
          />
        </label>
      </div>
    </div>
  );
}
