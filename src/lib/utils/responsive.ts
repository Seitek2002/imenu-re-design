/* Responsive utilities for viewport-based feature flags (tablet mode, etc.) */
'use client';

import { useEffect, useState } from 'react';

export const TABLET_MIN_WIDTH = 768; // smallest common tablet width in CSS pixels

export function isTabletViewport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.innerWidth >= TABLET_MIN_WIDTH;
  } catch {
    return false;
  }
}

/**
 * React hook to track if current viewport is considered a tablet (or larger).
 * Uses a resize listener; debounced naturally by the browser event rate.
 */
export function useIsTabletMode(): boolean {
  const [isTablet, setIsTablet] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isTabletViewport();
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onResize = () => {
      setIsTablet(isTabletViewport());
    };

    window.addEventListener('resize', onResize);
    // Also run once on mount to sync in case initial state was SSR/mismatch
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isTablet;
}
