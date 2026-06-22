/**
 * Максимум бонусов к списанию на заказ.
 *
 * Правило Postera (per-venue, Kuma 2026-05-24 §4): списать можно не больше
 * `percent`% от суммы заказа и не больше доступного баланса; дробных бонусов
 * нет — округляем вниз. `percent` берётся из `venue.bonusMaxDeductiblePercent`,
 * дефолт 50 (если бэк поле не вернул).
 *
 * Единый источник формулы для корзины, OrderSummary, POS и дровера —
 * раньше она была скопирована в 4 местах и однажды разъехалась (хардкод 50%).
 */
export function maxDeductibleBonus(
  available: number,
  orderBase: number,
  percent?: number | null,
): number {
  const ratio = (percent ?? 50) / 100;
  return Math.floor(Math.min(available, orderBase * ratio));
}
