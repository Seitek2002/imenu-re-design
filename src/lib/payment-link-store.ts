/**
 * Pending payment-link persistence (sessionStorage).
 *
 * After redirecting the user to the payment gateway we keep the URL around so
 * that if the user cancels (or the gateway redirects back with an unpaid
 * status) we can offer to resume the same payment without re-creating the
 * order — provided the link has not expired.
 */

const KEY_PREFIX = 'pending_payment:';
const POS_KEY_PREFIX = 'pending_pos_payment:';

/** TTL for POS resume button when backend doesn't tell us paymentExpiresAt. */
const POS_LINK_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface PendingPayment {
  orderId: number;
  paymentUrl: string;
  /** ISO-8601 expiry timestamp, optional. */
  expiresAt?: string | null;
}

function storageKey(orderId: number | string): string {
  return `${KEY_PREFIX}${orderId}`;
}

export function savePendingPayment(p: PendingPayment): void {
  try {
    sessionStorage.setItem(storageKey(p.orderId), JSON.stringify(p));
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
