import type {
  Product,
  Promotion,
  PromotionCondition,
  WeekDayShort,
} from '@/types/api';
import type { BasketItem } from '@/store/basket';

const WEEKDAY_BY_INDEX: WeekDayShort[] = [
  'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat',
];

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
  // Date window
  const start = new Date(p.dateStart).getTime();
  if (Number.isNaN(start) || now.getTime() < start) return false;
  if (p.dateEnd) {
    const end = new Date(p.dateEnd).getTime();
    if (!Number.isNaN(end) && now.getTime() > end) return false;
  }

  // Weekday — uses browser-local time (TZ confirmation pending from backend)
  const weekday = WEEKDAY_BY_INDEX[now.getDay()];
  if (!p.schedule.activeWeekDays.includes(weekday)) return false;

  // Time-of-day window
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (p.schedule.periods.length === 0) return true;
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
  if (c.entityType === 'product') {
    return c.localId != null && resolved.item.id === c.localId;
  }
  if (c.entityType === 'category') {
    if (c.localId == null) return false;
    const cats = resolved.product?.categories ?? [];
    return cats.some((cat) => cat.id === c.localId);
  }
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

  for (const c of p.conditions) {
    const totalQty = resolved
      .filter((r) => itemMatchesCondition(r, c))
      .reduce((sum, r) => sum + r.item.quantity, 0);
    if (totalQty < (c.quantity || 1)) return false;
  }
  return true;
}

export interface AppliedDiscount {
  amount: number;
  involvedItemKeys: string[];
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

  if (p.benefit.type === 'percent_discount') {
    const pct = p.benefit.discountPercent ?? 0;
    if (pct <= 0) return empty;
    const involvedTotal = involved.reduce(
      (sum, r) => sum + r.item.lineUnitPrice * r.item.quantity,
      0,
    );
    return {
      amount: Math.round((involvedTotal * pct) / 100),
      involvedItemKeys: involved.map((r) => r.item.key),
    };
  }

  // TODO: fixed_discount, bonus_products, fixed_prices — pending backend clarifications
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
    if (c.entityType === 'product') {
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
    if (p.conditions.some((c) => c.minSum > 0)) continue;
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
    if (p.conditions.some((c) => c.minSum > 0)) continue;
    if (!isPromotionActive(p, now)) continue;
    if (!matchesConditions(p, basketItems, productsCatalog)) continue;

    const discount = computeDiscount(p, basketItems, productsCatalog);
    if (discount.amount <= 0) continue;
    return { promotion: p, discount };
  }
  return null;
}
