import { cookies } from 'next/headers';
import type { MainButtonsResponse } from '@/lib/api/types';

// Simple server-side fetch for main buttons
export async function getMainButtons(venueSlug: string): Promise<MainButtonsResponse> {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'ru';
  const url = `https://imenu.kg/api/v2/main-buttons/?venueSlug=${encodeURIComponent(venueSlug)}`;

  const res = await fetch(url, {
    headers: { 'Accept-Language': lang },
    // Revalidate periodically; tune as needed
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  }
  return (await res.json()) as MainButtonsResponse;
}
