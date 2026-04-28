'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Check } from 'lucide-react';

import type { Coords } from '@/lib/osm-maps';
import DeliveryMapModal from './DeliveryMapModal';
import { useVenueStore } from '@/store/venue';

interface Props {
  onAddressChange: (fullAddress: string) => void;
  onCoordsChange: (coords: Coords | null) => void;
  initialCoords?: Coords | null;
  initialStreet?: string;
}

export default function DeliveryInputs({
  onAddressChange,
  onCoordsChange,
  initialCoords,
  initialStreet,
}: Props) {
  const t = useTranslations('Cart.address');
  const venue = useVenueStore((s) => s.data);
  const venueCoords =
    venue?.latitude && venue?.longitude
      ? { lat: venue.latitude, lng: venue.longitude }
      : null;
  const deliveryRadiusKm = venue?.deliveryRadiusKm ?? null;

  const [street, setStreet] = useState(initialStreet ?? '');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [apt, setApt] = useState('');
  const [coords, setCoords] = useState<Coords | null>(initialCoords ?? null);
  const [mapOpen, setMapOpen] = useState(false);

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

  const handleMapConfirm = (c: Coords, addr: string) => {
    setCoords(c);
    if (addr) setStreet(addr);
    setMapOpen(false);
  };

  return (
    <div className='flex flex-col gap-2 animate-fadeIn'>
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
          <span className='text-[#A4A4A4] text-[10px] mb-0.5'>
            {t('entranceLabel')}
          </span>
          <input
            type='text'
            value={entrance}
            onChange={(e) => setEntrance(e.target.value)}
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
            onChange={(e) => setFloor(e.target.value)}
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
            onChange={(e) => setApt(e.target.value)}
            className='bg-transparent outline-none text-[#111111] w-full text-sm font-medium'
          />
        </label>
      </div>

      <DeliveryMapModal
        open={mapOpen}
        initialCoords={coords}
        venueCoords={venueCoords}
        deliveryRadiusKm={deliveryRadiusKm}
        onClose={() => setMapOpen(false)}
        onConfirm={handleMapConfirm}
      />
    </div>
  );
}
