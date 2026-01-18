'use client';

import { useState, useEffect } from 'react';

interface Props {
  onAddressChange: (fullAddress: string) => void;
}

export default function DeliveryInputs({ onAddressChange }: Props) {
  const [street, setStreet] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [apt, setApt] = useState('');

  // 🔥 Эффект: при изменении любого поля собираем полную строку
  useEffect(() => {
    // Собираем массив заполненных частей
    const parts = [];

    if (street) parts.push(street);
    if (entrance) parts.push(`подъезд ${entrance}`);
    if (floor) parts.push(`этаж ${floor}`);
    if (apt) parts.push(`кв/офис ${apt}`);

    // Склеиваем через запятую
    const fullString = parts.join(', ');

    // Отправляем родителю
    onAddressChange(fullString);
  }, [street, entrance, floor, apt, onAddressChange]);

  return (
    <div className='flex flex-col gap-2 animate-fadeIn'>
      {/* Улица */}
      <label className='bg-[#F5F5F5] flex flex-col rounded-xl py-2 px-4 focus-within:ring-1 focus-within:ring-brand/20 transition-all'>
        <span className='text-[#A4A4A4] text-xs mb-0.5'>
          Улица и номер дома
        </span>
        <input
          type='text'
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className='bg-transparent outline-none text-[#111111] font-medium placeholder-gray-400 w-full'
          placeholder='Например: Токтогула 125'
        />
      </label>

      {/* Доп поля в одну строку */}
      <div className='grid grid-cols-3 gap-2'>
        <label className='bg-[#F5F5F5] flex flex-col rounded-xl py-2 px-3 focus-within:ring-1 focus-within:ring-brand/20'>
          <span className='text-[#A4A4A4] text-[10px] mb-0.5'>Подъезд</span>
          <input
            type='text'
            value={entrance}
            onChange={(e) => setEntrance(e.target.value)}
            className='bg-transparent outline-none text-[#111111] w-full text-sm font-medium'
          />
        </label>
        <label className='bg-[#F5F5F5] flex flex-col rounded-xl py-2 px-3 focus-within:ring-1 focus-within:ring-brand/20'>
          <span className='text-[#A4A4A4] text-[10px] mb-0.5'>Этаж</span>
          <input
            type='text'
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className='bg-transparent outline-none text-[#111111] w-full text-sm font-medium'
          />
        </label>
        <label className='bg-[#F5F5F5] flex flex-col rounded-xl py-2 px-3 focus-within:ring-1 focus-within:ring-brand/20'>
          <span className='text-[#A4A4A4] text-[10px] mb-0.5'>Кв./Офис</span>
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
