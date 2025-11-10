'use client';

import { useEffect } from 'react';
import { useVenueQuery } from '@/store/venue';

/**
 * Sets CSS variables for brand color based on venue.colorTheme with fallback.
 * - --brand: hex color (e.g. #875AFF)
 * - --brand-rgb: "r,g,b" string (e.g. 135,90,255) for rgba(var(--brand-rgb), alpha)
 */
export default function ThemeColor() {
  const { venue } = useVenueQuery();
  const fallback = '#875AFF';
  const hex = (venue as any)?.colorTheme || fallback;

  useEffect(() => {
    const root = document.documentElement;
    const ensureHex = (c: string) => (typeof c === 'string' && c.startsWith('#') ? c : fallback);
    const toRgb = (c: string) => {
      const v = c.replace('#', '');
      const expand = v.length === 3 ? v.split('').map(ch => ch + ch).join('') : v;
      const r = parseInt(expand.substring(0, 2), 16);
      const g = parseInt(expand.substring(2, 4), 16);
      const b = parseInt(expand.substring(4, 6), 16);
      if ([r, g, b].some(n => Number.isNaN(n))) return '135,90,255'; // fallback rgb
      return `${r},${g},${b}`;
    };

    const color = ensureHex(hex) || fallback;
    const rgb = toRgb(color);

    root.style.setProperty('--brand', color);
    root.style.setProperty('--brand-rgb', rgb);
  }, [hex]);

  return null;
}
