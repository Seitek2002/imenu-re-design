'use client';

import { useEffect } from 'react';
import { useVenueQuery } from '@/store/venue';

/**
 * Applies brand color to CSS variables and persists it in localStorage.
 * Priority: venue.colorTheme -> localStorage('brandColor') -> fallback (#875AFF)
 * Exposes:
 *  - --brand: hex color
 *  - --brand-rgb: "r,g,b"
 */
export default function ThemeColor() {
  const { venue } = useVenueQuery();

  useEffect(() => {
    const root = document.documentElement;
    const fallback = '#875AFF';

    const ensureHex = (c?: string) => {
      if (!c || typeof c !== 'string') return '';
      const v = c.trim();
      // Only accept forms like #RGB or #RRGGBB
      if (/^#[0-9a-fA-F]{3,6}$/.test(v)) return v.length === 4
        ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`
        : v.slice(0, 7);
      return '';
    };

    const toRgb = (c: string) => {
      const v = c.replace('#', '');
      const r = parseInt(v.substring(0, 2), 16);
      const g = parseInt(v.substring(2, 4), 16);
      const b = parseInt(v.substring(4, 6), 16);
      if ([r, g, b].some((n) => Number.isNaN(n))) return '135,90,255'; // fallback rgb
      return `${r},${g},${b}`;
    };

    let preferred = (venue as any)?.colorTheme as string | undefined;
    let saved = '';
    try {
      saved = localStorage.getItem('brandColor') || '';
    } catch {}

    const chosen =
      ensureHex(preferred) ||
      ensureHex(saved) ||
      fallback;

    const rgb = toRgb(chosen);

    root.style.setProperty('--brand', chosen);
    root.style.setProperty('--brand-rgb', rgb);

    // Persist chosen (normalized) color for subsequent visits
    try {
      localStorage.setItem('brandColor', chosen);
    } catch {}
  }, [(venue as any)?.colorTheme]);

  return null;
}
