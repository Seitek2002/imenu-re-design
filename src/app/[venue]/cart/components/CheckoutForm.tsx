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

// 🔥 Подключаем стор заведения
import { useVenueStore } from '@/store/venue';

interface Props {
  orderType: 'takeout' | 'delivery' | 'dinein';
}

export default function CheckoutForm({ orderType }: Props) {
  const [openTime, setOpenTime] = useState(false);
  const [openSpots, setOpenSpots] = useState(false);

  // --- ДАННЫЕ ИЗ СТОРА ---
  const venueData = useVenueStore((state) => state.data);
  const globalSpotId = useVenueStore((state) => state.spotId);
  const setContext = useVenueStore((state) => state.setContext);

  // Преобразуем реальные данные заведения в формат, который ждет SpotList
  const realSpots = (venueData?.spots || []).map((spot) => ({
    id: spot.id,
    title: spot.name, // В API это name, а в UI ты использовал title
    address: spot.address || '',
  }));

  // Local state для времени
  const [pickupTime, setPickupTime] = useState<string>('Быстрее всего');

  // Определяем выбранный филиал: либо тот, что в сторе, либо первый из списка по умолчанию
  const currentSpotId =
    globalSpotId || (realSpots.length > 0 ? realSpots[0].id : undefined);
  const selectedSpot = realSpots.find((s) => s.id === currentSpotId);

  const canPickSpot = orderType !== 'delivery'; // Для доставки филиал выбирается автоматически

  // Обработчик выбора филиала
  const handleSpotSelect = (id: number) => {
    setContext({ spotId: id }); // Сохраняем глобально для DrawerCheckout
    setOpenSpots(false);
  };

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
        <div className='relative p-2'>
          <button
            onClick={() => setOpenSpots(false)}
            className='absolute top-2 right-2 h-8 w-8 rounded-full bg-[#F5F5F5] flex items-center justify-center font-bold'
          >
            ✕
          </button>
          <h3 className='text-lg font-bold mb-4'>Выберите филиал</h3>

          {/* Передаем реальные данные */}
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
