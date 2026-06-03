import type { GroupModification, Modificator, Product } from '@/types/api';

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
 * Цена для карточки товара. Бэк (2026-06) гарантирует, что priceFrom уже
 * учитывает обязательные группы — это цена дефолтного варианта. Реконструировать
 * цену из groupModifications больше не нужно. Фолбэк на productPrice, если
 * priceFrom ещё не пришёл (старый ответ). null — цены нет.
 */
export function productPriceLabel(
  p: Pick<Product, 'priceFrom' | 'productPrice'>,
): number | null {
  if (p.priceFrom != null) return p.priceFrom;
  return p.productPrice || null;
}

/**
 * true, если цена товара формируется выбором обязательной платной группы
 * (size-вариант и т.п.). У таких товаров бэк уже включил дефолт этих групп в
 * productPrice/priceFrom, поэтому при расчёте позиции productPrice как базу
 * добавлять НЕЛЬЗЯ (иначе двойной счёт) — берём сумму выбранных item'ов.
 */
export function hasMandatoryPricedGroups(
  groups: GroupModification[] | undefined,
): boolean {
  return (groups ?? []).some(
    (g) => g.selection.min > 0 && g.items.some((i) => Number(i.price) > 0),
  );
}
