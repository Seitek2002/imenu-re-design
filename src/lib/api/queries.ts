import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import {
  BonusResponse,
  CalculateRequest,
  CalculateResponse,
  OrderCreateBody,
  OrderCreateResponse,
  OrdersResponse,
  OrderV2,
} from '../order';
import { API_URL, API_V2_URL } from '../config';
import { OrderStatus, Product, Promotion } from '@/types/api';
import { normalizePhoneForApi } from '../helpers/phone';
import type { Locale } from '../locale';

const API_BASE = API_V2_URL;

function buildHeaders(locale: Locale): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Accept-Language': locale,
  };
}

interface OrdersParams {
  phone: string;
  venueSlug?: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  // Бэк по умолчанию (по контракту 2026-04-27) скрывает заказы со статусом
  // PendingPayment. Передаём true, чтобы countdown оплаты был видим.
  includeUnpaid?: boolean;
}

async function fetchOrders(
  { phone, venueSlug, limit, offset, startDate, endDate, includeUnpaid }: OrdersParams,
  locale: Locale,
): Promise<OrdersResponse> {
  const params = new URLSearchParams();
  if (phone) params.append('phone', normalizePhoneForApi(phone));
  if (venueSlug) params.append('venueSlug', venueSlug);
  if (limit != null) params.append('limit', String(limit));
  if (offset != null) params.append('offset', String(offset));
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (includeUnpaid != null) params.append('includeUnpaid', String(includeUnpaid));

  const res = await fetch(`${API_BASE}/orders/?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(locale),
  });

  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export const useOrdersV2 = (params: OrdersParams) => {
  const locale = useLocale() as Locale;
  const { phone } = params;

  return useQuery({
    queryKey: [
      'orders',
      phone,
      params.venueSlug,
      params.limit,
      params.offset,
      params.startDate,
      params.endDate,
      params.includeUnpaid,
      locale,
    ],
    queryFn: () => fetchOrders(params, locale),
    // Не грузим, если телефона нет
    enabled: !!phone && phone.length > 5,
    refetchInterval: 15000, // Обновляем каждые 15 сек
  });
};

async function fetchOrderById(
  id: number,
  locale: Locale,
): Promise<OrderV2> {
  const res = await fetch(`${API_BASE}/orders/${id}/`, {
    method: 'GET',
    headers: buildHeaders(locale),
  });
  if (!res.ok) throw new Error('Failed to fetch order');
  return res.json();
}

export const useOrderByIdV2 = (
  id: number,
  initialData?: OrderV2,
) => {
  const locale = useLocale() as Locale;

  return useQuery<OrderV2>({
    queryKey: ['order', id, locale],
    queryFn: () => fetchOrderById(id, locale),
    enabled: !!id,
    initialData,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s === OrderStatus.Completed || s === OrderStatus.Cancelled) {
        return false;
      }
      return 5000;
    },
    refetchOnWindowFocus: true,
  });
};

async function fetchClientBonus(
  {
    phone,
    venueSlug,
  }: {
    phone: string;
    venueSlug: string;
  },
  locale: Locale,
): Promise<BonusResponse> {
  const params = new URLSearchParams();
  params.append('phone', normalizePhoneForApi(phone));
  params.append('venueSlug', venueSlug);

  const res = await fetch(`${API_URL}/v2/client/bonus/?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(locale),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch bonus');
  }

  return res.json();
}

async function fetchClient(
  phone: string,
  locale: Locale,
): Promise<import('@/types/api').Client> {
  const normalized = normalizePhoneForApi(phone);
  const res = await fetch(`${API_BASE}/clients/${normalized}/`, {
    method: 'GET',
    headers: buildHeaders(locale),
  });
  if (!res.ok) throw new Error('Failed to fetch client');
  return res.json();
}

export const useClient = (phone: string) => {
  const locale = useLocale() as Locale;
  return useQuery({
    queryKey: ['client', phone, locale],
    queryFn: () => fetchClient(phone, locale),
    enabled: !!phone && phone.length > 5,
    staleTime: 1000 * 60,
  });
};

async function patchClient(
  phone: string,
  body: Partial<Pick<import('@/types/api').Client, 'firstname' | 'lastname' | 'patronymic' | 'email'>>,
  locale: Locale,
): Promise<import('@/types/api').Client> {
  const normalized = normalizePhoneForApi(phone);
  const res = await fetch(`${API_BASE}/clients/${normalized}/`, {
    method: 'PATCH',
    headers: buildHeaders(locale),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Network error' }));
    throw err;
  }
  return res.json();
}

export const useUpdateClient = (phone: string) => {
  const locale = useLocale() as Locale;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Pick<import('@/types/api').Client, 'firstname' | 'lastname' | 'patronymic' | 'email'>>) =>
      patchClient(phone, body, locale),
    onSuccess: (data) => {
      qc.setQueryData(['client', phone, locale], data);
    },
  });
};

export const useClientBonus = ({
  phone,
  venueSlug,
}: {
  phone: string;
  venueSlug: string;
}) => {
  const locale = useLocale() as Locale;

  return useQuery({
    queryKey: ['bonus', phone, venueSlug, locale], // Уникальный ключ кеша
    queryFn: () => fetchClientBonus({ phone, venueSlug }, locale),

    // Грузим только если есть телефон и слаг
    enabled: !!phone && phone.length > 5 && !!venueSlug,

    // Балансы должны быть свежими: маленький staleTime + рефетч на фокус/маунт.
    // Глобальный refetchOnWindowFocus=false переопределяем тут точечно.
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
};

async function createOrderApi({
  body,
  venueSlug,
  locale,
}: {
  body: OrderCreateBody;
  venueSlug: string;
  locale: Locale;
}): Promise<OrderCreateResponse> {
  const payload = {
    ...body,
    phone: normalizePhoneForApi(body.phone),
    venueSlug,
  };

  const res = await fetch(`${API_BASE}/orders/`, {
    method: 'POST',
    headers: buildHeaders(locale),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res
      .json()
      .catch(() => ({ message: 'Network error' }));

    throw errData;
  }

  return res.json();
}

// 🔥 Хук мутации
export const useCreateOrderV2 = () => {
  const locale = useLocale() as Locale;

  return useMutation({
    mutationFn: (args: { body: OrderCreateBody; venueSlug: string }) =>
      createOrderApi({ ...args, locale }),
  });
};

// --- /api/v2/orders/calculate/ (Kuma 2026-05-12) ---
// Серверный расчёт корзины. Ничего не создаёт; не требует авторизации.
// Бэк сам ограничивает bonusApplied доступным балансом и суммой заказа,
// сам добавляет контейнеры (serviceMode=2/3) и применяет промо-акции.
async function calculateOrderApi(
  body: import('../order').CalculateRequest,
  locale: Locale,
): Promise<CalculateResponse> {
  const payload: CalculateRequest = {
    ...body,
    phone: body.phone ? normalizePhoneForApi(body.phone) : body.phone,
  };

  const res = await fetch(`${API_BASE}/orders/calculate/`, {
    method: 'POST',
    headers: buildHeaders(locale),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res
      .json()
      .catch(() => ({ message: 'Network error' }));
    throw errData;
  }

  return res.json();
}

/**
 * Mutation-обёртка над /orders/calculate/. Mutation, а не useQuery —
 * чтобы вызывающий код мог сам контролировать debounce и порядок
 * вызовов при частых изменениях корзины.
 */
export const useCalculateOrder = () => {
  const locale = useLocale() as Locale;
  return useMutation({
    mutationFn: (body: CalculateRequest) => calculateOrderApi(body, locale),
  });
};

/** Низкоуровневый вызов — если нужен расчёт вне React-контекста. */
export async function calculateOrder(
  body: CalculateRequest,
  locale: Locale,
): Promise<CalculateResponse> {
  return calculateOrderApi(body, locale);
}

async function fetchVenueProducts(
  venueSlug: string,
  spotId: number | null | undefined,
  locale: Locale,
): Promise<Product[]> {
  const params = new URLSearchParams({ venueSlug });
  if (spotId != null) params.set('spotId', String(spotId));
  const res = await fetch(`${API_URL}/v2/products/?${params.toString()}`, {
    headers: buildHeaders(locale),
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export const useVenueProducts = (
  venueSlug: string | null | undefined,
  spotId?: number | null,
) => {
  const locale = useLocale() as Locale;

  return useQuery({
    queryKey: ['venue-products', venueSlug, spotId ?? null, locale],
    queryFn: () => fetchVenueProducts(venueSlug as string, spotId, locale),
    enabled: !!venueSlug,
    staleTime: 1000 * 60 * 5,
  });
};

export async function fetchPromotions(
  venueSlug: string,
  spotId: number | null | undefined,
  locale: Locale,
): Promise<Promotion[]> {
  const params = new URLSearchParams({ venueSlug });
  if (spotId != null) params.set('spotId', String(spotId));
  const res = await fetch(`${API_BASE}/promotions/?${params.toString()}`, {
    headers: buildHeaders(locale),
  });
  if (!res.ok) throw new Error('Failed to fetch promotions');
  return res.json();
}

export const usePromotionsV2 = (
  venueSlug: string | null | undefined,
  spotId?: number | null,
) => {
  const locale = useLocale() as Locale;

  return useQuery({
    queryKey: ['promotions', venueSlug, spotId ?? null, locale],
    queryFn: () => fetchPromotions(venueSlug as string, spotId, locale),
    enabled: !!venueSlug,
    staleTime: 1000 * 60 * 5,
  });
};
