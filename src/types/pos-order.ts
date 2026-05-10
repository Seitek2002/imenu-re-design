export type PosOrderStatus = 'open' | 'paid' | 'closed' | string;

export interface PosOrderModifier {
  id: number | null;
  name: string;
  qty: string;
  unitPrice: string;
  total: string;
}

export interface PosOrderItem {
  id: number;
  productId: number | null;
  productName: string;
  qty: string;
  unitPrice: string;
  subtotal: string;
  discountAmount: string;
  total: string;
  modifiers: PosOrderModifier[];
  comment: string;
}

export interface PosOrder {
  id: number;
  source: 'pos';
  tableId: number | null;
  tableName: string;
  status: PosOrderStatus;
  guestsCount: number;
  subtotal: string;
  discountAmount: string;
  total: string;
  paidAmount: string;
  openedAt: string | null;
  closedAt: string | null;
  version: number;
  updatedAt: string | null;
  items: PosOrderItem[];
}

export type PosOrderSnapshot = PosOrder;

export function toMoneyNumber(value: string | undefined | null): number {
  if (!value) return 0;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(value: string | number | undefined | null): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) return '0.00';
  return value.toFixed(2);
}

export function subtractMoney(a: string, b: string): string {
  const [aWhole, aFrac = ''] = a.split('.');
  const [bWhole, bFrac = ''] = b.split('.');
  const aCents = Number(aWhole) * 100 + Number(aFrac.padEnd(2, '0').slice(0, 2));
  const bCents = Number(bWhole) * 100 + Number(bFrac.padEnd(2, '0').slice(0, 2));
  const diff = Math.max(0, aCents - bCents);
  return (diff / 100).toFixed(2);
}
