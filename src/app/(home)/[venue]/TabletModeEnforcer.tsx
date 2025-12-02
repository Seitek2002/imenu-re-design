'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isTabletRoutePath } from '@/lib/utils/slug';
import { useCheckout } from '@/store/checkout';

export default function TabletModeEnforcer() {
  const pathname = usePathname();
  const isTabletRoute = isTabletRoutePath(pathname);

  const setOrderType = useCheckout((s) => s.setOrderType);
  const setPhone = useCheckout((s) => s.setPhone);
  const setAddress = useCheckout((s) => s.setAddress);
  const setPickupMode = useCheckout((s) => s.setPickupMode);
  const setPickupTime = useCheckout((s) => s.setPickupTime);

  useEffect(() => {
    if (!isTabletRoute) return;
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
  }, [isTabletRoute, setOrderType, setPhone, setAddress, setPickupMode, setPickupTime]);

  return null;
}
