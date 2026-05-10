import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { API_V2_URL } from '../config';
import type { Locale } from '../locale';
import type { PosOrder } from '@/types/pos-order';

interface CurrentOrderResponse {
  order: PosOrder | null;
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
  return data.order;
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
  transactionId?: number;
  paymentUrl?: string;
  totalPrice?: string;
  bonus?: number;
  phoneVerificationHash?: string;
  status?: string;
  message?: string;
}

interface CreatePaymentLinkArgs {
  orderId: number;
  phone: string;
  bonus?: number;
  code?: string;
  hash?: string;
}

async function createPaymentLink(
  { orderId, phone, bonus, code, hash }: CreatePaymentLinkArgs,
  locale: Locale,
): Promise<PaymentLinkResponse> {
  const body: Record<string, unknown> = { phone };
  if (bonus && bonus > 0) {
    body.useBonus = true;
    body.bonus = bonus;
  }
  if (code) body.code = code;
  if (hash) body.hash = hash;

  const res = await fetch(`${API_V2_URL}/pos-orders/${orderId}/payment-link/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': locale,
    },
    body: JSON.stringify(body),
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
    mutationFn: (args: CreatePaymentLinkArgs) => createPaymentLink(args, locale),
  });
};
