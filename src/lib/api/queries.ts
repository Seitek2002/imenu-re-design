import { useMutation, useQuery } from '@tanstack/react-query';
import {
  BonusResponse,
  OrderCreateBody,
  OrderCreateResponse,
  OrdersResponse,
} from '../order';

const API_BASE = 'https://imenu.kg/api/v2';

interface OrdersParams {
  phone: string;
  venueSlug?: string;
}

async function fetchOrders({ phone }: OrdersParams): Promise<OrdersResponse> {
  // Уточни у бека, как передавать телефон: ?client_phone=... или ?phone=...
  const params = new URLSearchParams();
  if (phone) params.append('client_phone', phone);

  const res = await fetch(`${API_BASE}/orders/?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export const useOrdersV2 = ({ phone, venueSlug }: OrdersParams) => {
  return useQuery({
    queryKey: ['orders', phone, venueSlug],
    queryFn: () => fetchOrders({ phone, venueSlug }),
    // Не грузим, если телефона нет
    enabled: !!phone && phone.length > 5,
    refetchInterval: 15000, // Обновляем каждые 15 сек
  });
};

async function fetchClientBonus({
  phone,
  venueSlug,
}: {
  phone: string;
  venueSlug: string;
}): Promise<BonusResponse> {
  const params = new URLSearchParams();
  params.append('phone', phone); // Важно: имя параметра как в Swagger
  params.append('venueSlug', venueSlug);

  const res = await fetch(`${API_BASE}/client/bonus/?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
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
  return useQuery({
    queryKey: ['bonus', phone, venueSlug], // Уникальный ключ кеша
    queryFn: () => fetchClientBonus({ phone, venueSlug }),

    // Грузим только если есть телефон и слаг
    enabled: !!phone && phone.length > 5 && !!venueSlug,

    // Бонусы не меняются каждую секунду, можно не обновлять слишком часто
    staleTime: 1000 * 60 * 5, // 5 минут кеша
  });
};

async function createOrderApi({
  body,
  venueSlug,
}: {
  body: OrderCreateBody;
  venueSlug: string;
}): Promise<OrderCreateResponse> {
  const payload = {
    ...body,
    venue_slug: venueSlug,
  };

  const res = await fetch(`${API_BASE}/orders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  return useMutation({
    mutationFn: createOrderApi,
  });
};
