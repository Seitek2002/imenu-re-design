/**
 * Лёгкая телеметрия воронки оплаты.
 *
 * До сих пор на ошибках был только `console.error`, и не было видно, где
 * отваливаются деньги. Этот модуль шлёт события воронки в pluggable-приёмник:
 * по умолчанию — `window.dataLayer` (GTM-совместимо) + `console.debug` в dev.
 * Когда подключите конкретного провайдера (GA4/Amplitude/Mixpanel) — достаточно
 * заменить тело `emit`, точки инструментирования трогать не нужно.
 *
 * Воронка:
 *   checkout_started → order_create_attempt → (order_otp_required?) →
 *     order_create_success → payment_redirect → payment_success
 *   ветки ошибок: order_create_error
 */
export type PaymentFunnelEvent =
  | 'checkout_started'
  | 'order_create_attempt'
  | 'order_otp_required'
  | 'order_create_success'
  | 'payment_redirect'
  | 'payment_success'
  | 'order_create_error';

export interface PaymentEventPayload {
  /** 'cart' | 'pos' — откуда инициирована оплата. */
  source?: 'cart' | 'pos';
  orderId?: number | string;
  venueSlug?: string;
  serviceMode?: 1 | 2 | 3;
  paymentMethod?: 'elqr' | 'cash' | 'card';
  total?: number;
  bonusApplied?: number;
  /** Краткое описание ошибки для веток *_error. */
  error?: string;
}

interface DataLayerWindow {
  dataLayer?: Array<Record<string, unknown>>;
}

function emit(event: PaymentFunnelEvent, payload: PaymentEventPayload): void {
  const record = { event: `payment_${event}`, ...payload, ts: Date.now() };
  try {
    if (typeof window !== 'undefined') {
      const w = window as unknown as DataLayerWindow;
      (w.dataLayer ??= []).push(record);
    }
  } catch {
    // приёмник не должен ломать оплату
  }
  if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
    console.debug('[payment]', event, payload);
  }
}

export function trackPayment(
  event: PaymentFunnelEvent,
  payload: PaymentEventPayload = {},
): void {
  emit(event, payload);
}
