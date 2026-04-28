'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Search, X, Navigation, Check } from 'lucide-react';
import dynamic from 'next/dynamic';

import {
  BISHKEK_CENTER,
  Coords,
  forwardGeocode,
  reverseGeocode,
} from '@/lib/osm-maps';

// Leaflet must not be rendered on the server
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false });

interface Props {
  open: boolean;
  initialCoords: Coords | null;
  onClose: () => void;
  onConfirm: (coords: Coords, address: string) => void;
}

type GeocodeSuggestion = { id: string; title: string; coords: Coords };

const DeliveryMapModal: FC<Props> = ({
  open,
  initialCoords,
  onClose,
  onConfirm,
}) => {
  const t = useTranslations('Cart.deliveryMap');

  const [coords, setCoords] = useState<Coords>(
    initialCoords ?? BISHKEK_CENTER,
  );
  const [address, setAddress] = useState('');
  const [mapReady, setMapReady] = useState(false);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const reverseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // flyTo is provided by LeafletMap via ref callback
  const flyToRef = useRef<((c: Coords) => void) | null>(null);

  const scheduleReverse = useCallback((c: Coords) => {
    if (reverseTimer.current) clearTimeout(reverseTimer.current);
    reverseTimer.current = setTimeout(() => {
      reverseGeocode(c)
        .then((addr) => { if (addr) setAddress(addr); })
        .catch(() => {});
    }, 300);
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (!open) return;
    const start = initialCoords ?? BISHKEK_CENTER;
    setCoords(start);
    setAddress('');
    setMapReady(false);
    scheduleReverse(start);
    return () => {
      if (reverseTimer.current) clearTimeout(reverseTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Forward geocode debounce
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); setSearchLoading(false); return; }
    setSearchLoading(true);
    const id = setTimeout(async () => {
      const items = await forwardGeocode(query);
      setSuggestions(items);
      setSearchLoading(false);
    }, 500);
    return () => clearTimeout(id);
  }, [query]);

  const handleMoveEnd = useCallback((c: Coords) => {
    setCoords(c);
    scheduleReverse(c);
  }, [scheduleReverse]);

  const handleSuggestionPick = (s: GeocodeSuggestion) => {
    setCoords(s.coords);
    setAddress(s.title);
    setQuery('');
    setSuggestions([]);
    setSearchOpen(false);
    flyToRef.current?.(s.coords);
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) { alert(t('geoError')); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: Coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        flyToRef.current?.(c);
      },
      () => alert(t('geoError')),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-[110] bg-white flex flex-col'>
      {/* Header */}
      <div className='flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0'>
        <button
          type='button'
          onClick={onClose}
          className='w-9 h-9 flex items-center justify-center rounded-full active:bg-gray-100'
          aria-label={t('close')}
        >
          <X size={22} />
        </button>
        <h2 className='text-[#111111] font-semibold text-base truncate'>
          {t('title')}
        </h2>
      </div>

      {/* Search */}
      <div className='relative px-4 py-2 shrink-0'>
        <label className='bg-[#F5F5F5] flex items-center gap-2 rounded-xl py-2 px-3'>
          <Search size={18} className='text-[#A4A4A4] shrink-0' />
          <input
            type='text'
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            placeholder={t('searchPlaceholder')}
            className='bg-transparent outline-none flex-1 text-[#111111] text-sm font-medium placeholder-gray-400'
          />
          {query && (
            <button
              type='button'
              onClick={() => { setQuery(''); setSuggestions([]); }}
              className='text-[#A4A4A4] px-1'
              aria-label={t('close')}
            >
              <X size={16} />
            </button>
          )}
        </label>

        {searchOpen && query.trim() && (
          <div className='absolute left-4 right-4 top-full mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-64 overflow-y-auto z-10'>
            {searchLoading && (
              <div className='px-4 py-3 text-sm text-[#A4A4A4]'>…</div>
            )}
            {!searchLoading && suggestions.length === 0 && (
              <div className='px-4 py-3 text-sm text-[#A4A4A4]'>{t('searchEmpty')}</div>
            )}
            {suggestions.map((s) => (
              <button
                key={s.id}
                type='button'
                onClick={() => handleSuggestionPick(s)}
                className='w-full text-left px-4 py-3 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-50 last:border-b-0'
              >
                <span className='text-sm text-[#111111] font-medium'>{s.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className='relative flex-1 overflow-hidden'>
        <LeafletMap
          initialCoords={initialCoords ?? BISHKEK_CENTER}
          onMoveEnd={handleMoveEnd}
          onReady={() => setMapReady(true)}
          flyToRef={flyToRef}
        />

        {/* Centre pin — pointer-events-none so map stays interactive */}
        <div className='pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full z-[400]'>
          <MapPin size={42} className='text-red-500 drop-shadow-lg' fill='currentColor' strokeWidth={1.5} />
        </div>

        {mapReady && (
          <button
            type='button'
            onClick={handleMyLocation}
            className='absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center active:bg-gray-100 z-[400]'
            aria-label={t('myLocation')}
          >
            <Navigation size={20} className='text-[#111111]' />
          </button>
        )}
      </div>

      {/* Footer */}
      <div className='shrink-0 border-t border-gray-100 bg-white px-4 pt-3 pb-6'>
        <div className='flex items-start gap-2 mb-3 min-h-[40px]'>
          <MapPin size={18} className='text-brand shrink-0 mt-0.5' />
          <div className='flex-1 text-sm text-[#111111] font-medium break-words'>
            {address || t('hint')}
          </div>
        </div>
        <button
          type='button'
          onClick={() => onConfirm(coords, address)}
          disabled={!mapReady}
          className='w-full h-12 rounded-xl bg-brand text-white font-semibold flex items-center justify-center gap-2 active:opacity-80 disabled:opacity-50'
        >
          <Check size={18} />
          {t('confirm')}
        </button>
      </div>
    </div>
  );
};

export default DeliveryMapModal;
