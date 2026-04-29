import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { API_V2_URL } from '../config';
import type { Locale } from '../locale';
import {
  PosOrder,
  PosOrderSnake,
  normalizePosOrder,
} from '@/types/pos-order';

interface CurrentOrderResponse {
  order: PosOrderSnake | null;
}

async function fetchCurrentOrder(
  tableId: number,
  locale: Locale,
): Promise<PosOrder | null> {
  const res = await fetch(
    `${API_V2_URL}/pos-orders/tables/${tableId}/current-order/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale,
      },
    },
  );

  if (!res.ok) throw new Error('Failed to fetch current POS order');
  const data: CurrentOrderResponse = await res.json();
  return normalizePosOrder(data.order);
}

export const useCurrentPosOrder = (tableId: number | null | undefined) => {
  const locale = useLocale() as Locale;

  return useQuery<PosOrder | null>({
    queryKey: ['pos-order', 'current', tableId, locale],
    queryFn: () => fetchCurrentOrder(tableId as number, locale),
    enabled: !!tableId,
  });
};

export interface PaymentLinkResponse {
  transaction_id: number;
  payment_url: string;
}

async function createPaymentLink(
  orderId: number,
  locale: Locale,
): Promise<PaymentLinkResponse> {
  const res = await fetch(`${API_V2_URL}/pos-orders/${orderId}/payment-link/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': locale,
    },
  });

  if (!res.ok) {
    const errData = await res
      .json()
      .catch(() => ({ error: 'Network error' }));
    throw errData;
  }

  return res.json();
}

export const useCreatePosPaymentLink = () => {
  const locale = useLocale() as Locale;

  return useMutation({
    mutationFn: (orderId: number) => createPaymentLink(orderId, locale),
  });
};
