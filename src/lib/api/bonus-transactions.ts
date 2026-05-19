import { useQuery } from '@tanstack/react-query';
import { API_V2_URL } from '../config';
import { authedFetch } from './authed-fetch';
import { AuthApiError } from './auth';
import { useAuthStore } from '@/store/auth';

/**
 * GET /api/v2/client/bonus/transactions/ — Bearer.
 *
 * Контракт Kuma 2026-05-19 + 2026-05-19/05-20:
 *  - amount integer-строка ("50"); дробных бонусов нет;
 *  - venueSlug / venueName (фильтрация и отображение по филиалу);
 *  - balanceAfter (null для исторических записей до 2026-05-19).
 *
 * Поля на проводе camelCase (свагер). Бэк-middleware конвертирует snake↔camel
 * прозрачно — фронту не нужен дополнительный слой.
 */

export type BonusTransactionKind =
  | 'accrual'
  | 'redeem'
  | 'promo'
  | 'gift'
  | 'adjust_plus'
  | 'adjust_minus'
  | 'expire'
  | 'refund';

export interface BonusTransaction {
  id: number;
  kind: BonusTransactionKind;
  /** integer-строка, например "50". Дробных бонусов не бывает. */
  amount: string;
  isCredit: boolean;
  createdAt: string;
  orderId: number | null;
  title: string;
  subtitle: string;
  /** Slug филиала, в котором произошла операция. null для системных записей. */
  venueSlug: string | null;
  /** Название филиала для отображения. null если venueSlug=null. */
  venueName: string | null;
  /** Баланс клиента после этой операции. null у исторических записей до 2026-05-19. */
  balanceAfter: number | null;
}

export interface BonusTransactionsSummary {
  balance: number;
  /** decimal-string */
  earnedTotal: string;
  /** decimal-string */
  redeemedTotal: string;
}

export interface BonusTransactionsResponse {
  count: number;
  summary: BonusTransactionsSummary;
  results: BonusTransaction[];
}

export interface BonusTransactionsParams {
  venueSlug?: string;
  /** YYYY-MM-DD */
  from?: string;
  /** YYYY-MM-DD */
  to?: string;
  kind?: BonusTransactionKind;
  limit?: number;
  offset?: number;
}

function buildQuery(params: BonusTransactionsParams): string {
  const q = new URLSearchParams();
  // Per swagger query params — camelCase (venueSlug, не venue_slug).
  if (params.venueSlug) q.append('venueSlug', params.venueSlug);
  if (params.from) q.append('from', params.from);
  if (params.to) q.append('to', params.to);
  if (params.kind) q.append('kind', params.kind);
  if (params.limit != null) q.append('limit', String(params.limit));
  if (params.offset != null) q.append('offset', String(params.offset));
  return q.toString();
}

export async function fetchBonusTransactions(
  params: BonusTransactionsParams,
): Promise<BonusTransactionsResponse> {
  const qs = buildQuery(params);
  const url = `${API_V2_URL}/client/bonus/transactions/${qs ? `?${qs}` : ''}`;
  const res = await authedFetch(url, { method: 'GET', requireAuth: true });
  if (!res.ok) {
    throw new AuthApiError(`bonus_tx_failed_${res.status}`, res.status);
  }
  return (await res.json()) as BonusTransactionsResponse;
}

export function useBonusTransactions(params: BonusTransactionsParams) {
  const hasToken = useAuthStore((s) => !!s.accessToken);
  return useQuery({
    queryKey: [
      'bonus-transactions',
      params.venueSlug ?? null,
      params.from ?? null,
      params.to ?? null,
      params.kind ?? null,
      params.limit ?? null,
      params.offset ?? null,
    ],
    queryFn: () => fetchBonusTransactions(params),
    enabled: hasToken,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}
