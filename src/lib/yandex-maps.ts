// Yandex Maps JS API v3 loader + HTTP Geocoder helpers.
// Key: NEXT_PUBLIC_YANDEX_MAPS_KEY (must have "JavaScript API и HTTP Геокодер"
// service enabled + HTTP Referer whitelist with localhost:3000 for dev).

export const BISHKEK_CENTER = { lat: 42.8746, lng: 74.5698 };

const BISHKEK_LL = '74.5698,42.8746';
const BISHKEK_SPN = '0.3,0.3';

export type Coords = { lat: number; lng: number };

export function getYandexKey(): string {
  return (
    process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY ||
    '91b83ce4-be66-490b-8c62-c37c06e2e368'
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let loadPromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadYmaps(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Yandex Maps cannot be loaded on the server'));
  }
  const key = getYandexKey();
  if (!key) {
    return Promise.reject(new Error('Yandex Maps key is not configured'));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  if (w.ymaps3?.YMap) return Promise.resolve(w.ymaps3);
  if (loadPromise) return loadPromise;

  const src = `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;

  loadPromise = new Promise((resolve, reject) => {
    const finish = async () => {
      if (!w.ymaps3) {
        reject(new Error('ymaps3 is missing after script load'));
        return;
      }
      try {
        await w.ymaps3.ready;
        resolve(w.ymaps3);
      } catch (err) {
        reject(err);
      }
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      if (w.ymaps3) return finish();
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Yandex Maps load failed')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error('Yandex Maps load failed'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

// --- Geocoder ---

const GEOCODE_URL = 'https://geocode-maps.yandex.ru/1.x/';

type YaGeoObject = {
  name?: string;
  description?: string;
  Point?: { pos: string }; // "lng lat"
  metaDataProperty?: {
    GeocoderMetaData?: {
      text?: string;
      Address?: { formatted?: string };
    };
  };
};

export type GeocodeItem = {
  id: string;
  title: string;
  coords: Coords;
};

function parseItem(obj: YaGeoObject | undefined, idx: number): GeocodeItem | null {
  const pos = obj?.Point?.pos;
  if (!obj || !pos) return null;
  const [lngStr, latStr] = pos.split(' ');
  const lng = Number(lngStr);
  const lat = Number(latStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const title =
    obj.metaDataProperty?.GeocoderMetaData?.text ||
    obj.metaDataProperty?.GeocoderMetaData?.Address?.formatted ||
    [obj.name, obj.description].filter(Boolean).join(', ');
  if (!title) return null;
  return { id: `${idx}`, title, coords: { lat, lng } };
}

async function safeFetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[Yandex Geocoder] fetch failed:', err);
    return null;
  }
}

export async function forwardGeocode(query: string): Promise<GeocodeItem[]> {
  const key = getYandexKey();
  if (!key || !query.trim()) return [];
  const url = new URL(GEOCODE_URL);
  url.searchParams.set('apikey', key);
  url.searchParams.set('format', 'json');
  url.searchParams.set('lang', 'ru_RU');
  url.searchParams.set('geocode', query);
  url.searchParams.set('ll', BISHKEK_LL);
  url.searchParams.set('spn', BISHKEK_SPN);
  url.searchParams.set('rspn', '1');
  url.searchParams.set('results', '8');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await safeFetchJson(url.toString())) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const members: any[] = data?.response?.GeoObjectCollection?.featureMember ?? [];
  return members
    .map((m, i) => parseItem(m?.GeoObject, i))
    .filter((x): x is GeocodeItem => !!x);
}

export async function reverseGeocode({ lat, lng }: Coords): Promise<string> {
  const key = getYandexKey();
  if (!key) return '';
  const url = new URL(GEOCODE_URL);
  url.searchParams.set('apikey', key);
  url.searchParams.set('format', 'json');
  url.searchParams.set('lang', 'ru_RU');
  url.searchParams.set('geocode', `${lng},${lat}`);
  url.searchParams.set('kind', 'house');
  url.searchParams.set('results', '1');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await safeFetchJson(url.toString())) as any;
  const obj: YaGeoObject | undefined =
    data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
  return (
    obj?.metaDataProperty?.GeocoderMetaData?.text ||
    obj?.metaDataProperty?.GeocoderMetaData?.Address?.formatted ||
    obj?.name ||
    ''
  );
}
