import type { Venue, VenueSpot } from '@/store/venue';

/**
 * Выбирает spot, который реально будет использоваться при доставке.
 * Контракт Kuma 2026-05-12:
 *  - если spot выбран явно → берём его (даже если у него isDeliveryAvailable=false — гейтинг ниже по стеку);
 *  - иначе пробуем `venue.defaultDeliverySpot`;
 *  - иначе первый spot с isDeliveryAvailable !== false.
 */
export function pickDeliverySpot(
  venue: Venue | null | undefined,
  selectedSpotId?: number | null,
): VenueSpot | null {
  if (!venue) return null;
  const spots = venue.spots ?? [];
  if (selectedSpotId != null) {
    const explicit = spots.find((s) => s.id === selectedSpotId);
    if (explicit) return explicit;
  }
  if (venue.defaultDeliverySpot != null) {
    const def = spots.find((s) => s.id === venue.defaultDeliverySpot);
    if (def) return def;
  }
  return (
    spots.find((s) => s.isDeliveryAvailable !== false) ?? spots[0] ?? null
  );
}

/** Доступна ли вообще доставка: учитывает и venue, и spot. */
export function canVenueDeliver(
  venue: Venue | null | undefined,
  selectedSpotId?: number | null,
): boolean {
  if (!venue || venue.isDeliveryAvailable === false) return false;
  const spot = pickDeliverySpot(venue, selectedSpotId);
  // Если фронт получил spot без поля (старый бэк) — считаем доступным.
  return !spot || spot.isDeliveryAvailable !== false;
}

/**
 * Геометрия доставки (координаты заведения + freeRadiusKm).
 * Контракт говорит "per-spot", но venue-level latitude/longitude/freeDeliveryRadiusKm
 * пока сохраняются как fallback, чтобы старый бэк не сломал зону.
 */
export function getDeliveryGeo(
  venue: Venue | null | undefined,
  selectedSpotId?: number | null,
): {
  venueCoords: { lat: number; lng: number } | null;
  freeRadiusKm: number;
} {
  if (!venue) return { venueCoords: null, freeRadiusKm: 0 };
  const spot = pickDeliverySpot(venue, selectedSpotId);

  const spotLat = spot?.latitude != null ? parseFloat(spot.latitude) : null;
  const spotLng = spot?.longitude != null ? parseFloat(spot.longitude) : null;

  const lat =
    spotLat != null && Number.isFinite(spotLat)
      ? spotLat
      : venue.latitude != null
        ? Number(venue.latitude)
        : null;
  const lng =
    spotLng != null && Number.isFinite(spotLng)
      ? spotLng
      : venue.longitude != null
        ? Number(venue.longitude)
        : null;

  const venueCoords =
    lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)
      ? { lat, lng }
      : null;

  const spotRadius =
    spot?.freeDeliveryRadiusKm != null
      ? parseFloat(spot.freeDeliveryRadiusKm)
      : NaN;
  const venueRadius = venue.freeDeliveryRadiusKm
    ? parseFloat(venue.freeDeliveryRadiusKm)
    : 0;
  const freeRadiusKm = Number.isFinite(spotRadius) ? spotRadius : venueRadius;

  return { venueCoords, freeRadiusKm: freeRadiusKm > 0 ? freeRadiusKm : 0 };
}
