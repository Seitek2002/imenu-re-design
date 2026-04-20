export const SPOT_COOKIE = 'imenu_spot';
export const SPOT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 дней

export function parseSpotCookie(
  raw: string | undefined,
  venueSlug: string,
): number | null {
  if (!raw) return null;
  const [slug, idStr] = raw.split(':');
  if (slug !== venueSlug) return null;
  const id = Number(idStr);
  return Number.isFinite(id) ? id : null;
}

export function serializeSpotCookie(venueSlug: string, spotId: number): string {
  return `${venueSlug}:${spotId}`;
}
