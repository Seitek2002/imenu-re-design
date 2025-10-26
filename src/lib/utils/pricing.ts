import type { Venue } from '@/lib/api/types';

export function parseMoney(input: unknown, fallback = 0): number {
  if (typeof input === 'number') return Number.isFinite(input) ? input : fallback;
  if (typeof input === 'string') {
    const n = parseFloat(input);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export type OrderType = 'takeout' | 'dinein' | 'delivery';

export function calcDeliveryFee(opts: {
  venue: Partial<Venue> | undefined | null;
  subtotal: number;
  orderType: OrderType;
}): number {
  const { venue, subtotal, orderType } = opts;

  if (orderType !== 'delivery') return 0;

  const fee = parseMoney((venue as any)?.deliveryFixedFee, 0);
  const freeFromRaw = (venue as any)?.deliveryFreeFrom;
  const freeFrom =
    freeFromRaw === null || freeFromRaw === undefined
      ? null
      : parseMoney(freeFromRaw, NaN);

  if (freeFrom !== null && Number.isFinite(freeFrom) && subtotal >= (freeFrom as number)) {
    return 0;
  }

  return fee;
}

export function formatCurrency(n: number): string {
  // Kyrgyz som without decimals formatting spec is not strict here; stick to 2 decimals trimming.
  const val = Math.round(n * 100) / 100;
  return `${val} с`;
}
