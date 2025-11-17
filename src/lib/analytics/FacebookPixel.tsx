'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function FacebookPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (window?.fbq) window.fbq('track', 'PageView');
  }, [pathname, searchParams.toString()]);

  return null;
}
