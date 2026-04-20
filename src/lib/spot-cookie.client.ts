'use client';

import {
  SPOT_COOKIE,
  SPOT_COOKIE_MAX_AGE,
  serializeSpotCookie,
} from './spot-cookie';

export function writeSpotCookie(venueSlug: string, spotId: number): void {
  const value = serializeSpotCookie(venueSlug, spotId);
  document.cookie = `${SPOT_COOKIE}=${value}; path=/; max-age=${SPOT_COOKIE_MAX_AGE}; samesite=lax`;
}

export function clearSpotCookie(): void {
  document.cookie = `${SPOT_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
