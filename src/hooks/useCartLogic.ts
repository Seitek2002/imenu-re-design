import { useState } from 'react';
import { useBasketStore } from '@/store/basket';
import { useVenueStore } from '@/store/venue';
import { useMounted } from '@/hooks/useMounted';

export function useCartLogic() {
  const mounted = useMounted();

  // Достаем данные и методы из стора
  const items = useBasketStore((state) => state.items);
  const incrementItem = useBasketStore((state) => state.incrementItem);
  const decrementItem = useBasketStore((state) => state.decrementItem);
  const removeFromBasket = useBasketStore((state) => state.removeFromBasket);
  const totalPrice = useBasketStore((state) => state.getTotalPrice());
  const venue = useVenueStore((state) => state.data);

  const [orderType, setOrderType] = useState<'takeout' | 'delivery'>('takeout');

  let deliveryPrice = 0;

  if (orderType === 'delivery' && venue) {
    const fixedFee = parseFloat(venue.deliveryFixedFee || '0');
    const freeFrom = venue.deliveryFreeFrom
      ? parseFloat(venue.deliveryFreeFrom)
      : null;

    if (freeFrom !== null && totalPrice >= freeFrom) {
      deliveryPrice = 0;
    } else {
      deliveryPrice = fixedFee;
    }
  }

  const finalTotal = totalPrice + deliveryPrice;

  return {
    items: mounted ? items : [],
    orderType,
    setOrderType,
    handleIncrement: incrementItem,
    handleDecrement: decrementItem,
    handleRemove: removeFromBasket,
    subtotal: mounted ? totalPrice : 0,
    total: mounted ? finalTotal : 0,
    deliveryPrice: mounted ? deliveryPrice : 0,
  };
}
