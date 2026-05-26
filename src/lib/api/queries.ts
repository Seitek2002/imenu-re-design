import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import {
  BonusResponse,
  CalculateRequest,
  CalculateResponse,
  LoyaltyResponse,
  OrderCreateBody,
  OrderCreateResponse,
  OrdersResponse,
  OrderV2,
} from '../order';
import { API_URL, API_V2_URL } from '../config';
import { OrderStatus, Product, Promotion } from '@/types/api';
import { normalizePhoneForApi } from '../helpers/phone';
import type { Locale } from '../locale';
import { getAccessTokenSnapshot } from '@/store/auth';
import { gcPendingPaymentsForOrders } from '../payment-link-store';

const API_BASE = API_V2_URL;

function buildHeaders(locale: Locale): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Accept-Language': locale,
  };
}

/**
 * То же, что buildHeaders, но добавляет `Authorization: Bearer ...` если
 * клиент авторизован через OTP. Используется для ручек с SMS-bypass
 * (POST /orders/, POST /pos-orders/{id}/payment-link/).
 */
function buildAuthedHeaders(locale: Locale): HeadersInit {
  const token = getAccessTokenSnapshot();
  return {
    'Content-Type': 'application/json',
    'Accept-Language': locale,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  const data: OrdersResponse = await res.json();
  gcPendingPaymentsForOrders(data.results);
  return data;
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
    // Kuma 2026-05-25 §5.1: refetch на возврат во вкладку — главный
    // механизм, через который зависший pending обновляется в expired
    // быстрее cron-окна (~6 мин).
    refetchOnWindowFocus: true,
  });
};

/**
 * Infinite-scroll вариант — следует `next` URL из ответа DRF.
 * Используется на /history. Polling 15s обновляет все загруженные страницы
 * (для countdown'а оплаты на первой странице — оправдано).
 */
async function fetchOrdersByUrl(
  url: string,
  locale: Locale,
): Promise<OrdersResponse> {
  const res = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(locale),
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  const data: OrdersResponse = await res.json();
  gcPendingPaymentsForOrders(data.results);
  return data;
}

function buildOrdersUrl(params: OrdersParams): string {
  const sp = new URLSearchParams();
  if (params.phone) sp.append('phone', normalizePhoneForApi(params.phone));
  if (params.venueSlug) sp.append('venueSlug', params.venueSlug);
  if (params.limit != null) sp.append('limit', String(params.limit));
  if (params.startDate) sp.append('startDate', params.startDate);
  if (params.endDate) sp.append('endDate', params.endDate);
  if (params.includeUnpaid != null)
    sp.append('includeUnpaid', String(params.includeUnpaid));
  return `${API_BASE}/orders/?${sp.toString()}`;
}

export const useOrdersInfiniteV2 = (params: OrdersParams) => {
  const locale = useLocale() as Locale;
  const { phone } = params;
  const firstUrl = buildOrdersUrl(params);

  return useInfiniteQuery({
    queryKey: [
      'orders-infinite',
      phone,
      params.venueSlug,
      params.limit,
      params.startDate,
      params.endDate,
      params.includeUnpaid,
      locale,
    ],
    queryFn: ({ pageParam }) => fetchOrdersByUrl(pageParam, locale),
    initialPageParam: firstUrl,
    getNextPageParam: (last) => last.next ?? undefined,
    enabled: !!phone && phone.length > 5,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
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
  const data: OrderV2 = await res.json();
  gcPendingPaymentsForOrders([data]);
  return data;
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

/**
 * GET /v2/client/loyalty/?venueSlug=&phone= — полная шкала лояльности.
 * Kuma 2026-05-24 §6b. Возвращает 200 только для Poster-venue; для остальных
 * (или клиент не найден) — 404. Хук в этом случае отдаёт data=null и UI
 * должен мягко деградировать к одному текущему % из clientGroup.
 */
async function fetchClientLoyalty(
  { phone, venueSlug }: { phone: string; venueSlug: string },
  locale: Locale,
): Promise<LoyaltyResponse | null> {
  const params = new URLSearchParams();
  params.append('phone', normalizePhoneForApi(phone));
  params.append('venueSlug', venueSlug);

  const res = await fetch(`${API_URL}/v2/client/loyalty/?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(locale),
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`loyalty_failed_${res.status}`);
  return res.json();
}

export const useClientLoyalty = ({
  phone,
  venueSlug,
}: {
  phone: string;
  venueSlug: string;
}) => {
  const locale = useLocale() as Locale;
  return useQuery({
    queryKey: ['loyalty', phone, venueSlug, locale],
    queryFn: () => fetchClientLoyalty({ phone, venueSlug }, locale),
    enabled: !!phone && phone.length > 5 && !!venueSlug,
    staleTime: 1000 * 60 * 5,
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

  // SMS-bypass (Kuma 2026-05-19): с валидным Bearer бэк не требует phone_code.
  const res = await fetch(`${API_BASE}/orders/`, {
    method: 'POST',
    headers: buildAuthedHeaders(locale),
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

// --- /api/v2/orders/{id}/cancel/ (Kuma 2026-05-17, обновлено 2026-05-25 §1.6) ---
// Работает только при status=4 (PendingPayment).
// 200 → возвращает заказ с paymentStatus='cancelled', status=7;
// 400 → нельзя отменить в текущем статусе; 404 → не найден.
async function cancelOrderApi(orderId: number, locale: Locale): Promise<OrderV2> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/cancel/`, {
    method: 'POST',
    headers: buildHeaders(locale),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

export const useCancelOrderV2 = () => {
  const locale = useLocale() as Locale;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) => cancelOrderApi(orderId, locale),
    onSuccess: (cancelled, orderId) => {
      queryClient.setQueryData(['order', orderId, locale], cancelled);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-infinite'] });
      gcPendingPaymentsForOrders([cancelled]);
    },
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
