'use client';

import Image from 'next/image';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { useVenueQuery } from '@/store/venue';
import { useCheckout } from '@/store/checkout';

import clockIcon from '@/assets/Basket/Drawer/clock.svg';
import geoIcon from '@/assets/Basket/Drawer/geo.svg';
import selectArrow from '@/assets/Basket/Drawer/select-arrow.svg';

import ModalPortal from '@/components/ui/ModalPortal';
import SelectField from '@/components/ui/SelectField';
import SpotList from './SpotList';
import TimePickerContent from './TimePickerContent';
import { Spot, formatSpotSubtitle, formatSpotTitle, nextNearest15Min } from './helpers';

const Form = () => {
  const { venue } = useVenueQuery();
  const spots = useMemo<Spot[]>(
    () => (Array.isArray((venue as any)?.spots) ? (venue as any).spots : []),
    [venue]
  );

  const {
    selectedSpotId,
    setSelectedSpotId,
    pickupMode,
    pickupTime,
    setPickupMode,
    setPickupTime,
  } = useCheckout();
  const orderType = useCheckout((s) => s.orderType);

  // Modals
  const [openSpots, setOpenSpots] = useState(false);
  const [openTime, setOpenTime] = useState(false);

  // Close spots modal if switched to delivery (spot picking hidden for delivery)
  useEffect(() => {
    if (orderType === 'delivery' && openSpots) setOpenSpots(false);
  }, [orderType, openSpots]);

  // Ensure first spot is chosen by default
  useEffect(() => {
    if (!selectedSpotId && spots.length > 0) {
      setSelectedSpotId(spots[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots?.length]);

  // Selected spot + labels
  const selected = useMemo(
    () => spots.find((s) => s?.id === selectedSpotId) ?? null,
    [spots, selectedSpotId]
  );
  const label = selected ? formatSpotTitle(selected) : 'Выбрать филиал';
  const subtitle = selected ? formatSpotSubtitle(selected) : null;

  const handlePickSpot = useCallback(
    (id: number) => {
      setSelectedSpotId(id);
      setOpenSpots(false);
    },
    [setSelectedSpotId]
  );

  // Time state
  const [timeInput, setTimeInput] = useState<string>(() => nextNearest15Min());
  useEffect(() => {
    if (pickupMode === 'time' && pickupTime) {
      setTimeInput(pickupTime);
    }
  }, [pickupMode, pickupTime]);

  const saveTime = useCallback(() => {
    if (timeInput) {
      setPickupMode('time');
      setPickupTime(timeInput);
      setOpenTime(false);
    }
  }, [timeInput, setPickupMode, setPickupTime]);

  const chooseAsap = useCallback(() => {
    setPickupMode('asap');
    setPickupTime(null);
    setOpenTime(false);
  }, [setPickupMode, setPickupTime]);

  const timeLabel =
    pickupMode === 'asap' ? 'Быстрее всего' : pickupTime ? pickupTime : 'Выбрать время';

  return (
    <div className='flex flex-col gap-1.5'>
      {/* Время выдачи */}
      <SelectField
        leftIcon={<Image src={clockIcon} alt='clockIcon' />}
        rightIcon={<Image src={selectArrow} alt='selectArrow' />}
        value={timeLabel}
        placeholder='Время выдачи'
        onClick={() => setOpenTime(true)}
        ariaHasPopup='dialog'
        ariaExpanded={openTime}
      />

      {/* Филиал (скрыт для доставки) */}
      {orderType !== 'delivery' && (
        <SelectField
          leftIcon={<Image src={geoIcon} alt='geoIcon' />}
          rightIcon={<Image src={selectArrow} alt='selectArrow' />}
          value={label}
          placeholder='Выбрать филиал'
          subLabel={selected ? subtitle ?? undefined : undefined}
          onClick={() => setOpenSpots(true)}
          ariaHasPopup='listbox'
          ariaExpanded={openSpots}
        />
      )}

      {/* Spots modal (скрыт для доставки) */}
      {orderType !== 'delivery' && (
        <ModalPortal open={openSpots} onClose={() => setOpenSpots(false)}>
          <button
            type='button'
            aria-label='Закрыть'
            onClick={() => setOpenSpots(false)}
            className='absolute top-2 right-2 h-8 w-8 rounded-full bg-[#F5F5F5] text-[#111111] flex items-center justify-center'
          >
            ✕
          </button>
          <h2 className='text-base font-semibold mb-3'>Выберите филиал</h2>
          <SpotList spots={spots} selectedId={selectedSpotId} onSelect={handlePickSpot} />
        </ModalPortal>
      )}

      {/* Pickup time modal */}
      <ModalPortal open={openTime} onClose={() => setOpenTime(false)} zIndex={100}>
        <button
          type='button'
          aria-label='Закрыть'
          onClick={() => setOpenTime(false)}
          className='absolute top-2 right-2 h-8 w-8 rounded-full bg-[#F5F5F5] text-[#111111] flex items-center justify-center'
        >
          ✕
        </button>
        <TimePickerContent
          pickupMode={pickupMode}
          timeInput={timeInput}
          setTimeInput={setTimeInput}
          onChooseAsap={chooseAsap}
          onSaveTime={saveTime}
          onCancel={() => setOpenTime(false)}
        />
      </ModalPortal>
    </div>
  );
};

export default Form;
