const BASE_URL = 'https://imenu.kg/api/'; // Твой базовый URL

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...init } = options;

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

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...init.headers,
  };

  const response = await fetch(url, {
    ...init,
    headers,
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    console.log(response);
    // Тут можно добавить логирование ошибок или выброс кастомного Error
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}
