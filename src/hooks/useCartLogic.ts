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
  
  // 1. Достаем данные заведения и НОМЕР СТОЛА
  const venue = useVenueStore((state) => state.data);
  const tableNumber = useVenueStore((state) => state.tableNumber);

  // 2. Локальный стейт для переключателя (Доставка/С собой)
  const [userSelectedType, setUserSelectedType] = useState<'takeout' | 'delivery'>('takeout');

  // 3. 🔥 ВЫЧИСЛЯЕМ РЕАЛЬНЫЙ ТИП ЗАКАЗА
  // Если есть стол — то ВСЕГДА 'dinein'. Если нет — то что выбрал юзер.
  const orderType: 'takeout' | 'delivery' | 'dinein' = tableNumber 
    ? 'dinein' 
    : userSelectedType;

  let deliveryPrice = 0;

  // Логика доставки считается только если реальный тип == delivery
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
    orderType, // <-- Теперь сюда уходит правильный тип ('dinein' если есть стол)
    setOrderType: setUserSelectedType, // Сеттер меняет только локальный выбор
    handleIncrement: incrementItem,
    handleDecrement: decrementItem,
    handleRemove: removeFromBasket,
    subtotal: mounted ? totalPrice : 0,
    total: mounted ? finalTotal : 0,
    deliveryPrice: mounted ? deliveryPrice : 0,
  };
}