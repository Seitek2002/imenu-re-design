export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://imenu.kg';

export const API_URL = `${API_BASE_URL}/api`;
export const API_V2_URL = `${API_BASE_URL}/api/v2`;

const PROD_HOSTS = new Set(['imenu.kg', 'www.imenu.kg']);

/**
 * Возвращает redirectUrl для POST /v2/orders/, если фронт работает не на
 * прод-домене. На imenu.kg бэк по дефолту строит deep-link на /order-status/{id}
 * — возвращаем undefined, чтобы не ломать его. На staging/local шлём свой URL,
 * иначе платёжка вернёт юзера на прод и он потеряет сессию.
 */
export function buildOrderRedirectUrl(venueSlug: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  if (PROD_HOSTS.has(window.location.host)) return undefined;
  return `${window.location.origin}/${venueSlug}`;
}
