import { API_URL } from './config';
import type { Locale } from './locale';

const BASE_URL = `${API_URL}/`;

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
  locale?: Locale;
};

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, locale, ...init } = options;

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

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    console.log(response);
    // Тут можно добавить логирование ошибок или выброс кастомного Error
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
