/**
 * Deep snake_case ↔ camelCase key transformers для границы API.
 *
 * Зачем: новые ручки (см. project_auth_profile_contract — /clients/me/,
 * /clients/me/addresses/, /client/bonus/transactions/) приходят в snake_case,
 * а вся существующая v2 — в camelCase. Чтобы остальной React-код жил в одном
 * стиле, на границе мы конвертируем поля один раз.
 *
 * Применять **точечно** — не оборачивать `authedFetch` глобально, иначе
 * существующие camelCase-ручки превратятся в snake_case при POST.
 *
 * Трансформируются только **ключи** объектов. Значения (включая строки-даты,
 * decimal-money "50.00", UUID, телефоны) проходят как есть. Не объекты-литералы
 * (Date, FormData, Blob, ArrayBuffer, …) тоже не трогаются.
 */

type Json =
  | string
  | number
  | boolean
  | null
  | { [k: string]: Json }
  | Json[];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function snakeKeyToCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function camelKeyToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function transformKeys(
  input: unknown,
  fn: (key: string) => string,
): unknown {
  if (Array.isArray(input)) {
    return input.map((item) => transformKeys(item, fn));
  }
  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(input)) {
      out[fn(k)] = transformKeys(input[k], fn);
    }
    return out;
  }
  return input;
}

export function snakeToCamel<T = unknown>(input: unknown): T {
  return transformKeys(input, snakeKeyToCamel) as T;
}

export function camelToSnake<T = unknown>(input: unknown): T {
  return transformKeys(input, camelKeyToSnake) as T;
}

/** Узкая утилита: распарсить Response и нормализовать в camelCase. */
export async function readSnakeJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as Json;
  return snakeToCamel<T>(data);
}

/** Узкая утилита: сериализовать тело запроса как snake_case JSON. */
export function snakeJsonBody(body: unknown): string {
  return JSON.stringify(camelToSnake(body));
}
