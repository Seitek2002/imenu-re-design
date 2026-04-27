import type {
  Product,
  Promotion,
  PromotionBonusProductRef,
  PromotionCondition,
  WeekDayShort,
} from '@/types/api';
import type { BasketItem } from '@/store/basket';

const WEEKDAY_BY_INDEX: WeekDayShort[] = [
  'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat',
];

// Venue timezone — Asia/Bishkek. Promo schedule gates (weekday + time-of-day)
// are evaluated in this TZ regardless of the user's device timezone.
const VENUE_TZ_OFFSET_MINUTES = 6 * 60;

function nowInVenueTz(now: Date): Date {
  // Shift the absolute instant by +6h so getUTC* returns venue-local components.
  return new Date(now.getTime() + VENUE_TZ_OFFSET_MINUTES * 60_000);
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function isWithinPeriod(
  nowMinutes: number,
  start: string,
  end: string,
): boolean {
  const s = toMinutes(start);
  const e = toMinutes(end);
  // Same-day range
  if (s <= e) return nowMinutes >= s && nowMinutes <= e;
  // Range crossing midnight (e.g. 22:00 → 02:00)
  return nowMinutes >= s || nowMinutes <= e;
}

export function isPromotionActive(p: Promotion, now: Date = new Date()): boolean {
  // Date window — compared as absolute instants (TZ-agnostic).
  if (p.dateStart) {
    const start = new Date(p.dateStart).getTime();
    if (Number.isNaN(start) || now.getTime() < start) return false;
  }
  if (p.dateEnd) {
    const end = new Date(p.dateEnd).getTime();
    if (!Number.isNaN(end) && now.getTime() > end) return false;
  }

  const venueNow = nowInVenueTz(now);
  // Empty activeWeekDays means "no day restriction" per swagger.
  if (p.schedule.activeWeekDays.length > 0) {
    const weekday = WEEKDAY_BY_INDEX[venueNow.getUTCDay()];
    if (!p.schedule.activeWeekDays.includes(weekday)) return false;
  }

  if (p.schedule.periods.length === 0) return true;
  const nowMinutes = venueNow.getUTCHours() * 60 + venueNow.getUTCMinutes();
  return p.schedule.periods.some((per) => isWithinPeriod(nowMinutes, per.start, per.end));
}

interface ResolvedItem {
  item: BasketItem;
  product: Product | undefined; // catalog lookup result
}

function resolveItems(
  basketItems: BasketItem[],
  productsCatalog: Product[] | undefined,
): ResolvedItem[] {
  const byId = new Map<number, Product>();
  for (const p of productsCatalog ?? []) byId.set(p.id, p);
  return basketItems.map((item) => ({ item, product: byId.get(item.id) }));
}

function itemMatchesCondition(
  resolved: ResolvedItem,
  c: PromotionCondition,
): boolean {
  // 'product_with_modifiers' currently treated like 'product': match by localId
  // against cart product id. BasketItem already carries selected modifiers, so
  // the condition fires on any modifier combination of the same SKU.
  if (c.entityType === 'product' || c.entityType === 'product_with_modifiers') {
    return c.localId != null && resolved.item.id === c.localId;
  }
  if (c.entityType === 'category') {
    if (c.localId == null) return false;
    const cats = resolved.product?.categories ?? [];
    return cats.some((cat) => cat.id === c.localId);
  }
  // 'unknown' — backend couldn't resolve type; skip.
  return false;
}

function involvedItemsForConditions(
  resolved: ResolvedItem[],
  conditions: PromotionCondition[],
): ResolvedItem[] {
  const involved = new Set<ResolvedItem>();
  for (const r of resolved) {
    if (conditions.some((c) => itemMatchesCondition(r, c))) involved.add(r);
  }
  return Array.from(involved);
}

export function matchesConditions(
  p: Promotion,
  basketItems: BasketItem[],
  productsCatalog: Product[] | undefined,
): boolean {
  if (p.conditions.length === 0) return false;
  const resolved = resolveItems(basketItems, productsCatalog);

  // Default to 'or' until backend exposes conditionsRule (Q11). Raw admin data
  // shows all observed production promos use 'or'; defaulting to 'and' would
  // break promos with multiple conditions.
  const rule = p.conditionsRule ?? 'or';

  if (rule === 'or') {
    return p.conditions.some((c) => {
      const totalQty = resolved
        .filter((r) => itemMatchesCondition(r, c))
        .reduce((sum, r) => sum + r.item.quantity, 0);
      return totalQty >= (c.quantity ?? 1);
    });
  }

  // AND
  for (const c of p.conditions) {
    const totalQty = resolved
      .filter((r) => itemMatchesCondition(r, c))
      .reduce((sum, r) => sum + r.item.quantity, 0);
    if (totalQty < (c.quantity ?? 1)) return false;
  }
  return true;
}

export interface AppliedDiscount {
  amount: number;
  involvedItemKeys: string[];
  // For bonus_products: which products in the cart will be granted free
  // (resolved via localId). Empty for other benefit types.
  bonusItems?: { productId: number; quantity: number; unitPrice: number }[];
}

// Per backend (Q8): bonus quantity comes from a single `bonus_products_pcs`
// field which defaults to 1 and is NOT exposed in /v2/promotions/. Hardcoded
// here until/unless backend exposes it.
const BONUS_PRODUCTS_PCS_DEFAULT = 1;

function computeBonusProductsDiscount(
  bonusProducts: PromotionBonusProductRef[],
  conditions: PromotionCondition[],
  resolved: ResolvedItem[],
): AppliedDiscount {
  const empty: AppliedDiscount = { amount: 0, involvedItemKeys: [] };
  const bonusPcs = BONUS_PRODUCTS_PCS_DEFAULT;

  // Track how many of each productId conditions already consumed, so a 1+1 promo
  // on the same SKU requires qty >= condition.quantity + bonusPcs in cart.
  const consumedByConditions = new Map<number, number>();
  for (const c of conditions) {
    const isProductLike =
      c.entityType === 'product' || c.entityType === 'product_with_modifiers';
    if (!isProductLike || c.localId == null) continue;
    consumedByConditions.set(
      c.localId,
      (consumedByConditions.get(c.localId) ?? 0) + (c.quantity ?? 1),
    );
  }

  const cartQtyByProduct = new Map<number, number>();
  const cartItemByProduct = new Map<number, ResolvedItem>();
  for (const r of resolved) {
    cartQtyByProduct.set(
      r.item.id,
      (cartQtyByProduct.get(r.item.id) ?? 0) + r.item.quantity,
    );
    if (!cartItemByProduct.has(r.item.id)) cartItemByProduct.set(r.item.id, r);
  }

  let remaining = bonusPcs;
  let totalDiscount = 0;
  const involvedKeys: string[] = [];
  const bonusItems: NonNullable<AppliedDiscount['bonusItems']> = [];

  for (const bp of bonusProducts) {
    if (remaining <= 0) break;
    const isProductLike =
      bp.entityType === 'product' || bp.entityType === 'product_with_modifiers';
    if (!isProductLike || bp.localId == null) continue;

    const cartItem = cartItemByProduct.get(bp.localId);
    if (!cartItem) continue;

    const total = cartQtyByProduct.get(bp.localId) ?? 0;
    const consumed = consumedByConditions.get(bp.localId) ?? 0;
    const available = Math.max(0, total - consumed);
    const take = Math.min(available, remaining);
    if (take <= 0) continue;

    const unitPrice = cartItem.item.lineUnitPrice;
    totalDiscount += unitPrice * take;
    remaining -= take;
    involvedKeys.push(cartItem.item.key);
    bonusItems.push({ productId: bp.localId, quantity: take, unitPrice });
  }

  if (totalDiscount <= 0) return empty;
  return { amount: totalDiscount, involvedItemKeys: involvedKeys, bonusItems };
}

export function computeDiscount(
  p: Promotion,
  basketItems: BasketItem[],
  productsCatalog: Product[] | undefined,
): AppliedDiscount {
  const empty: AppliedDiscount = { amount: 0, involvedItemKeys: [] };
  const resolved = resolveItems(basketItems, productsCatalog);
  const involved = involvedItemsForConditions(resolved, p.conditions);
  if (involved.length === 0) return empty;

  const involvedTotal = involved.reduce(
    (sum, r) => sum + r.item.lineUnitPrice * r.item.quantity,
    0,
  );
  const involvedKeys = involved.map((r) => r.item.key);

  if (p.benefit.type === 'percent_discount') {
    const pct = p.benefit.discountPercent ?? 0;
    if (pct <= 0) return empty;
    return {
      amount: Math.round((involvedTotal * pct) / 100),
      involvedItemKeys: involvedKeys,
    };
  }

  if (p.benefit.type === 'fixed_discount') {
    const amount = p.benefit.discountAmount ?? 0;
    if (amount <= 0) return empty;
    // Cap at involvedTotal so the discount never exceeds the matched items
    // (mirrors backend behavior when sending to Poster).
    return {
      amount: Math.min(amount, involvedTotal),
      involvedItemKeys: involvedKeys,
    };
  }

  if (p.benefit.type === 'bonus_products') {
    return computeBonusProductsDiscount(
      p.benefit.bonusProducts,
      p.conditions,
      resolved,
    );
  }

  // TODO: fixed_prices — per-item price override; deferred (mostly staff promos).
  return empty;
}

export interface AppliedPromotion {
  promotion: Promotion;
  discount: AppliedDiscount;
}

function productMatchesAnyCondition(
  product: Product,
  conditions: PromotionCondition[],
): boolean {
  return conditions.some((c) => {
    if (c.entityType === 'product' || c.entityType === 'product_with_modifiers') {
      return c.localId != null && product.id === c.localId;
    }
    if (c.entityType === 'category') {
      return (
        c.localId != null &&
        product.categories.some((cat) => cat.id === c.localId)
      );
    }
    return false;
  });
}

/**
 * Returns the first active auto-promo a product participates in,
 * for catalog-level display (badges on product cards). Mirrors the
 * gating logic of pickAppliedPromotion but ignores cart contents.
 */
export function findActivePromotionForProduct(
  product: Product,
  promotions: Promotion[] | undefined,
  now: Date = new Date(),
): Promotion | null {
  if (!promotions?.length) return null;
  for (const p of promotions) {
    if (!p.autoApply) continue;
    if (p.conditions.some((c) => (c.minSum ?? 0) > 0)) continue;
    if (!isPromotionActive(p, now)) continue;
    if (productMatchesAnyCondition(product, p.conditions)) return p;
  }
  return null;
}

export function pickAppliedPromotion(
  promotions: Promotion[] | undefined,
  basketItems: BasketItem[],
  productsCatalog: Product[] | undefined,
  now: Date = new Date(),
): AppliedPromotion | null {
  if (!promotions?.length || basketItems.length === 0) return null;

  for (const p of promotions) {
    if (!p.autoApply) continue;
    // Backend drops promos with non-zero minSum — mirror that
    if (p.conditions.some((c) => (c.minSum ?? 0) > 0)) continue;
    if (!isPromotionActive(p, now)) continue;
    if (!matchesConditions(p, basketItems, productsCatalog)) continue;

    const discount = computeDiscount(p, basketItems, productsCatalog);
    if (discount.amount <= 0) continue;
    return { promotion: p, discount };
  }
  return null;
}
