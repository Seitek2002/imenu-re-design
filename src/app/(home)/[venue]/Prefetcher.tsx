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
    const targets = [PAGES.BASKET(base), PAGES.FOODS(base)].filter(Boolean);

    let idleId: any = null;
    let rafIds: number[] = [];
    let timeoutId: any = null;

    const prefetchChunked = () => {
      // Prefetch по одному на кадр, чтобы не блокировать основной поток
      let i = 0;
      const step = () => {
        try {
          if (i < targets.length) {
            const href = targets[i++];
            if (href) router.prefetch(href);
            const id = requestAnimationFrame(step);
            rafIds.push(id);
          }
        } catch {}
      };
      const id = requestAnimationFrame(step);
      rafIds.push(id);
    };

    if ((window as any).requestIdleCallback) {
      idleId = (window as any).requestIdleCallback(
        () => {
          try {
            prefetchChunked();
          } catch {}
        },
        { timeout: 3000 }
      );
    } else if (typeof requestAnimationFrame === 'function') {
      // Fallback без setTimeout: распределяем работу по нескольким кадрам
      prefetchChunked();
    } else {
      // Самый последний вариант — отложенный setTimeout
      timeoutId = setTimeout(() => {
        try {
          targets.forEach((href) => href && router.prefetch(href));
        } catch {}
      }, 1500);
    }

    return () => {
      try {
        if ((window as any).cancelIdleCallback && idleId) {
          (window as any).cancelIdleCallback(idleId);
        }
      } catch {}
      try {
        rafIds.forEach((id) => cancelAnimationFrame(id));
      } catch {}
      try {
        if (timeoutId) clearTimeout(timeoutId);
      } catch {}
    };
  }, [router, venue]);

  return null;
}
