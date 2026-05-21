import type { Modificator, Product } from '@/types/api';

/**
 * Цена плоского модификатора (варианта) на конкретной точке.
 *
 * Бэк (2026-05-21) считает цену заказа по точке. Чтобы витрина показывала ту
 * же цену, что спишется, берём её из spotAvailabilities. С `?spotId=` бэк
 * отдаёт ровно одну запись (запрошенная точка), но на всякий случай ищем по
 * spot.id. Fallback на базовую `m.price`, если записи нет (старый ответ или
 * вариант теоретически недоступен на точке).
 */
export function variantPrice(
  m: Pick<Modificator, 'price' | 'spotAvailabilities'>,
  spotId: number | null | undefined,
): number {
  const avail = m.spotAvailabilities;
  if (avail && avail.length > 0) {
    if (spotId != null) {
      const match = avail.find((s) => s.spot.id === spotId);
      if (match) return match.price;
    }
    // Без spotId (или нет совпадения) — компакт уже отдал нужную точку первой.
    return avail[0].price;
  }
  return m.price;
}

/**
 * Подпись цены для карточки товара. Предпочитает priceFrom/priceTo (по видимым
 * на точке вариантам), считая «от X», если диапазон не схлопнут. Возвращает
 * null, если бэк ещё не прислал priceFrom — вызывающий код берёт свой фолбэк.
 */
export function productPriceLabel(
  p: Pick<Product, 'priceFrom' | 'priceTo'>,
): { price: number; isFrom: boolean } | null {
  if (p.priceFrom == null) return null;
  return { price: p.priceFrom, isFrom: p.priceTo != null && p.priceTo !== p.priceFrom };
}
