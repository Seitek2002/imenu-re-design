export interface PosOrderModifier {
  id: number;
  groupId?: number;
  groupName?: string;
  name: string;
  count: string;
  price: string;
  sum: string;
}

export interface PosOrderItem {
  id: number;
  productId: number | null;
  productName: string;
  qty: string;
  price: string;
  sum: string;
  modifiers: PosOrderModifier[];
  comment?: string;
}

export interface PosOrder {
  id: number;
  venueId: number;
  spotId: number;
  tableId: number;
  tableName: string;
  status: string;
  guestsCount: number;
  subtotal: string;
  total: string;
  paidAmount: string;
  openedAt: string;
  closedAt: string | null;
  version: number;
  updatedAt: string;
  items: PosOrderItem[];
}

interface PosOrderModifierSnake {
  id: number;
  group_id?: number;
  group_name?: string;
  name: string;
  count: string;
  price: string;
  sum: string;
}

interface PosOrderItemSnake {
  id: number;
  product_id: number | null;
  product_name: string;
  qty: string;
  price: string;
  sum: string;
  modifiers: PosOrderModifierSnake[];
  comment?: string;
}

export interface PosOrderSnake {
  id: number;
  venue_id: number;
  spot_id: number;
  table_id: number;
  table_name: string;
  status: string;
  guests_count: number;
  subtotal: string;
  total: string;
  paid_amount: string;
  opened_at: string;
  closed_at: string | null;
  version: number;
  updated_at: string;
  items: PosOrderItemSnake[];
}

export function normalizePosOrder(
  raw: PosOrderSnake | PosOrder | null | undefined,
): PosOrder | null {
  if (!raw) return null;

  // Already camelCase (WS payload)
  if ('venueId' in raw) return raw as PosOrder;

  const r = raw as PosOrderSnake;
  return {
    id: r.id,
    venueId: r.venue_id,
    spotId: r.spot_id,
    tableId: r.table_id,
    tableName: r.table_name,
    status: r.status,
    guestsCount: r.guests_count,
    subtotal: r.subtotal,
    total: r.total,
    paidAmount: r.paid_amount,
    openedAt: r.opened_at,
    closedAt: r.closed_at,
    version: r.version,
    updatedAt: r.updated_at,
    items: r.items.map((it) => ({
      id: it.id,
      productId: it.product_id,
      productName: it.product_name,
      qty: it.qty,
      price: it.price,
      sum: it.sum,
      comment: it.comment,
      modifiers: it.modifiers.map((m) => ({
        id: m.id,
        groupId: m.group_id,
        groupName: m.group_name,
        name: m.name,
        count: m.count,
        price: m.price,
        sum: m.sum,
      })),
    })),
  };
}
