'use client';

import { useEffect } from 'react';
import { useIsTabletMode } from '@/lib/utils/responsive';
import { useCheckout } from '@/store/checkout';

export default function TabletModeEnforcer() {
  const isTablet = useIsTabletMode();

  const setOrderType = useCheckout((s) => s.setOrderType);
  const setPhone = useCheckout((s) => s.setPhone);
  const setAddress = useCheckout((s) => s.setAddress);
  const setPickupMode = useCheckout((s) => s.setPickupMode);
  const setPickupTime = useCheckout((s) => s.setPickupTime);

  useEffect(() => {
    if (!isTablet) return;
    // В режиме планшета форсим dine-in и очищаем чувствительные поля
    try {
      setOrderType('dinein');
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
  }, [isTablet, setOrderType, setPhone, setAddress, setPickupMode, setPickupTime]);

  return null;
}
