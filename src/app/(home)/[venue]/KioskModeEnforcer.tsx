'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isKioskRoutePath } from '@/lib/utils/slug';
import { useCheckout } from '@/store/checkout';

/**
 * Enforce kiosk mode when path matches "/[venue]/d":
 * - Force orderType = 'takeout'
 * - Clear address and phone-sensitive fields
 * - Reset pickup mode/time
 */
export default function KioskModeEnforcer() {
  const pathname = usePathname();
  const isKiosk = isKioskRoutePath(pathname);

  const setOrderType = useCheckout((s) => s.setOrderType);
  const setPhone = useCheckout((s) => s.setPhone);
  const setAddress = useCheckout((s) => s.setAddress);
  const setPickupMode = useCheckout((s) => s.setPickupMode);
  const setPickupTime = useCheckout((s) => s.setPickupTime);

  useEffect(() => {
    if (!isKiosk) return;
    try {
      setOrderType('takeout');
      setPhone('+996');
      setAddress('');
      setPickupMode('asap');
      setPickupTime(null);
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('address');
        } catch {}
      }
    } catch {}
  }, [
    isKiosk,
    setOrderType,
    setPhone,
    setAddress,
    setPickupMode,
    setPickupTime,
  ]);

  // Persist kiosk flag in storage for other parts of the app/integrations
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('kioskMode', isKiosk ? '1' : '0');
      sessionStorage.setItem('kioskMode', isKiosk ? '1' : '0');
    } catch {}
  }, [isKiosk]);

  return null;
}
