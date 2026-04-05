'use client';

import { useEffect } from 'react';
import { useActiveOrderStore } from '@/store/active-order'; // Тот стор, что я предлагал на прошлом шаге

export default function OrderSaver({ orderId }: { orderId: string | number }) {
  const setLastOrderId = useActiveOrderStore((state) => state.setLastOrderId);

  useEffect(() => {
    setLastOrderId(orderId);
  }, [orderId, setLastOrderId]);

  return null; // Он ничего не рендерит, только делает работу "под капотом"
}
