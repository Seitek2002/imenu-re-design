import { describe, it, expect } from 'vitest';
import { orderPollInterval } from './order-poll';
import { OrderStatus } from '@/types/api';

describe('orderPollInterval', () => {
  it('останавливает поллинг на терминальных статусах', () => {
    expect(orderPollInterval(OrderStatus.Completed, 0)).toBe(false);
    expect(orderPollInterval(OrderStatus.Cancelled, 99)).toBe(false);
  });

  it('держит активные статусы на 5с независимо от счётчика', () => {
    expect(orderPollInterval(OrderStatus.Created, 0)).toBe(5000);
    expect(orderPollInterval(OrderStatus.Preparing, 50)).toBe(5000);
    expect(orderPollInterval(OrderStatus.Ready, 100)).toBe(5000);
    expect(orderPollInterval(OrderStatus.InDelivery, 100)).toBe(5000);
  });

  it('делает backoff в лимбе PendingPayment: 5→15→30с (#6)', () => {
    expect(orderPollInterval(OrderStatus.PendingPayment, 0)).toBe(5000);
    expect(orderPollInterval(OrderStatus.PendingPayment, 3)).toBe(5000);
    expect(orderPollInterval(OrderStatus.PendingPayment, 4)).toBe(15000);
    expect(orderPollInterval(OrderStatus.PendingPayment, 7)).toBe(15000);
    expect(orderPollInterval(OrderStatus.PendingPayment, 8)).toBe(30000);
    expect(orderPollInterval(OrderStatus.PendingPayment, 200)).toBe(30000);
  });

  it('неизвестный/undefined статус поллит как активный (5с)', () => {
    expect(orderPollInterval(undefined, 0)).toBe(5000);
  });
});
