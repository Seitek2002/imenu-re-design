'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Check, BookmarkPlus } from 'lucide-react';

import { distanceKm, type Coords } from '@/lib/osm-maps';
import DeliveryMapModal from './DeliveryMapModal';
import { useVenueStore } from '@/store/venue';
import { getDeliveryGeo } from '@/lib/delivery';
import { useAuthStore } from '@/store/auth';
import { useMyAddresses, type MyAddress } from '@/lib/api/addresses';

export interface SaveAddressIntent {
  label: string;
  address: string;
  latitude: string;
  longitude: string;
  entrance: string | null;
  apartment: string | null;
  floor: string | null;
}

interface Props {
  onAddressChange: (fullAddress: string) => void;
  onCoordsChange: (coords: Coords | null) => void;
  initialCoords?: Coords | null;
  initialStreet?: string;
  /**
   * Если задан — компонент пробрасывает наверх намерение сохранить введённый
   * адрес в /clients/me/addresses/ после успешного оформления заказа.
   * null означает «не сохранять».
   */
  onSaveIntentChange?: (intent: SaveAddressIntent | null) => void;
  /**
   * ID сохранённого адреса, выбранного из picker'а. null если пользователь
   * правит вручную. Используется для телеметрии в POST /orders/ (Kuma 2026-05-19 §3).
   */
  onPickedAddressIdChange?: (id: number | null) => void;
}

const coordStr = (n: number) => n.toFixed(6);

export default function DeliveryInputs({
  onAddressChange,
  onCoordsChange,
  initialCoords,
  initialStreet,
  onSaveIntentChange,
  onPickedAddressIdChange,
}: Props) {
  const t = useTranslations('Cart.address');
  const venue = useVenueStore((s) => s.data);
  const spotId = useVenueStore((s) => s.spotId);
  const { venueCoords, freeRadiusKm } = getDeliveryGeo(venue, spotId);
  const freeDeliveryRadiusKm = freeRadiusKm > 0 ? freeRadiusKm : null;
  const deliveryFixedFee = parseFloat(venue?.deliveryFixedFee || '0');

  const hasToken = useAuthStore((s) => !!s.accessToken);
  const { data: savedAddresses } = useMyAddresses();
  const addresses = savedAddresses ?? [];

  const [street, setStreet] = useState(initialStreet ?? '');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [apt, setApt] = useState('');
  const [coords, setCoords] = useState<Coords | null>(initialCoords ?? null);
  const [mapOpen, setMapOpen] = useState(false);

  // ID выбранного сохранённого адреса; null если пользователь правит вручную.
  const [pickedId, setPickedId] = useState<number | null>(null);

  // Намерение сохранить новый адрес после заказа.
  const [saveOn, setSaveOn] = useState(false);
  const [saveLabel, setSaveLabel] = useState(t('saveLabelDefault'));

  useEffect(() => {
    const parts = [];
    if (street) parts.push(street);
    if (entrance) parts.push(t('entrancePart', { value: entrance }));
    if (floor) parts.push(t('floorPart', { value: floor }));
    if (apt) parts.push(t('aptPart', { value: apt }));
    onAddressChange(parts.join(', '));
  }, [street, entrance, floor, apt, onAddressChange, t]);

  useEffect(() => {
    onCoordsChange(coords);
  }, [coords, onCoordsChange]);

  useEffect(() => {
    onPickedAddressIdChange?.(pickedId);
  }, [pickedId, onPickedAddressIdChange]);

  // Прокидываем save-intent наверх (или null).
  useEffect(() => {
    if (!onSaveIntentChange) return;
    const canSave =
      hasToken && saveOn && !!coords && street.trim().length > 0 && pickedId === null;
    if (!canSave || !coords) {
      onSaveIntentChange(null);
      return;
    }
    onSaveIntentChange({
      label: saveLabel.trim() || t('saveLabelDefault'),
      address: street.trim(),
      latitude: coordStr(coords.lat),
      longitude: coordStr(coords.lng),
      entrance: entrance.trim() || null,
      apartment: apt.trim() || null,
      floor: floor.trim() || null,
    });
  }, [
    hasToken,
    saveOn,
    saveLabel,
    coords,
    street,
    entrance,
    apt,
    floor,
    pickedId,
    onSaveIntentChange,
    t,
  ]);

  // Любая ручная правка после выбора сохранённого адреса сбрасывает «pickedId».
  const editingResetsPick = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (pickedId !== null) setPickedId(null);
  };

  const handleMapConfirm = (c: Coords, addr: string) => {
    setCoords(c);
    if (addr) setStreet(addr);
    setPickedId(null);
    setMapOpen(false);
  };

  const handlePickSaved = (a: MyAddress) => {
    setStreet(a.address);
    setEntrance(a.entrance ?? '');
    setFloor(a.floor ?? '');
    setApt(a.apartment ?? '');
    setCoords({ lat: Number(a.latitude), lng: Number(a.longitude) });
    setPickedId(a.id);
    setSaveOn(false);
  };

  const insideFreeZone =
    !!venueCoords && !!coords && !!freeDeliveryRadiusKm
      ? distanceKm(venueCoords, coords) <= freeDeliveryRadiusKm
      : null;

  const showSaveBlock =
    hasToken && pickedId === null && !!coords && street.trim().length > 0;

  return (
    <div className='flex flex-col gap-2 animate-fadeIn'>
      {hasToken && addresses.length > 0 && (
        <div className='-mx-1 px-1 overflow-x-auto no-scrollbar'>
          <div className='flex gap-2 w-max py-1'>
            {addresses.map((a) => {
              const active = pickedId === a.id;
              return (
                <button
                  key={a.id}
                  type='button'
                  onClick={() => handlePickSaved(a)}
                  className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-medium border transition ${
                    active
                      ? 'bg-[#21201F] text-white border-[#21201F]'
                      : 'bg-white text-[#111111] border-[#EDEAE7]'
                  }`}
                >
                  <MapPin size={14} className={active ? 'text-white' : 'text-brand'} />
                  <span className='truncate max-w-[10rem]'>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Точка на карте */}
      <button
        type='button'
        onClick={() => setMapOpen(true)}
        className='bg-[#F5F5F5] flex items-center gap-3 rounded-xl py-3 px-4 text-left active:bg-gray-200 transition-colors'
      >
        <div
          className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${
            coords ? 'bg-brand/10' : 'bg-white'
          }`}
        >
          {coords ? (
            <Check size={18} className='text-brand' />
          ) : (
            <MapPin size={18} className='text-[#A4A4A4]' />
          )}
        </div>
        <div className='flex flex-col min-w-0 flex-1'>
          <span className='text-[#A4A4A4] text-xs'>{t('mapPickTitle')}</span>
          <span className='text-[#111111] font-medium text-sm truncate'>
            {coords ? t('mapPickHintSelected') : t('mapPickHintEmpty')}
          </span>
        </div>
      </button>

      {insideFreeZone !== null && (
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
            insideFreeZone
              ? 'bg-green-50 text-green-700'
              : 'bg-amber-50 text-amber-800'
          }`}
        >
          {insideFreeZone ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              <span>{t('zoneFree')}</span>
            </>
          ) : (
            <>
              <MapPin size={14} strokeWidth={2.5} />
              <span>
                {deliveryFixedFee > 0
                  ? t('zonePaidFee', { amount: deliveryFixedFee })
                  : t('zonePaid')}
              </span>
            </>
          )}
        </div>
      )}

      {/* Улица */}
      <label className='bg-[#F5F5F5] flex flex-col rounded-xl py-2 px-4 focus-within:ring-1 focus-within:ring-brand/20 transition-all'>
        <span className='text-[#A4A4A4] text-xs mb-0.5'>
          {t('streetLabel')}
        </span>
        <input
          type='text'
          value={street}
          onChange={(e) => editingResetsPick(setStreet)(e.target.value)}
          className='bg-transparent outline-none text-[#111111] font-medium placeholder-gray-400 w-full'
          placeholder={t('streetPlaceholder')}
        />
      </label>

      {/* Доп поля */}
      <div className='grid grid-cols-3 gap-2'>
        <label className='bg-[#F5F5F5] flex flex-col rounded-xl py-2 px-3 focus-within:ring-1 focus-within:ring-brand/20'>
          <span className='text-[#A4A4A4] text-[10px] mb-0.5'>
            {t('entranceLabel')}
          </span>
          <input
            type='text'
            value={entrance}
            onChange={(e) => editingResetsPick(setEntrance)(e.target.value)}
            className='bg-transparent outline-none text-[#111111] w-full text-sm font-medium'
          />
        </label>
        <label className='bg-[#F5F5F5] flex flex-col rounded-xl py-2 px-3 focus-within:ring-1 focus-within:ring-brand/20'>
          <span className='text-[#A4A4A4] text-[10px] mb-0.5'>
            {t('floorLabel')}
          </span>
          <input
            type='text'
            value={floor}
            onChange={(e) => editingResetsPick(setFloor)(e.target.value)}
            className='bg-transparent outline-none text-[#111111] w-full text-sm font-medium'
          />
        </label>
        <label className='bg-[#F5F5F5] flex flex-col rounded-xl py-2 px-3 focus-within:ring-1 focus-within:ring-brand/20'>
          <span className='text-[#A4A4A4] text-[10px] mb-0.5'>
            {t('aptLabel')}
          </span>
          <input
            type='text'
            value={apt}
            onChange={(e) => editingResetsPick(setApt)(e.target.value)}
            className='bg-transparent outline-none text-[#111111] w-full text-sm font-medium'
          />
        </label>
      </div>

      {showSaveBlock && (
        <div className='bg-[#F5F5F5] rounded-xl py-2 px-3 flex flex-col gap-2'>
          <label className='flex items-center justify-between gap-2'>
            <span className='flex items-center gap-2 text-[13px] text-[#111111]'>
              <BookmarkPlus size={16} className='text-brand' />
              {t('saveToggle')}
            </span>
            <input
              type='checkbox'
              checked={saveOn}
              onChange={(e) => setSaveOn(e.target.checked)}
              className='w-5 h-5 accent-brand'
            />
          </label>
          {saveOn && (
            <input
              type='text'
              value={saveLabel}
              onChange={(e) => setSaveLabel(e.target.value)}
              maxLength={32}
              placeholder={t('saveLabelPlaceholder')}
              className='h-10 px-3 rounded-lg bg-white text-sm text-[#111111] outline-none focus:ring-2 focus:ring-brand/20'
            />
          )}
        </div>
      )}

      <DeliveryMapModal
        open={mapOpen}
        initialCoords={coords}
        venueCoords={venueCoords}
        freeDeliveryRadiusKm={freeDeliveryRadiusKm}
        deliveryFixedFee={deliveryFixedFee}
        onClose={() => setMapOpen(false)}
        onConfirm={handleMapConfirm}
      />
    </div>
  );
}
