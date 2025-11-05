import { useEffect, useMemo, useState } from 'react';
import { useBasket } from '@/store/basket';
import { useVenueQuery } from '@/store/venue';
import { calcDeliveryFee, calcServiceFee } from '@/lib/utils/pricing';
import type { OrderType } from '@/lib/utils/pricing';
import { useCheckout } from '@/store/checkout';

export function useBasketTotals(orderTypeOverride?: OrderType) {
  const itemsMap = useBasket((s) => s.items);
  const { venue } = useVenueQuery();
  const orderTypeFromStore = useCheckout((s) => s.orderType);

  const orderType = orderTypeOverride ?? orderTypeFromStore;

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const itemCount = useMemo(
    () => Object.values(itemsMap).reduce((acc, it) => acc + it.quantity, 0),
    [itemsMap]
  );

  const subtotal = useMemo(
    () =>
      Object.values(itemsMap).reduce(
        (acc, it) => acc + it.unitPrice * it.quantity,
        0
      ),
    [itemsMap]
  );

  const deliveryFee = useMemo(
    () => calcDeliveryFee({ venue, subtotal, orderType }),
    [venue, subtotal, orderType]
  );

  const { percent: serviceFeePercent, amount: serviceFee } = useMemo(
    () => calcServiceFee({ venue, subtotal, orderType }),
    [venue, subtotal, orderType]
  );

  const total = useMemo(
    () => subtotal + deliveryFee + serviceFee,
    [subtotal, deliveryFee, serviceFee]
  );

  return {
    orderType,
    hydrated,
    itemCount,
    subtotal,
    serviceFeePercent,
    serviceFee,
    deliveryFee,
    total,
  };
}
