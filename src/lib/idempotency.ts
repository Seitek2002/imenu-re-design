import { useState } from 'react';

/**
 * Idempotency-Key для платёжных ручек (контракт Kuma 2026-06-23).
 *
 * POST /api/v2/orders/ и POST /api/v2/pos-orders/{id}/payment-link/ принимают
 * заголовок `Idempotency-Key: <uuid-v4>`:
 *  - повтор с тем же ключом и тем же body → тот же заказ/payment-link без дубля;
 *  - тот же ключ + изменённая корзина/сумма/телефон/bonus → 409 Conflict;
 *  - OTP: первый POST вернёт waiting_for_code, второй POST с code и ТЕМ ЖЕ
 *    ключом создаст заказ штатно;
 *  - при 4xx/5xx без созданного заказа ключ не сгорает — можно повторять;
 *  - TTL ключа 24 часа; старые клиенты без ключа работают как раньше.
 *
 * Фронтовая логика: один UUID на попытку чекаута/оплаты, стабильный пока не
 * меняется body, прокидывается в оба вызова и во все retry (включая OTP).
 */

/** RFC4122 v4. Нативный crypto.randomUUID + фоллбэк для старых webview. */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Возвращает стабильный Idempotency-Key, привязанный к `signature`.
 *
 * Ключ переживает OTP-флоу и retry, пока signature не меняется. Как только
 * меняется любой определяющий body параметр (корзина/итог/телефон/бонус) —
 * это новая попытка → новый ключ, иначе бэк вернёт 409 на изменённый body.
 * Поэтому в signature кладём ровно те поля, по которым бэк сверяет совпадение.
 */
export function useIdempotencyKey(signature: string): string {
  // Канонический React-паттерн «adjust state during render»: при смене signature
  // синхронно регенерируем ключ и возвращаем новый в этом же рендере, без эффекта
  // и без чтения ref в рендере (useMemo сюда не годится — React вправе сбросить
  // его кэш и спонтанно сменить ключ посреди OTP-окна).
  const [prevSignature, setPrevSignature] = useState(signature);
  const [key, setKey] = useState(generateIdempotencyKey);

  if (prevSignature !== signature) {
    const next = generateIdempotencyKey();
    setPrevSignature(signature);
    setKey(next);
    return next;
  }
  return key;
}
