import { describe, it, expect, beforeEach } from 'vitest';
import {
  savePendingPayment,
  getPendingPayment,
  clearPendingPayment,
  isPaymentLinkValid,
  gcPendingPaymentsForOrders,
  savePendingPosPayment,
  getPendingPosPayment,
  isPosPaymentLinkFresh,
} from './payment-link-store';

beforeEach(() => {
  sessionStorage.clear();
});

describe('pending payment roundtrip', () => {
  it('save → get возвращает ту же ссылку', () => {
    savePendingPayment({ orderId: 884, paymentUrl: 'https://gw/pay/1' });
    expect(getPendingPayment(884)?.paymentUrl).toBe('https://gw/pay/1');
  });

  it('clear удаляет запись', () => {
    savePendingPayment({ orderId: 884, paymentUrl: 'https://gw/pay/1' });
    clearPendingPayment(884);
    expect(getPendingPayment(884)).toBeNull();
  });

  it('get несуществующего → null', () => {
    expect(getPendingPayment(999)).toBeNull();
  });
});

describe('isPaymentLinkValid', () => {
  it('нет expiresAt → валидна', () => {
    expect(isPaymentLinkValid({ orderId: 1, paymentUrl: 'u' })).toBe(true);
  });
  it('будущий дедлайн → валидна', () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(isPaymentLinkValid({ orderId: 1, paymentUrl: 'u', expiresAt: future })).toBe(true);
  });
  it('прошедший дедлайн → невалидна', () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(isPaymentLinkValid({ orderId: 1, paymentUrl: 'u', expiresAt: past })).toBe(false);
  });
  it('без url или null → невалидна', () => {
    expect(isPaymentLinkValid(null)).toBe(false);
    expect(isPaymentLinkValid({ orderId: 1, paymentUrl: '' })).toBe(false);
  });
  it('битая дата → считаем валидной (не воскрешаем ложно протухшей)', () => {
    expect(isPaymentLinkValid({ orderId: 1, paymentUrl: 'u', expiresAt: 'garbage' })).toBe(true);
  });
});

describe('gcPendingPaymentsForOrders', () => {
  it('удаляет ссылки у заказов с терминальным paymentStatus', () => {
    for (const id of [1, 2, 3, 4, 5]) {
      savePendingPayment({ orderId: id, paymentUrl: `u${id}` });
    }
    gcPendingPaymentsForOrders([
      { id: 1, paymentStatus: 'paid' },
      { id: 2, paymentStatus: 'failed' },
      { id: 3, paymentStatus: 'expired' },
      { id: 4, paymentStatus: 'cancelled' },
      { id: 5, paymentStatus: 'not_required' },
    ]);
    for (const id of [1, 2, 3, 4, 5]) {
      expect(getPendingPayment(id)).toBeNull();
    }
  });

  it('удаляет по терминальному status (0=NEW оплачен, 7=Cancelled)', () => {
    savePendingPayment({ orderId: 10, paymentUrl: 'u10' });
    savePendingPayment({ orderId: 11, paymentUrl: 'u11' });
    gcPendingPaymentsForOrders([
      { id: 10, status: 0 },
      { id: 11, status: 7 },
    ]);
    expect(getPendingPayment(10)).toBeNull();
    expect(getPendingPayment(11)).toBeNull();
  });

  it('НЕ трогает заказы в pending / status=4 (#2: отметка должна дожить до order-status)', () => {
    savePendingPayment({ orderId: 20, paymentUrl: 'u20' });
    savePendingPayment({ orderId: 21, paymentUrl: 'u21' });
    gcPendingPaymentsForOrders([
      { id: 20, paymentStatus: 'pending' },
      { id: 21, status: 4 },
    ]);
    expect(getPendingPayment(20)?.paymentUrl).toBe('u20');
    expect(getPendingPayment(21)?.paymentUrl).toBe('u21');
  });

  it('пустой список — no-op', () => {
    savePendingPayment({ orderId: 30, paymentUrl: 'u30' });
    gcPendingPaymentsForOrders([]);
    expect(getPendingPayment(30)?.paymentUrl).toBe('u30');
  });
});

describe('POS pending payment + TTL', () => {
  it('save → get роундтрип', () => {
    savePendingPosPayment({ posOrderId: 5, paymentUrl: 'pos-url', savedAt: Date.now() });
    expect(getPendingPosPayment(5)?.paymentUrl).toBe('pos-url');
  });

  it('isPosPaymentLinkFresh: свежая < 30мин → true', () => {
    expect(
      isPosPaymentLinkFresh({ posOrderId: 5, paymentUrl: 'u', savedAt: Date.now() - 60_000 }),
    ).toBe(true);
  });

  it('isPosPaymentLinkFresh: старше 30мин → false', () => {
    expect(
      isPosPaymentLinkFresh({ posOrderId: 5, paymentUrl: 'u', savedAt: Date.now() - 31 * 60_000 }),
    ).toBe(false);
  });

  it('isPosPaymentLinkFresh: null → false', () => {
    expect(isPosPaymentLinkFresh(null)).toBe(false);
  });
});
