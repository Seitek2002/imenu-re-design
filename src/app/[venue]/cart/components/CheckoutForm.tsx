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

import { useVenueStore } from '@/store/venue';

interface Props {
  orderType: 'takeout' | 'delivery' | 'dinein';
  // 🔥 Добавляем пропсы для связи с родительским DrawerCheckout
  pickupTime: string;
  setPickupTime: (time: string) => void;
}

export default function CheckoutForm({
  orderType,
  pickupTime,
  setPickupTime,
}: Props) {
  const [openTime, setOpenTime] = useState(false);
  const [openSpots, setOpenSpots] = useState(false);

  const venueData = useVenueStore((state) => state.data);
  const globalSpotId = useVenueStore((state) => state.spotId);
  const setContext = useVenueStore((state) => state.setContext);

  const realSpots = (venueData?.spots || []).map((spot) => ({
    id: spot.id,
    title: spot.name,
    address: spot.address || '',
  }));

  // 🔥 Удалили локальный useState для pickupTime, он теперь приходит сверху

  const currentSpotId =
    globalSpotId || (realSpots.length > 0 ? realSpots[0].id : undefined);
  const selectedSpot = realSpots.find((s) => s.id === currentSpotId);
  const canPickSpot = orderType !== 'delivery';

  const handleSpotSelect = (id: number) => {
    setContext({ spotId: id });
    setOpenSpots(false);
  };

  return (
    <div className='flex flex-col gap-2'>
      <SelectField
        leftIcon={<Image src={clockIcon} alt='clock' />}
        rightIcon={<Image src={selectArrow} alt='arrow' />}
        value={pickupTime}
        placeholder='Время выдачи'
        label='Когда приготовить?'
        onClick={() => setOpenTime(true)}
      />

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
              setPickupTime(val); // Обновляем состояние в DrawerCheckout
              setOpenTime(false);
            }}
          />
        </div>
      </ModalPortal>

      <ModalPortal
        open={openSpots}
        onClose={() => setOpenSpots(false)}
        zIndex={100}
      >
        <div className='relative p-2'>
          <button
            onClick={() => setOpenSpots(false)}
            className='absolute top-2 right-2 h-8 w-8 rounded-full bg-[#F5F5F5] flex items-center justify-center font-bold'
          >
            ✕
          </button>
          <h3 className='text-lg font-bold mb-4'>Выберите филиал</h3>

          {realSpots.length > 0 ? (
            <SpotList
              spots={realSpots}
              selectedId={currentSpotId || 0}
              onSelect={handleSpotSelect}
            />
          ) : (
            <p className='text-gray-500 text-sm'>Нет доступных филиалов</p>
          )}
        </div>
      </ModalPortal>
    </div>
  );
}
