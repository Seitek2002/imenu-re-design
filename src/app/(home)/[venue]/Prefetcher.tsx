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
    const targets = [
      PAGES.HOME(base),
      PAGES.BASKET(base),
      PAGES.HISTORY(base),
      PAGES.PROFILE(base),
      PAGES.FOODS(base),
    ];
    try {
      targets.forEach((href) => {
        if (href) router.prefetch(href);
      });
    } catch {}
  }, [router, venue]);

  return null;
}
