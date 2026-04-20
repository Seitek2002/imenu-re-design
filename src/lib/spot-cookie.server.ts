import 'server-only';
import { cookies } from 'next/headers';
import { SPOT_COOKIE, parseSpotCookie } from './spot-cookie';

export async function readSpotCookie(venueSlug: string): Promise<number | null> {
  const store = await cookies();
  return parseSpotCookie(store.get(SPOT_COOKIE)?.value, venueSlug);
}
