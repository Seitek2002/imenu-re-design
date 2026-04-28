// OpenStreetMap helpers: Nominatim geocoder (no API key required).
// Rate limit: 1 req/s — debounce calls before invoking forwardGeocode.

export const BISHKEK_CENTER = { lat: 42.8746, lng: 74.5698 };

export type Coords = { lat: number; lng: number };

export type GeocodeItem = {
  id: string;
  title: string;
  coords: Coords;
};

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const HEADERS = { 'Accept-Language': 'ru', 'User-Agent': 'iMenu/1.0' };

type NominatimAddress = {
  road?: string;
  pedestrian?: string;
  residential?: string;  // микрорайон / жилой массив
  neighbourhood?: string;
  quarter?: string;
  suburb?: string;
  city_district?: string;
  house_number?: string;
  city?: string;
  town?: string;
  village?: string;
};

// Formats Nominatim address object into short human-readable string:
// "улица Токтогула, 123, Бишкек"  or  "мкр Восток-5, 8, Бишкек"
function formatAddress(addr: NominatimAddress): string {
  const street =
    addr.road ??
    addr.pedestrian ??
    addr.residential ??
    addr.neighbourhood ??
    addr.quarter ??
    addr.suburb ??
    addr.city_district ??
    '';
  const house = addr.house_number ?? '';
  const city = addr.city ?? addr.town ?? addr.village ?? '';

  return [street, house].filter(Boolean).join(', ');
}

async function safeFetch(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[Nominatim] fetch failed:', err);
    return null;
  }
}

export async function forwardGeocode(query: string): Promise<GeocodeItem[]> {
  if (!query.trim()) return [];
  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('countrycodes', 'kg');
  url.searchParams.set('limit', '8');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('viewbox', '74.4,42.7,74.8,43.0');
  url.searchParams.set('bounded', '0');

  const data = (await safeFetch(url.toString())) as null | Array<{
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address?: NominatimAddress;
  }>;

  if (!Array.isArray(data)) return [];
  return data
    .filter((d) => d.lat && d.lon)
    .map((d) => ({
      id: String(d.place_id),
      title: d.address ? formatAddress(d.address) || d.display_name : d.display_name,
      coords: { lat: Number(d.lat), lng: Number(d.lon) },
    }));
}

export async function reverseGeocode({ lat, lng }: Coords): Promise<string> {
  const url = new URL(`${NOMINATIM}/reverse`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('zoom', '18');
  url.searchParams.set('addressdetails', '1');

  const data = (await safeFetch(url.toString())) as null | {
    display_name?: string;
    address?: NominatimAddress;
  };

  if (!data) return '';
  if (data.address) {
    return formatAddress(data.address) || (data.display_name ?? '');
  }
  return data.display_name ?? '';
}
