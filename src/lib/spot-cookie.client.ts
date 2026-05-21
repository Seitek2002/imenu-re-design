'use client';

import {
  SPOT_COOKIE,
  SPOT_COOKIE_MAX_AGE,
  parseSpotCookie,
  serializeSpotCookie,
} from './spot-cookie';

/**
 * Читает spot-куку на клиенте. Нужен, чтобы гидратировать `spotId` в стор при
 * deep-link/новой вкладке (sessionStorage пуст, но кука с прошлого выбора жива),
 * иначе клиентские цены разойдутся с SSR.
 */
export function readSpotCookieClient(venueSlug: string): number | null {
  if (typeof document === 'undefined') return null;
  const raw = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${SPOT_COOKIE}=`))
    ?.slice(SPOT_COOKIE.length + 1);
  return parseSpotCookie(raw, venueSlug);
}

export function writeSpotCookie(venueSlug: string, spotId: number): void {
  const value = serializeSpotCookie(venueSlug, spotId);
  document.cookie = `${SPOT_COOKIE}=${value}; path=/; max-age=${SPOT_COOKIE_MAX_AGE}; samesite=lax`;
}

export function clearSpotCookie(): void {
  document.cookie = `${SPOT_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
