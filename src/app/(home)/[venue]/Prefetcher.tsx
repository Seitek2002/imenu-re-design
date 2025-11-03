'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PAGES } from '@/config/pages.config';

export default function Prefetcher() {
  const router = useRouter();
  const params = useParams<{ venue?: string }>();
  const venue = params?.venue ?? '';

  useEffect(() => {
    if (!venue) return;
    const base = `/${venue}`;
    // Префетчим только действительно вероятные переходы и в idle
    const targets = [PAGES.BASKET(base), PAGES.FOODS(base)];
    const idleCb =
      (window as any).requestIdleCallback?.(() => {
        try {
          targets.forEach((href) => {
            if (href) router.prefetch(href);
          });
        } catch {}
      }, { timeout: 3000 }) ?? setTimeout(() => {
        try {
          targets.forEach((href) => {
            if (href) router.prefetch(href);
          });
        } catch {}
      }, 1500);

    return () => {
      if ((window as any).cancelIdleCallback && typeof idleCb === 'number' === false) {
        try { (window as any).cancelIdleCallback?.(idleCb); } catch {}
      } else {
        clearTimeout(idleCb as any);
      }
    };
  }, [router, venue]);

  return null;
}
