'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useVenueStore } from '@/store/venue';
import { useBasketStore } from '@/store/basket';
import { writeSpotCookie } from '@/lib/spot-cookie.client';

export default function SpotPicker() {
  const router = useRouter();
  const t = useTranslations('Spot');
  const venue = useVenueStore((s) => s.data);
  const activeSpotId = useVenueStore((s) => s.spotId);
  const isKioskMode = useVenueStore((s) => s.isKioskMode);
  const tableId = useVenueStore((s) => s.tableId);
  const setContext = useVenueStore((s) => s.setContext);
  const basketCount = useBasketStore((s) => s.getItemCount());
  const clearBasket = useBasketStore((s) => s.clearBasket);

  const [open, setOpen] = useState(false);

  // QR/киоск режим — точка зафиксирована, пикер не показываем.
  if (!venue || isKioskMode || tableId) return null;

  const spots = venue.spots ?? [];
  if (spots.length < 2) return null;

  const activeSpot =
    spots.find((s) => s.id === activeSpotId) ?? spots[0];

  const handlePick = (spotId: number) => {
    if (spotId === activeSpotId) {
      setOpen(false);
      return;
    }
    // Цены/наличие зависят от точки — старая корзина становится невалидной.
    if (basketCount > 0) {
      const ok = window.confirm(t('switchConfirm'));
      if (!ok) {
        setOpen(false);
        return;
      }
      clearBasket();
    }
    setContext({ spotId, venueSlug: venue.slug });
    writeSpotCookie(venue.slug, spotId);
    setOpen(false);
    router.refresh();
  };

  return (
    <div className='mt-3 px-1'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        className='w-full flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm active:scale-[0.99] transition-transform'
      >
        <div className='flex flex-col items-start text-left'>
          <span className='text-[#A4A4A4] text-xs'>{t('pickupFrom')}</span>
          <span className='text-[#111111] font-semibold text-sm truncate'>
            {activeSpot.name}
          </span>
        </div>
        <span
          className={`text-gray-400 text-lg transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <div className='mt-2 bg-white rounded-2xl shadow-sm overflow-hidden animate-fadeIn'>
          {spots.map((spot) => {
            const isActive = spot.id === activeSpot.id;
            return (
              <button
                key={spot.id}
                type='button'
                onClick={() => handlePick(spot.id)}
                className={`w-full flex flex-col items-start text-left px-4 py-3 border-b border-gray-100 last:border-b-0 active:bg-gray-50 ${
                  isActive ? 'bg-[#F5F5F5]' : ''
                }`}
              >
                <span className='text-[#111111] font-semibold text-sm'>
                  {spot.name}
                </span>
                {spot.address && (
                  <span className='text-[#A4A4A4] text-xs mt-0.5'>
                    {spot.address}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
