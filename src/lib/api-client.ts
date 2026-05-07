import { API_URL } from './config';
import type { Locale } from './locale';

const BASE_URL = `${API_URL}/`;

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
  locale?: Locale;
  revalidate?: number | false;
  tags?: string[];
};

const DEFAULT_REVALIDATE = 60;

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, locale, revalidate, tags, ...init } = options;

  // Формируем Query String (?venueSlug=...&tableId=...)
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    url += `?${searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(locale ? { 'Accept-Language': locale } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  // Next кэширует fetch по URL+headers, поэтому локализованные ответы
  // хранятся отдельно. Включаем ISR-кэш по умолчанию, чтобы повторное
  // переключение языка отдавалось из Data Cache мгновенно.
  const isMutation =
    typeof init.method === 'string' &&
    init.method.toUpperCase() !== 'GET' &&
    init.method.toUpperCase() !== 'HEAD';

  const next =
    !isMutation && revalidate !== false
      ? { revalidate: revalidate ?? DEFAULT_REVALIDATE, tags }
      : undefined;

  const response = await fetch(url, {
    ...init,
    headers,
    ...(next ? { next } : {}),
  });

  if (!response.ok) {
    let body = '';
    try {
      body = await response.text();
    } catch {
      // ignore
    }
    throw new Error(
      `API Error ${response.status} ${response.statusText} @ ${url}${
        body ? `: ${body.slice(0, 500)}` : ''
      }`,
    );
  }

  return response.json();
}
