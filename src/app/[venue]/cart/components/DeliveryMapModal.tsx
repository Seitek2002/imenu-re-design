'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Search, X, Navigation, Check } from 'lucide-react';

import {
  BISHKEK_CENTER,
  Coords,
  forwardGeocode,
  getYandexKey,
  loadYmaps,
  reverseGeocode,
} from '@/lib/yandex-maps';

interface Props {
  open: boolean;
  initialCoords: Coords | null;
  onClose: () => void;
  onConfirm: (coords: Coords, address: string) => void;
}

type GeocodeSuggestion = {
  id: string;
  title: string;
  coords: Coords;
};

const DeliveryMapModal: FC<Props> = ({
  open,
  initialCoords,
  onClose,
  onConfirm,
}) => {
  const t = useTranslations('Cart.deliveryMap');
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  const [coords, setCoords] = useState<Coords>(
    initialCoords ?? BISHKEK_CENTER,
  );
  const [address, setAddress] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const key = getYandexKey();
  const reverseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleReverse = useCallback((c: Coords) => {
    if (reverseTimer.current) clearTimeout(reverseTimer.current);
    reverseTimer.current = setTimeout(() => {
      reverseGeocode(c)
        .then((addr) => {
          if (addr) setAddress(addr);
        })
        .catch(() => {
          // ignored — already logged inside helper
        });
    }, 300);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!key) {
      setMapError(t('keyMissing'));
      return;
    }
    if (!containerRef.current) return;

    let destroyed = false;

    loadYmaps()
      .then((ymaps3) => {
        if (destroyed || !containerRef.current) return;

        const start = initialCoords ?? BISHKEK_CENTER;

        const map = new ymaps3.YMap(containerRef.current, {
          location: { center: [start.lng, start.lat], zoom: 15 },
        });
        map.addChild(new ymaps3.YMapDefaultSchemeLayer());
        map.addChild(new ymaps3.YMapDefaultFeaturesLayer());

        const listener = new ymaps3.YMapListener({
          layer: 'any',
          onActionEnd: () => {
            const center = map.center; // [lng, lat]
            if (!center) return;
            const next: Coords = { lat: center[1], lng: center[0] };
            setCoords(next);
            scheduleReverse(next);
          },
        });
        map.addChild(listener);

        mapRef.current = map;
        setCoords(start);
        setMapReady(true);
        scheduleReverse(start);
      })
      .catch((err) => {
        console.error('[Yandex Maps] failed to initialize:', err);
        setMapError(t('keyMissing'));
      });

    return () => {
      destroyed = true;
      if (reverseTimer.current) clearTimeout(reverseTimer.current);
      if (mapRef.current) {
        try {
          mapRef.current.destroy();
        } catch {
          // ignore
        }
        mapRef.current = null;
      }
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const id = setTimeout(async () => {
      const items = await forwardGeocode(query);
      setSuggestions(items);
      setSearchLoading(false);
    }, 350);
    return () => clearTimeout(id);
  }, [query]);

  const flyTo = useCallback((c: Coords) => {
    const map = mapRef.current;
    if (!map) return;
    map.update({ location: { center: [c.lng, c.lat], zoom: 17, duration: 400 } });
  }, []);

  const handleSuggestionPick = (s: GeocodeSuggestion) => {
    setCoords(s.coords);
    setAddress(s.title);
    setQuery('');
    setSuggestions([]);
    setSearchOpen(false);
    flyTo(s.coords);
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert(t('geoError'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: Coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        flyTo(c);
      },
      () => alert(t('geoError')),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleConfirm = () => {
    onConfirm(coords, address);
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
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder={t('searchPlaceholder')}
            className='bg-transparent outline-none flex-1 text-[#111111] text-sm font-medium placeholder-gray-400'
          />
          {query && (
            <button
              type='button'
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
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
              <div className='px-4 py-3 text-sm text-[#A4A4A4]'>
                {t('searchEmpty')}
              </div>
            )}
            {suggestions.map((s) => (
              <button
                key={s.id}
                type='button'
                onClick={() => handleSuggestionPick(s)}
                className='w-full text-left px-4 py-3 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-50 last:border-b-0'
              >
                <span className='text-sm text-[#111111] font-medium'>
                  {s.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className='relative flex-1 overflow-hidden'>
        <div ref={containerRef} className='absolute inset-0 bg-gray-100' />

        {mapError && (
          <div className='absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-[#A4A4A4] bg-white'>
            {mapError}
          </div>
        )}

        {mapReady && (
          <div className='pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full'>
            <MapPin
              size={42}
              className='text-brand drop-shadow-lg'
              fill='currentColor'
              strokeWidth={1.5}
            />
          </div>
        )}

        {mapReady && (
          <button
            type='button'
            onClick={handleMyLocation}
            className='absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center active:bg-gray-100 z-10'
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
          onClick={handleConfirm}
          disabled={!mapReady || !!mapError}
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
