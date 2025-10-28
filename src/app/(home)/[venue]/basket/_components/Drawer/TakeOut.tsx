import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useVenueQuery } from '@/store/venue';
import { useCheckout } from '@/store/checkout';

import clockIcon from '@/assets/Basket/Drawer/clock.svg';
import geoIcon from '@/assets/Basket/Drawer/geo.svg';
import selectArrow from '@/assets/Basket/Drawer/select-arrow.svg';

const TakeOut = () => {
  const { venue } = useVenueQuery();
  const spots = useMemo(
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

  const [open, setOpen] = useState(false); // spots modal
  const [openTime, setOpenTime] = useState(false); // time modal
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  // if nothing selected and есть дефолт — можно автоподставить (не обязательно)
  useEffect(() => {
    if (!selectedSpotId && spots.length > 0) {
      // По умолчанию выбираем первый филиал
      setSelectedSpotId(spots[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots?.length]);

  const selected = useMemo(
    () => spots.find((s: any) => s?.id === selectedSpotId) ?? null,
    [spots, selectedSpotId]
  );

  const label = selected
    ? `${selected?.name ?? ''}${
        selected?.address ? `, ${selected.address}` : ''
      }`.trim()
    : 'Выбрать филиал';

  const subtitle: string | null = (() => {
    // показываем подстроку только если она реально есть в данных
    const v = (selected as any)?.locality ?? (selected as any)?.village ?? null;
    if (typeof v === 'string' && v.trim()) return v.trim();
    return null;
  })();

  function handlePick(id: number) {
    setSelectedSpotId(id);
    setOpen(false);
  }

  // Helpers for pickup time
  const timeLabel =
    pickupMode === 'asap'
      ? 'Быстрее всего'
      : pickupTime
      ? pickupTime
      : 'Выбрать время';

  const [timeInput, setTimeInput] = useState<string>(() => {
    // default nearest 15-min slot as HH:MM
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15 - (d.getMinutes() % 15));
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });

  useEffect(() => {
    if (pickupMode === 'time' && pickupTime) {
      setTimeInput(pickupTime);
    }
  }, [pickupMode, pickupTime]);

  const saveTime = () => {
    if (timeInput) {
      setPickupMode('time');
      setPickupTime(timeInput);
      setOpenTime(false);
    }
  };

  const chooseAsap = () => {
    setPickupMode('asap');
    setPickupTime(null);
    setOpenTime(false);
  };

  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center gap-3'>
        <Image src={clockIcon} alt='clockIcon' />
        <button
          type='button'
          className='bg-[#F5F5F5] flex items-center justify-between p-4 rounded-lg flex-1 text-left'
          onClick={() => setOpenTime(true)}
          aria-haspopup='dialog'
          aria-expanded={openTime}
        >
          <span className={pickupMode === 'time' ? 'text-[#111111]' : 'text-[#A4A4A4]'}>
            {timeLabel}
          </span>
          <Image src={selectArrow} alt='selectArrow' />
        </button>
      </div>

      <div className='flex items-center gap-3'>
        <Image src={geoIcon} alt='geoIcon' />
        <button
          type='button'
          className='bg-[#F5F5F5] flex items-center justify-between p-4 rounded-lg flex-1 text-left'
          aria-haspopup='listbox'
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <div className='flex flex-col'>
            <span className={selected ? 'text-[#111111]' : 'text-[#A4A4A4]'}>
              {label || 'Выбрать филиал'}
            </span>
            {selected && subtitle ? (
              <span className='text-xs text-[#A4A4A4] mt-0.5'>{subtitle}</span>
            ) : null}
          </div>
          <Image src={selectArrow} alt='selectArrow' />
        </button>
      </div>

      {open && isClient
        ? createPortal(
            <div
              role='dialog'
              aria-modal='true'
              className='fixed inset-0 z-[60] flex items-center justify-center'
            >
              {/* Backdrop */}
              <div
                className='absolute inset-0 bg-black/50'
                onClick={() => setOpen(false)}
              />
              {/* Centered modal with list of spots */}
              <div className='relative w-full flex items-center justify-center'>
                <div className='bg-white rounded-2xl p-4 w-[90%] max-w-md max-h-[70vh] overflow-y-auto shadow-2xl relative'>
                  <button
                    type='button'
                    aria-label='Закрыть'
                    onClick={() => setOpen(false)}
                    className='absolute top-2 right-2 h-8 w-8 rounded-full bg-[#F5F5F5] text-[#111111] flex items-center justify-center'
                  >
                    ✕
                  </button>
                  <h2>Выберите филиал:</h2>
                  <div role='listbox'>
                    {spots.map((s: any) => {
                      const isActive = s?.id === selectedSpotId;
                      const title = `${s?.name ?? ''}${
                        s?.address ? `, ${s.address}` : ''
                      }`.trim();
                      const sub =
                        typeof s?.locality === 'string' && s.locality.trim()
                          ? s.locality.trim()
                          : null;

                      return (
                        <button
                          key={s?.id ?? Math.random()}
                          type='button'
                          role='option'
                          aria-selected={isActive}
                          onClick={() => handlePick(s.id)}
                          className={`w-full px-4 py-3 text-left flex items-center justify-between rounded-lg ${
                            isActive ? 'bg-[#F5F5F5]' : ''
                          }`}
                        >
                          <div className='flex flex-col'>
                            <span className='text-[#111111] font-medium'>
                              {title || 'Филиал'}
                            </span>
                            {sub ? (
                              <span className='text-xs text-[#A4A4A4] mt-0.5'>
                                {sub}
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      {/* Pickup time modal */}
      {openTime && isClient
        ? createPortal(
            <div
              role='dialog'
              aria-modal='true'
              className='fixed inset-0 z-[70] flex items-center justify-center'
            >
              {/* Backdrop */}
              <div
                className='absolute inset-0 bg-black/50'
                onClick={() => setOpenTime(false)}
              />
              {/* Centered modal */}
              <div className='relative w-full flex items-center justify-center'>
                <div className='bg-white rounded-2xl p-4 w-[90%] max-w-sm shadow-2xl relative'>
                  <button
                    type='button'
                    aria-label='Закрыть'
                    onClick={() => setOpenTime(false)}
                    className='absolute top-2 right-2 h-8 w-8 rounded-full bg-[#F5F5F5] text-[#111111] flex items-center justify-center'
                  >
                    ✕
                  </button>
                  <h2 className='text-base font-semibold mb-3'>Время выдачи</h2>

                  <div className='flex flex-col gap-2'>
                    <button
                      type='button'
                      onClick={chooseAsap}
                      className={`w-full px-4 py-3 text-left rounded-lg border ${
                        pickupMode === 'asap' ? 'border-[#FF7A00] bg-[#FFF5EE]' : 'border-[#E5E7EB]'
                      }`}
                    >
                      Быстрее всего
                    </button>

                    <div className='rounded-lg border border-[#E5E7EB] p-3'>
                      <div className='text-sm text-[#6B7280] mb-2'>Указать время</div>
                      <input
                        type='time'
                        value={timeInput}
                        onChange={(e) => setTimeInput(e.target.value)}
                        className='w-full rounded-md border border-[#E5E7EB] p-2'
                      />
                      <div className='mt-3 flex justify-end gap-2'>
                        <button
                          type='button'
                          className='px-4 py-2 rounded-md bg-[#F5F5F5] text-[#111111]'
                          onClick={() => setOpenTime(false)}
                        >
                          Отмена
                        </button>
                        <button
                          type='button'
                          className='px-4 py-2 rounded-md bg-[#FF7A00] text-white'
                          onClick={saveTime}
                        >
                          Сохранить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
};

export default TakeOut;
