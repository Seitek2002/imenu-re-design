import { describe, it, expect } from 'vitest';
import { generateIdempotencyKey } from './idempotency';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('generateIdempotencyKey', () => {
  it('возвращает валидный UUID v4', () => {
    expect(generateIdempotencyKey()).toMatch(UUID_V4);
  });

  it('генерирует уникальные ключи', () => {
    const keys = new Set(
      Array.from({ length: 1000 }, () => generateIdempotencyKey()),
    );
    expect(keys.size).toBe(1000);
  });
});
