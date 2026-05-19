import { useQuery } from '@tanstack/react-query';
import { API_V2_URL } from '../config';
import { authedFetch } from './authed-fetch';
import { AuthApiError } from './auth';
import { readSnakeJson } from './case';
import { useAuthStore } from '@/store/auth';

/**
 * GET /api/v2/client/bonus/transactions/ — Bearer.
 *
 * Контракт Kuma 2026-05-19 (см. project_auth_profile_contract §4).
 * Поля бэка — snake_case; конвертируем один раз через readSnakeJson.
 *
 * Открытые вопросы (см. KUMA_REQUEST_FOLLOWUP §2.2, §2.3):
 *  - amount приходит decimal-строкой ("50.00"), хотя бонусы трактуются
 *    как integer-сом — округляем для отображения;
 *  - venueSlug/balanceAfter/expiringSoon в строках пока нет.
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
  /** decimal-string, например "50.00". Округляем при отображении. */
  amount: string;
  isCredit: boolean;
  createdAt: string;
  orderId: number | null;
  title: string;
  subtitle: string;
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
  if (params.venueSlug) q.append('venue_slug', params.venueSlug);
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
  return readSnakeJson<BonusTransactionsResponse>(res);
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
