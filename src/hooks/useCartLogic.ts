import { useEffect, useState } from 'react';
import { useBasketStore } from '@/store/basket';
import { useVenueStore } from '@/store/venue';
import { useCheckout } from '@/store/checkout';
import { useMounted } from '@/hooks/useMounted';
import { distanceKm } from '@/lib/osm-maps';
import { canVenueDeliver, getDeliveryGeo } from '@/lib/delivery';

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
  const spotId = useVenueStore((state) => state.spotId);
  const deliveryLat = useCheckout((s) => s.deliveryLat);
  const deliveryLng = useCheckout((s) => s.deliveryLng);

  // 2. Локальный стейт для переключателя (Доставка/С собой)
  const [userSelectedType, setUserSelectedType] = useState<'takeout' | 'delivery'>('takeout');

  // Гейтинг сервис-режимов по venue-флагам (контракт Kuma 2026-05-12).
  // Если backend сказал, что режим недоступен — UI не даёт его выбрать.
  // Поле опциональное: отсутствует у старого бэка → считаем доступным (true).
  const canDeliver = canVenueDeliver(venue, spotId);
  const canTakeout = venue?.isTakeoutAvailable !== false;
  const canDinein = venue?.isDineinAvailable !== false;

  useEffect(() => {
    if (userSelectedType === 'delivery' && !canDeliver) {
      // Если takeout доступен — на него; иначе остаёмся в delivery, но calculate-баннер всё объяснит.
      if (canTakeout) setUserSelectedType('takeout');
    } else if (userSelectedType === 'takeout' && !canTakeout && canDeliver) {
      setUserSelectedType('delivery');
    }
  }, [canDeliver, canTakeout, userSelectedType]);

  // 3. 🔥 ВЫЧИСЛЯЕМ РЕАЛЬНЫЙ ТИП ЗАКАЗА
  // Если есть стол — то ВСЕГДА 'dinein'. Если нет — то что выбрал юзер.
  const orderType: 'takeout' | 'delivery' | 'dinein' = tableNumber
    ? 'dinein'
    : userSelectedType;

  let deliveryPrice = 0;
  let isFreeDelivery = false;
  let isInsideFreeZone = false;
  let hasDeliveryAddress = false;

  // Логика доставки считается только если реальный тип == delivery
  if (orderType === 'delivery' && venue) {
    const fixedFee = parseFloat(venue.deliveryFixedFee || '0');
    const freeFrom = venue.deliveryFreeFrom
      ? parseFloat(venue.deliveryFreeFrom)
      : null;

    // Геометрия доставки: предпочитаем spot-level, fallback на venue-level (legacy).
    const { venueCoords, freeRadiusKm } = getDeliveryGeo(venue, spotId);
    const userCoords =
      deliveryLat != null && deliveryLng != null
        ? { lat: deliveryLat, lng: deliveryLng }
        : null;
    hasDeliveryAddress = !!userCoords;
    isInsideFreeZone =
      !!venueCoords && !!userCoords && freeRadiusKm > 0
        ? distanceKm(venueCoords, userCoords) <= freeRadiusKm
        : false;

    const meetsThreshold = freeFrom !== null && totalPrice >= freeFrom;

    if (isInsideFreeZone || meetsThreshold) {
      deliveryPrice = 0;
      isFreeDelivery = true;
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
    isFreeDelivery: mounted ? isFreeDelivery : false,
    isInsideFreeZone: mounted ? isInsideFreeZone : false,
    hasDeliveryAddress: mounted ? hasDeliveryAddress : false,
    canDeliver,
    canTakeout,
    canDinein,
  };
}