import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import {
  BonusResponse,
  OrderCreateBody,
  OrderCreateResponse,
  OrdersResponse,
} from '../order';
import { API_URL, API_V2_URL } from '../config';
import { Product, Promotion } from '@/types/api';
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
}

async function fetchOrders(
  { phone }: OrdersParams,
  locale: Locale,
): Promise<OrdersResponse> {
  const params = new URLSearchParams();
  if (phone) params.append('phone', phone);

  const res = await fetch(`${API_BASE}/orders/?${params.toString()}`, {
    method: 'GET',
    headers: buildHeaders(locale),
  });

  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export const useOrdersV2 = ({ phone, venueSlug }: OrdersParams) => {
  const locale = useLocale() as Locale;

  return useQuery({
    queryKey: ['orders', phone, venueSlug, locale],
    queryFn: () => fetchOrders({ phone, venueSlug }, locale),
    // Не грузим, если телефона нет
    enabled: !!phone && phone.length > 5,
    refetchInterval: 15000, // Обновляем каждые 15 сек
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
  params.append('phone', phone); // Важно: имя параметра как в Swagger
  params.append('venueSlug', venueSlug);

  const res = await fetch(`${API_BASE}/client/bonus/?${params.toString()}`, {
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

    // Бонусы не меняются каждую секунду, можно не обновлять слишком часто
    staleTime: 1000 * 60 * 5, // 5 минут кеша
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
    venue_slug: venueSlug,
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

async function fetchPromotions(
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
