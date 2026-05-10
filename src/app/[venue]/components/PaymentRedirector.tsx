'use client';

import { useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';

const STORAGE_KEY = 'payment_success';

/**
 * Checks sessionStorage on mount: if a payment_success flag exists,
 * redirects to the order-status page (with the flag intact so the
 * overlay can pick it up there).
 *
 * On prod the payment provider redirects straight to /order-status/{id},
 * so this component is a no-op. On staging/local the redirect lands on
 * /{venueSlug}, and this component forwards the user.
 */
export default function PaymentRedirector() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const venueSlug = params.venue as string;

  useEffect(() => {
    // Skip if we're already on the order-status page
    if (pathname.includes('/order-status/')) return;

    try {
      const orderId = sessionStorage.getItem(STORAGE_KEY);
      if (orderId) {
        // Don't remove the flag — PaymentSuccessOverlay will consume it
        router.replace(`/${venueSlug}/order-status/${orderId}`);
      }
    } catch {
      // SSR / private-browsing guard
    }
  }, [router, venueSlug, pathname]);

  return null;
}
