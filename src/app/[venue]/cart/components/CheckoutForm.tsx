'use client';

import { useState } from 'react';
import Image from 'next/image';
import SelectField from './SelectField';
import ModalPortal from './ModalPortal';

// Sub-components
import SpotList from './SpotList';
import TimePickerContent from './TimePickerContent';

// Icons
import clockIcon from '@/assets/Cart/Drawer/clock.svg';
import geoIcon from '@/assets/Cart/Drawer/geo.svg';
import selectArrow from '@/assets/Cart/Drawer/select-arrow.svg';

// MOCK DATA
const MOCK_SPOTS = [
  { id: 1, title: 'Устукан на Манаса', address: 'пр. Манаса 41/1' },
  { id: 2, title: 'Устукан в Азии Молл', address: 'пр. Ч. Айтматова 3' },
];

interface Props {
  orderType: 'takeout' | 'delivery' | 'dinein';
}

export default function CheckoutForm({ orderType }: Props) {
  const [openTime, setOpenTime] = useState(false);
  const [openSpots, setOpenSpots] = useState(false);

  // Local state
  const [pickupTime, setPickupTime] = useState<string>('Быстрее всего');
  const [selectedSpotId, setSelectedSpotId] = useState(1);

  const selectedSpot = MOCK_SPOTS.find((s) => s.id === selectedSpotId);
  const canPickSpot = orderType !== 'delivery'; // Для доставки филиал выбирается автоматически (обычно)

  return (
    <div className='flex flex-col gap-2'>
      {/* 1. Время выдачи */}
      <SelectField
        leftIcon={<Image src={clockIcon} alt='clock' />}
        rightIcon={<Image src={selectArrow} alt='arrow' />}
        value={pickupTime}
        placeholder='Время выдачи'
        label='Когда приготовить?'
        onClick={() => setOpenTime(true)}
      />

      {/* 2. Филиал (Скрываем для доставки) */}
      {canPickSpot && (
        <SelectField
          leftIcon={<Image src={geoIcon} alt='geo' />}
          rightIcon={<Image src={selectArrow} alt='arrow' />}
          value={selectedSpot?.title}
          subLabel={selectedSpot?.address}
          placeholder='Выбрать филиал'
          label='Где заберете?'
          onClick={() => setOpenSpots(true)}
        />
      )}

      {/* --- МОДАЛКИ --- */}

      {/* Выбор времени */}
      <ModalPortal
        open={openTime}
        onClose={() => setOpenTime(false)}
        zIndex={100}
      >
        <div className='relative'>
          <button
            onClick={() => setOpenTime(false)}
            className='absolute top-2 right-2 h-8 w-8 rounded-full bg-[#F5F5F5] flex items-center justify-center font-bold'
          >
            ✕
          </button>
          <TimePickerContent
            onSave={(val) => {
              setPickupTime(val);
              setOpenTime(false);
            }}
          />
        </div>
      </ModalPortal>

      {/* Выбор филиала */}
      <ModalPortal
        open={openSpots}
        onClose={() => setOpenSpots(false)}
        zIndex={100}
      >
        <div className='relative'>
          <button
            onClick={() => setOpenSpots(false)}
            className='absolute top-2 right-2 h-8 w-8 rounded-full bg-[#F5F5F5] flex items-center justify-center font-bold'
          >
            ✕
          </button>
          <h3 className='text-lg font-bold mb-4'>Выберите филиал</h3>
          <SpotList
            spots={MOCK_SPOTS}
            selectedId={selectedSpotId}
            onSelect={(id) => {
              setSelectedSpotId(id);
              setOpenSpots(false);
            }}
          />
        </div>
      </ModalPortal>
    </div>
  );
}
