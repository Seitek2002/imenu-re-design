/**
 * Pending payment-link persistence (sessionStorage).
 *
 * После redirect'а на платёжный шлюз сохраняем URL, чтобы при возврате
 * (или если шлюз вернул unpaid) показать кнопку «Продолжить оплату»
 * вместо пересоздания заказа.
 *
 * Сборка мусора:
 *  - `savedAt` ставится при `savePendingPayment`; lazy GC при каждом save
 *    подчищает записи старше `PENDING_PAYMENT_TTL_MS` (24ч).
 *  - `gcPendingPaymentsForOrders(orders)` точечно удаляет записи,
 *    у которых бэк уже отдал терминальный paymentStatus/status, —
 *    вызывается из queryFn `useOrdersV2` после успешного fetch.
 */

const KEY_PREFIX = 'pending_payment:';
const POS_KEY_PREFIX = 'pending_pos_payment:';

const PENDING_PAYMENT_TTL_MS = 24 * 60 * 60 * 1000;

/** TTL for POS resume button when backend doesn't tell us paymentExpiresAt. */
const POS_LINK_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface PendingPayment {
  orderId: number;
  paymentUrl: string;
  /** ISO-8601 expiry timestamp, optional. */
  expiresAt?: string | null;
  /** ms since epoch — для TTL-based GC. */
  savedAt?: number;
}

function storageKey(orderId: number | string): string {
  return `${KEY_PREFIX}${orderId}`;
}

export function savePendingPayment(p: Omit<PendingPayment, 'savedAt'>): void {
  try {
    const enriched: PendingPayment = { ...p, savedAt: Date.now() };
    sessionStorage.setItem(storageKey(p.orderId), JSON.stringify(enriched));
    gcExpiredPendingPayments();
  } catch {
    // SSR / private-browsing guard
  }
}

export function getPendingPayment(
  orderId: number | string,
): PendingPayment | null {
  try {
    const raw = sessionStorage.getItem(storageKey(orderId));
    if (!raw) return null;
    return JSON.parse(raw) as PendingPayment;
  } catch {
    return null;
  }
}

export function clearPendingPayment(orderId: number | string): void {
  try {
    sessionStorage.removeItem(storageKey(orderId));
  } catch {
    // ignore
  }
}

/** Returns true if the saved link is still valid (not expired). */
export function isPaymentLinkValid(p: PendingPayment | null): boolean {
  if (!p?.paymentUrl) return false;
  if (!p.expiresAt) return true; // no expiry recorded → assume valid
  const target = new Date(p.expiresAt).getTime();
  if (Number.isNaN(target)) return true;
  return target > Date.now();
}

/**
 * Lazy GC: подчищает записи старше TTL и битые JSON. Вызывается из
 * `savePendingPayment` — амортизированно бесплатно, ключей всегда мало.
 */
function gcExpiredPendingPayments(): void {
  try {
    const now = Date.now();
    const stale: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (!k || !k.startsWith(KEY_PREFIX)) continue;
      const raw = sessionStorage.getItem(k);
      if (!raw) {
        stale.push(k);
        continue;
      }
      try {
        const p = JSON.parse(raw) as PendingPayment;
        if (!p.savedAt || now - p.savedAt > PENDING_PAYMENT_TTL_MS) {
          stale.push(k);
        }
      } catch {
        stale.push(k);
      }
    }
    stale.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}

/**
 * Точечная очистка по свежему списку заказов: удаляет ссылки на заказы,
 * у которых бэк уже отдал терминальный paymentStatus или статус
 * Completed/Cancelled. Безопасно для SSR (под try) и пустых списков.
 *
 * Терминальный paymentStatus: paid | failed | expired | cancelled |
 * not_required. status: 0 (NEW, оплата прошла) | 7 (Cancelled).
 */
export function gcPendingPaymentsForOrders(
  orders: Array<{
    id: number;
    status?: number;
    paymentStatus?: string | null;
  }>,
): void {
  if (!orders.length) return;
  try {
    for (const o of orders) {
      const terminalPayment =
        o.paymentStatus === 'paid' ||
        o.paymentStatus === 'failed' ||
        o.paymentStatus === 'expired' ||
        o.paymentStatus === 'cancelled' ||
        o.paymentStatus === 'not_required';
      const terminalStatus = o.status === 0 || o.status === 7;
      if (terminalPayment || terminalStatus) {
        sessionStorage.removeItem(storageKey(o.id));
      }
    }
  } catch {
    // ignore
  }
}

// ---------- POS variant ----------

interface PendingPosPayment {
  posOrderId: number;
  paymentUrl: string;
  /** ms since epoch — when we saved the link before redirecting. */
  savedAt: number;
}

function posStorageKey(posOrderId: number | string): string {
  return `${POS_KEY_PREFIX}${posOrderId}`;
}

export function savePendingPosPayment(p: PendingPosPayment): void {
  try {
    sessionStorage.setItem(posStorageKey(p.posOrderId), JSON.stringify(p));
    gcExpiredPosPendingPayments();
  } catch {
    // ignore
  }
}

export function getPendingPosPayment(
  posOrderId: number | string,
): PendingPosPayment | null {
  try {
    const raw = sessionStorage.getItem(posStorageKey(posOrderId));
    if (!raw) return null;
    return JSON.parse(raw) as PendingPosPayment;
  } catch {
    return null;
  }
}

export function clearPendingPosPayment(posOrderId: number | string): void {
  try {
    sessionStorage.removeItem(posStorageKey(posOrderId));
  } catch {
    // ignore
  }
}

/** TTL guard — backend doesn't return paymentExpiresAt for POS links. */
export function isPosPaymentLinkFresh(p: PendingPosPayment | null): boolean {
  if (!p?.paymentUrl) return false;
  return Date.now() - p.savedAt < POS_LINK_TTL_MS;
}

function gcExpiredPosPendingPayments(): void {
  try {
    const now = Date.now();
    const stale: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (!k || !k.startsWith(POS_KEY_PREFIX)) continue;
      const raw = sessionStorage.getItem(k);
      if (!raw) {
        stale.push(k);
        continue;
      }
      try {
        const p = JSON.parse(raw) as PendingPosPayment;
        if (!p.savedAt || now - p.savedAt > POS_LINK_TTL_MS) {
          stale.push(k);
        }
      } catch {
        stale.push(k);
      }
    }
    stale.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}
