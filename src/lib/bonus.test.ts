import { describe, it, expect } from 'vitest';
import { maxDeductibleBonus } from './bonus';

describe('maxDeductibleBonus', () => {
  it('ограничивает процентом от суммы заказа', () => {
    // 50% от 1000 = 500, баланс выше → режет процент
    expect(maxDeductibleBonus(10_000, 1000, 50)).toBe(500);
  });

  it('ограничивает доступным балансом, если он меньше процента', () => {
    // 50% от 1000 = 500, но на балансе только 120
    expect(maxDeductibleBonus(120, 1000, 50)).toBe(120);
  });

  it('использует per-venue процент, а не захардкоженные 50% (регресс #1)', () => {
    // venue с лимитом 70% должен давать 700, а не 500
    expect(maxDeductibleBonus(10_000, 1000, 70)).toBe(700);
    // venue с лимитом 30% должен давать 300
    expect(maxDeductibleBonus(10_000, 1000, 30)).toBe(300);
  });

  it('дефолтит на 50% при отсутствии percent', () => {
    expect(maxDeductibleBonus(10_000, 1000)).toBe(500);
    expect(maxDeductibleBonus(10_000, 1000, null)).toBe(500);
    expect(maxDeductibleBonus(10_000, 1000, undefined)).toBe(500);
  });

  it('округляет вниз (дробных бонусов нет)', () => {
    // 50% от 999 = 499.5 → 499
    expect(maxDeductibleBonus(10_000, 999, 50)).toBe(499);
    // 33% от 1000 = 330 ровно
    expect(maxDeductibleBonus(10_000, 1000, 33)).toBe(330);
  });

  it('нулевой баланс или нулевой заказ → 0', () => {
    expect(maxDeductibleBonus(0, 1000, 50)).toBe(0);
    expect(maxDeductibleBonus(500, 0, 50)).toBe(0);
  });
});
